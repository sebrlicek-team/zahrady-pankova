import {escape,image,link,section} from '../lib/html.mjs';
export default s=>section(s,`<div class="split">${image(s.image)}<div>${s.paragraphs.map(x=>`<p>${escape(x)}</p>`).join('')}${s.link?link(s.link):''}</div></div>`);
