import {escape} from './lib/html.mjs';
import header from './modules/header.mjs';
import footer from './modules/footer.mjs';
import {modules} from './modules/index.mjs';
export function renderPage(site,page){
 const canonical=new URL(page.path,site.url).href;
 return `<!doctype html><html lang="cs" id="top"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><title>${escape(page.title)} | ${escape(site.name)}</title><meta name="description" content="${escape(page.description)}"><meta name="theme-color" content="${site.theme.accent}"><meta name="robots" content="${site.indexable?'index,follow':'noindex,nofollow'}"><link rel="canonical" href="${escape(canonical)}"><meta property="og:title" content="${escape(page.title)}"><meta property="og:description" content="${escape(page.description)}"><meta property="og:type" content="website"><meta property="og:url" content="${escape(canonical)}"><link rel="stylesheet" href="/assets/site.css"><style>:root{--accent:${site.theme.accent};--ink:${site.theme.ink};--paper:${site.theme.paper};--display:${site.theme.serif?'Georgia,serif':'system-ui,sans-serif'}}</style><script type="module" src="/assets/site.js"></script></head><body>${header(site)}<main id="main">${page.sections.map(s=>modules[s.type](s)).join('')}</main>${footer(site)}</body></html>`;
}
