import {escape,image,section} from '../lib/html.mjs';
export default s=>section(s,`${s.image?image(s.image):''}<ul class="tags">${s.items.map(x=>`<li>${escape(x)}</li>`).join('')}</ul>`);
