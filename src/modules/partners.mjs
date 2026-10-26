import {escape,section,image,link} from '../lib/html.mjs';
export default s=>section(s,`<ul class="module-grid partner-list">${s.items.map(x=>`<li class="module-card">${x.image?image(x.image):''}${x.href?link({label:x.name,href:x.href},'text-link'):`<strong>${escape(x.name)}</strong>`}</li>`).join('')}</ul>`);
