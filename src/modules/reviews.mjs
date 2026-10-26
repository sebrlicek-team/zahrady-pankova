import {escape,section,link} from '../lib/html.mjs';
export default s=>section(s,`<div class="module-grid">${s.items.map(x=>`<figure class="module-card review"><blockquote><p>„${escape(x.quote)}“</p></blockquote><figcaption><strong>${escape(x.name)}</strong>${x.context?`<p>${escape(x.context)}</p>`:''}${x.source?link(x.source,'text-link'):''}</figcaption></figure>`).join('')}</div>`);
