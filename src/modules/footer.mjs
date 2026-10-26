import {escape,link} from '../lib/html.mjs';
export default site => `<footer class="footer"><strong>${escape(site.name)}</strong><p>${escape(site.footer)}</p><div>${(site.footerLinks||[]).map(x=>link(x,'nav-link')).join('')}</div><a href="#top">Zpět nahoru ↑</a></footer>`;
