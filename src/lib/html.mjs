export const escape = value => String(value ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
export function url(value) {
  if (typeof value !== 'string' || !value || /[\s\x00-\x1f\\]/.test(value)) throw new Error(`Neplatná URL: ${value}`);
  if (value.startsWith('/') && !value.startsWith('//') || value.startsWith('#')) return escape(value);
  if (/^(https?:|mailto:|tel:)/i.test(value)) return escape(value);
  throw new Error(`Nepovolená URL: ${value}`);
}
export const link = (item, className='button') => `<a class="${className}" href="${url(item.href)}">${escape(item.label)}</a>`;
export const image = (item, eager=false) => `<img src="${url(item.src)}" alt="${escape(item.alt)}" ${eager?'fetchpriority="high"':'loading="lazy"'} decoding="async" width="${item.width || 1200}" height="${item.height || 800}">`;
export const heading = s => `<div class="section-heading"><div>${s.eyebrow?`<p class="eyebrow">${escape(s.eyebrow)}</p>`:''}<h2>${escape(s.title)}</h2></div>${s.intro?`<p>${escape(s.intro)}</p>`:''}</div>`;
export const section = (s, body, cls='') => `<section id="${escape(s.id)}" class="section ${cls}" data-module="${escape(s.type)}">${heading(s)}${body}</section>`;
