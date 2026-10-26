import {escape,section} from '../lib/html.mjs';
export default s=>section(s,`<dl class="specs">${s.items.map(x=>`<div><dt>${escape(x.label)}</dt><dd>${escape(x.value)}</dd></div>`).join('')}</dl>`);
