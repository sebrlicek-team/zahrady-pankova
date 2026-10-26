import {escape,url,image,link} from '../lib/html.mjs';
export default s => {
 const media=s.media;
 let visual=image(media,true);
 if(media.kind==='video') visual=`<div data-video><video muted loop playsinline preload="none" poster="${url(media.src)}" aria-label="${escape(media.alt)}"><source data-src="${url(media.video)}" type="video/mp4"></video><button type="button" data-video-toggle hidden>Přehrát video</button><noscript>${image(media,true)}</noscript></div>`;
 if(media.kind==='embed') visual=`<div data-embed data-src="${url(media.embed)}" data-title="${escape(media.alt)}">${image(media,true)}<button type="button" data-embed-toggle hidden>Načíst externí video</button><p class="media-note">Video se připojí k externímu poskytovateli až po kliknutí.</p><noscript><a href="${url(media.embed)}">Otevřít video</a></noscript></div>`;
 return `<section id="${escape(s.id)}" class="hero hero--${escape(s.variant||'split')}" data-module="hero"><div class="hero-copy"><p class="eyebrow">${escape(s.eyebrow)}</p><h1>${escape(s.title)}</h1><p class="lead">${escape(s.intro)}</p><div class="actions">${(s.actions||[]).map(x=>link(x)).join('')}</div></div><div class="hero-media">${visual}</div></section>`;
};
