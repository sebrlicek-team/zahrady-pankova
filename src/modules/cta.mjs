import {escape,link} from '../lib/html.mjs';
export default s=>`<section class="cta section" id="${escape(s.id)}" data-module="cta"><p class="eyebrow">${escape(s.eyebrow)}</p><h2>${escape(s.title)}</h2><p>${escape(s.intro)}</p>${link(s.link)}</section>`;
