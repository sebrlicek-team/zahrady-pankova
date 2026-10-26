import {escape,section} from '../lib/html.mjs';
export default s=>section(s,`<ol class="steps">${s.items.map(x=>`<li><h3>${escape(x.title)}</h3><p>${escape(x.text)}</p></li>`).join('')}</ol>`);
