// Server-only registry. A preview site needs only its subdomain and approved recipient(s).
// Never read the destination from submitted form fields or a client-side site configuration.
export const previewRecipients = {
  template: ['arnost.stepanek@gmail.com'],
};

// Production uses a separate entry: { id, origins: ['https://client.cz'], to: [...],
// name: 'Client', subject: 'Nová poptávka', dailyLimit: 20 }. No preview-recipient fallback.
export const productionForms = {};
export const globalDailyLimit = 20;

export function previewHostname(origin) {
  try {
    const u = new URL(origin);
    if (u.origin !== origin || u.protocol !== 'https:' || u.port || !u.hostname.endsWith('.ccn-dev.cz')) return null;
    const name = u.hostname.slice(0, -'.ccn-dev.cz'.length);
    return name && name.split('.').every(label => /^[a-z0-9](?:[a-z0-9-]*[a-z0-9])?$/.test(label)) ? name : null;
  } catch { return null; }
}

export function buildForms(previews = previewRecipients, production = productionForms) {
  const entries = Object.entries(previews).map(([name, recipients]) => {
    const origin = `https://${name}.ccn-dev.cz`;
    const id = `${name.replaceAll('.', '_')}-contact`;
    if (!previewHostname(origin) || id.length > 60) throw new Error('Neplatná testovací subdoména.');
    return [id, {id, mode: 'preview', origins: [origin], to: recipients,
      from: `CCN test – ${name} <forms@ccn.cz>`, subject: `[TEST] Formulář ${name}.ccn-dev.cz`, dailyLimit: 20}];
  });
  for (const [id, config] of Object.entries(production)) {
    if (!/^[a-z0-9_-]{1,60}$/.test(id) || entries.some(([key]) => key === id) || !Array.isArray(config.origins) || !config.origins.length) throw new Error('Neplatná produkční konfigurace.');
    for (const origin of config.origins) {
      const u = new URL(origin);
      if (u.origin !== origin || u.protocol !== 'https:' || u.port || previewHostname(origin) || u.hostname === 'ccn-dev.cz') throw new Error('Produkční doména nesmí být testovací.');
    }
    entries.push([id, {...config, id, mode: 'production', from: `${config.name || 'CCN'} – formulář <forms@ccn.cz>`, subject: config.subject || 'Nová zpráva z webu', dailyLimit: config.dailyLimit || 20}]);
  }
  const origins = new Set();
  for (const [, config] of entries) {
    if (!Array.isArray(config.to) || !config.to.length || config.to.length > 5 || config.to.some(email => typeof email !== 'string' || !/^[^\s@<>?,;]+@[^\s@<>?,;]+\.[^\s@<>?,;]+$/.test(email))) throw new Error('Nastavte 1 až 5 platných příjemců formuláře.');
    config.to = [...new Set(config.to)];
    for (const origin of config.origins) { if (origins.has(origin)) throw new Error('Doména má více příjemcovských konfigurací.'); origins.add(origin); }
  }
  return Object.fromEntries(entries);
}
export const forms = buildForms();
export function allowedOrigin(origin, registry = forms) {
  return Boolean(previewHostname(origin) || Object.values(registry).some(config => config.origins.includes(origin)));
}
export function resolveForm(origin, action, registry = forms) {
  const config = Object.values(registry).find(config => config.origins.includes(origin));
  // Keep the original template action working for already-open browser tabs.
  return config && (action === 'contact' || (config.id === 'template-contact' && action === 'template-contact')) ? config : null;
}
