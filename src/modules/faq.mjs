import {escape,section} from '../lib/html.mjs';
export default s=>section(s,`<div class="faq">${s.items.map(x=>`<details><summary>${escape(x.question)}</summary><p>${escape(x.answer)}</p></details>`).join('')}</div>`);
