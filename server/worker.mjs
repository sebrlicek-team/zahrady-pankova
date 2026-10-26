import {forms, globalDailyLimit, allowedOrigin, resolveForm} from './forms-config.mjs';

const DAY = 86_400_000;
const MAX_BODY = 24_000;
const json = (body, status = 200) => Response.json(body, {status, headers: {'Cache-Control': 'no-store', 'X-Content-Type-Options': 'nosniff'}});
const error = (message, status) => json({ok: false, message}, status);
const hash = async text => Array.from(new Uint8Array(await crypto.subtle.digest('SHA-256', new TextEncoder().encode(text))), b => b.toString(16).padStart(2, '0')).join('');

export function validateSubmission(data) {
  if (!data || typeof data !== 'object' || Array.isArray(data)) throw new Error('Neplatná data formuláře.');
  const limits = {name: 100, email: 200, phone: 40, message: 4000};
  const fields = {};
  for (const [name, limit] of Object.entries(limits)) {
    const value = data[name] ?? '';
    if (typeof value !== 'string' || value.length > limit || /[\u0000-\u0008\u000b\u000c\u000e-\u001f\u007f]/.test(value)) throw new Error('Zkontrolujte vyplněné údaje a délku zprávy.');
    fields[name] = value.trim();
  }
  if (!fields.name || !fields.message || /[\r\n]/.test(fields.name + fields.phone) || !/^[^\s@<>?,;]+@[^\s@<>?,;]+\.[^\s@<>?,;]+$/.test(fields.email)) throw new Error('Vyplňte jméno, platný e-mail a zprávu.');
  if (typeof data.requestId !== 'string' || !/^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(data.requestId)) throw new Error('Obnovte stránku a zkuste to znovu.');
  return fields;
}

async function readBody(request) {
  if (Number(request.headers.get('Content-Length')) > MAX_BODY) throw new Error('Zpráva je příliš dlouhá.');
  const reader = request.body?.getReader();
  if (!reader) throw new Error('Chybí data formuláře.');
  let size = 0, chunks = [];
  while (true) {
    const {done, value} = await reader.read();
    if (done) break;
    size += value.byteLength;
    if (size > MAX_BODY) { await reader.cancel(); throw new Error('Zpráva je příliš dlouhá.'); }
    chunks.push(value);
  }
  const bytes = new Uint8Array(size); let offset = 0;
  for (const chunk of chunks) { bytes.set(chunk, offset); offset += chunk.length; }
  return JSON.parse(new TextDecoder().decode(bytes));
}

export async function handleForms(request, env, fetcher = fetch) {
  const origin = request.headers.get('Origin');
  const allowed = allowedOrigin(origin);
  if (!allowed) return error('Tento web nemá povolené odesílání.', 403);
  const respond = response => {
    response = new Response(response.body, response);
    response.headers.set('Access-Control-Allow-Origin', origin);
    response.headers.set('Vary', 'Origin');
    return response;
  };
  if (request.method === 'OPTIONS') return respond(new Response(null, {status: 204, headers: {'Access-Control-Allow-Methods': 'POST', 'Access-Control-Allow-Headers': 'Content-Type', 'Access-Control-Max-Age': '600'}}));
  if (request.method !== 'POST') return respond(error('Použijte odeslání formuláře.', 405));
  if (!request.headers.get('Content-Type')?.toLowerCase().startsWith('application/json')) return respond(error('Neplatný formát.', 415));
  if (!env.RESEND_API_KEY || !env.TURNSTILE_SECRET_KEY || !env.FORMS) return respond(error('Odesílání je dočasně nedostupné. Zkuste to prosím později.', 503));
  let data, fields;
  try { data = await readBody(request); fields = validateSubmission(data); }
  catch { return respond(error('Zkontrolujte vyplněné údaje a délku zprávy.', 400)); }
  const config = resolveForm(origin, data.formId);
  if (!config || !config.origins.includes(origin)) return respond(error('Neznámý formulář.', 403));
  if (data.website) return respond(error('Odeslání nebylo přijato.', 400));
  if (typeof data.token !== 'string' || !data.token || data.token.length > 2048) return respond(error('Počkejte na ověření proti spamu a odešlete znovu.', 400));
  try {
    const verification = await fetcher('https://challenges.cloudflare.com/turnstile/v0/siteverify', {
      method: 'POST', headers: {'Content-Type': 'application/json'},
      body: JSON.stringify({secret: env.TURNSTILE_SECRET_KEY, response: data.token, remoteip: request.headers.get('CF-Connecting-IP') || undefined, idempotency_key: data.requestId}),
      signal: AbortSignal.timeout(10_000),
    });
    if (!verification.ok) return respond(error('Ověření proti spamu je dočasně nedostupné.', 503));
    const checked = await verification.json();
    if (!checked.success || checked.hostname !== new URL(origin).hostname || checked.action !== data.formId) return respond(error('Ověření proti spamu vypršelo. Zkuste odeslání znovu.', 400));
    // One shared object enforces aggregate limits across all websites and persists the outbox.
    const stub = env.FORMS.get(env.FORMS.idFromName('ccn-forms-v1'));
    const ip = request.headers.get('CF-Connecting-IP') || 'unknown';
    const ipHash = await hash(`${env.TURNSTILE_SECRET_KEY}:${Math.floor(Date.now() / DAY)}:${ip}`);
    const fingerprint = await hash(JSON.stringify({formId: config.id, ...fields}));
    const result = await stub.fetch('https://internal/submit', {method: 'POST', body: JSON.stringify({origin, formId: config.id, requestId: data.requestId, fingerprint, ipHash, fields})});
    return respond(result);
  } catch {
    console.error('forms_request_failed');
    return respond(error('Přijetí zprávy se nepodařilo potvrdit. Zkuste ji odeslat znovu.', 503));
  }
}

export default {
  async fetch(request, env) {
    const path = new URL(request.url).pathname;
    if (path === '/api/forms') return handleForms(request, env);
    if (path.startsWith('/api/')) return error('Nenalezeno.', 404);
    return env.ASSETS.fetch(request);
  },
};

// Durable storage, idempotent acceptance, an alarm-driven outbox and strict global quotas.
export class FormsOutbox {
  constructor(ctx, env) { this.ctx = ctx; this.env = env; this.storage = ctx.storage; }

  async fetch(request) {
    if (request.method !== 'POST' || new URL(request.url).pathname !== '/submit') return error('Nenalezeno.', 404);
    const submission = await request.json();
    return this.ctx.blockConcurrencyWhile(async () => {
      const {origin, formId, requestId, fingerprint, ipHash, fields} = submission;
      const config = forms[formId];
      if (!config || !config.origins.includes(origin)) return error('Neznámý formulář.', 403);
      const key = `message:${formId}:${requestId}`;
      const existing = await this.storage.get(key);
      if (existing) {
        if (existing.fingerprint !== fingerprint) return error('Pro změněnou zprávu použijte nové odeslání.', 409);
        if (existing.status === 'failed') return error('Zprávu máme uloženou, ale doručení se nezdařilo. Použijte prosím kontaktní e-mail.', 503);
        return json({ok: true, message: 'Zprávu jsme přijali. Děkujeme.', requestId}, 202);
      }
      const now = Date.now(), day = Math.floor(now / DAY), bucket = Math.floor(now / 600_000);
      const old = await this.storage.get('limits');
      const limits = old?.day === day ? old : {day, total: 0, forms: {}, ips: {}};
      // Hashes of IP addresses are retained for at most the current ten-minute bucket.
      for (const [key, value] of Object.entries(limits.ips)) if (value.bucket !== bucket) delete limits.ips[key];
      const ipCount = limits.ips[ipHash]?.count || 0;
      if (limits.total + config.to.length > globalDailyLimit || (limits.forms[formId] || 0) + config.to.length > config.dailyLimit || ipCount >= 3) return error('Byl dosažen limit odesílání. Zkuste to později nebo použijte kontaktní e-mail.', 429);
      limits.total += config.to.length; limits.forms[formId] = (limits.forms[formId] || 0) + config.to.length; limits.ips[ipHash] = {bucket, count: ipCount + 1};
      const text = `Režim: ${config.mode === 'preview' ? 'TESTOVACÍ WEB' : 'OSTRÝ WEB'}\nWeb: ${origin}\nFormulář: ${formId}\nJméno: ${fields.name}\nE-mail: ${fields.email}\nTelefon: ${fields.phone || 'Neuveden'}\n\n${fields.message}\n\nID zprávy: ${requestId}`;
      const message = {requestId, formId, fingerprint, created: now, expires: now + 30 * DAY, next: now, attempts: 0, status: 'pending', payload: {from: config.from, to: config.to, reply_to: fields.email, subject: config.subject, text, tags: [{name: 'form', value: formId}]}};
      // Commit the message, counters and wakeup together before acknowledging acceptance.
      await this.storage.transaction(async tx => {
        await tx.put({[key]: message, limits});
        const alarm = await tx.getAlarm();
        if (!alarm || alarm > now + 1000) await tx.setAlarm(now + 1000);
      });
      return json({ok: true, message: 'Zprávu jsme přijali. Děkujeme.', requestId}, 202);
    });
  }

  async alarm() {
    return this.ctx.blockConcurrencyWhile(async () => {
      const now = Date.now();
      const messages = await this.storage.list({prefix: 'message:'});
      for (const [key, message] of messages) if (message.expires <= now) { await this.storage.delete(key); messages.delete(key); }
      const due = [...messages.entries()].find(([, m]) => m.status === 'pending' && m.next <= now);
      if (due) {
        const [key, message] = due;
        // Resend's idempotency window is 24h; never retry an ambiguous request beyond it.
        if (now - message.created > 20 * 3_600_000) {
          message.status = 'failed'; console.error('forms_delivery_expired', message.requestId);
        } else {
          // Install a watchdog before the external request so worker termination cannot lose a retry.
          await this.storage.setAlarm(now + 60_000);
          message.attempts++;
          try {
            const response = await fetch('https://api.resend.com/emails', {
              method: 'POST', headers: {'Authorization': `Bearer ${this.env.RESEND_API_KEY}`, 'Content-Type': 'application/json', 'Idempotency-Key': `ccn-forms/${message.formId}/${message.requestId}`},
              body: JSON.stringify(message.payload), signal: AbortSignal.timeout(10_000),
            });
            const result = await response.json();
            if (response.ok && result.id) {
              message.status = 'sent'; message.emailId = result.id; delete message.payload;
              console.log('forms_sent', message.requestId, result.id);
            } else {
              message.lastError = `resend_http_${response.status}`;
              if (response.status >= 400 && response.status < 500 && ![408, 429].includes(response.status)) message.status = 'failed';
            }
          } catch { message.lastError = 'resend_unavailable'; }
          if (message.status === 'pending') {
            if (message.attempts >= 8) message.status = 'failed';
            else message.next = now + [60, 300, 900, 3600, 7200, 14400, 21600][message.attempts - 1] * 1000;
          }
          if (message.status === 'failed') console.error('forms_delivery_failed', message.requestId, message.lastError);
        }
        await this.storage.put(key, message);
      }
      const limits = await this.storage.get('limits');
      if (limits && limits.day < Math.floor(now / DAY)) await this.storage.delete('limits');
      // Continue one email at a time, then retain only a daily cleanup alarm.
      let next = Infinity;
      for (const m of messages.values()) next = Math.min(next, m.status === 'pending' ? Math.max(now + 1000, m.next) : m.expires);
      if (Number.isFinite(next)) await this.storage.setAlarm(Math.min(next, now + DAY));
      else await this.storage.deleteAlarm();
    });
  }
}
