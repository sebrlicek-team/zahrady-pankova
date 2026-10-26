import {serverFormDefaults} from './form-config.mjs';
import {modules} from '../modules/index.mjs';
import {url} from './html.mjs';
const fail=message=>{throw new Error(message);};
const text=(v,name)=>{if(typeof v!=='string'||!v.trim())fail(`Chybí text: ${name}`);};
const list=(v,name)=>{if(!Array.isArray(v)||!v.length)fail(`Prázdný seznam: ${name}`);};
function media(m){if(!m||typeof m!=='object')fail('Chybí obrázek');url(m.src);text(m.alt,'popis obrázku');if(m.kind==='video')url(m.video);if(m.kind==='embed'){const u=new URL(m.embed);if(u.protocol!=='https:'||!['player.vimeo.com','www.youtube-nocookie.com'].includes(u.hostname))fail('Externí video musí být z Vimeo nebo youtube-nocookie');}if(m.kind&&!['image','video','embed'].includes(m.kind))fail('Neznámý typ média');}
function link(x){text(x.label,'odkaz');url(x.href);}
export function validate(site){
 text(site.name,'název webu');text(site.tagline,'podtitulek');
 const origin=new URL(site.url);if(origin.protocol!=='https:'||origin.pathname!=='/'||origin.search||origin.hash)fail('URL webu musí být HTTPS doména bez cesty');
 if(typeof site.indexable!=='boolean')fail('Nastav indexable na true nebo false');
 for(const key of ['accent','ink','paper'])if(!/^#[0-9a-f]{6}$/i.test(site.theme?.[key]))fail(`Barva ${key} musí mít formát #rrggbb`);
 list(site.navigation,'navigace');site.navigation.forEach(link);(site.footerLinks||[]).forEach(link);
 list(site.pages,'stránky');const paths=new Set();
 for(const page of site.pages){
  if(!/^\/(?:[a-z0-9-]+\/)*$/.test(page.path)||paths.has(page.path))fail(`Neplatná nebo duplicitní cesta: ${page.path}`);paths.add(page.path);
  text(page.title,'titulek stránky');text(page.description,'popis stránky');list(page.sections,'sekce');const ids=new Set(['top','main','navigation']);
  if(page.sections.filter(s=>s.type==='hero').length!==1)fail('Každá stránka musí obsahovat právě jeden hero s H1');
  for(const s of page.sections){
   if(!modules[s.type])fail(`Neznámý modul: ${s.type}`);
   if(!/^[a-z][a-z0-9-]*$/.test(s.id)||ids.has(s.id))fail(`Neplatné nebo duplicitní ID: ${s.id}`);ids.add(s.id);text(s.title,'nadpis sekce');
   if(s.type==='hero'){media(s.media);if(s.variant&&!['split','cover'].includes(s.variant))fail('Neznámá varianta hero');(s.actions||[]).forEach(link);}
   if(['stats','cards','steps','specs','destinations','faq'].includes(s.type))list(s.items,s.type);
   if(['reviews','partners','team','downloads'].includes(s.type))list(s.items,s.type);
   if(s.type==='location'){text(s.address,'adresa');if(s.mapQuery)text(s.mapQuery,'bod mapy');if(s.embed!==undefined&&typeof s.embed!=='boolean')fail('embed musí být boolean');(s.hours||[]).forEach(x=>{text(x.label,'den');text(x.value,'hodiny');});if(s.phone&&!/^[+0-9 ()-]+$/.test(s.phone))fail('Neplatný telefon');}
   if(s.type==='reviews')s.items.forEach(x=>{text(x.quote,'hodnocení');text(x.name,'autor');if(x.source)link(x.source);});
   if(s.type==='partners')s.items.forEach(x=>{text(x.name,'partner');if(x.image)media(x.image);if(x.href)url(x.href);});
   if(s.type==='team')s.items.forEach(x=>{text(x.name,'jméno');text(x.role,'role');if(x.image)media(x.image);if(x.phone&&!/^[+0-9 ()-]+$/.test(x.phone))fail('Neplatný telefon');if(x.email){if(!/^[^\s@<>?&#]+@[^\s@<>?&#]+\.[^\s@<>?&#]+$/.test(x.email))fail('Neplatný e-mail týmu');if(site.indexable&&x.email.endsWith('.invalid'))fail('Nahraďte ukázkový e-mail týmu');}});
   if(s.type==='downloads')s.items.forEach(x=>{text(x.title,'dokument');url(x.href);if(!(x.href.startsWith('/')&&!x.href.startsWith('//'))&&!/^https:\/\//.test(x.href))fail('Dokument musí mít lokální nebo HTTPS adresu');});
   if(s.type==='cards')s.items.forEach(x=>{text(x.title,'karta');text(x.text,'popis karty');if(x.image)media(x.image);if(x.link)link(x.link);});
   if(s.type==='gallery'){list(s.images,'galerie');s.images.forEach(media);}
   if(s.type==='split'){media(s.image);list(s.paragraphs,'odstavce');s.paragraphs.forEach(x=>text(x,'odstavec'));if(s.link)link(s.link);}
   if(s.type==='destinations'){if(s.image)media(s.image);s.items.forEach(x=>text(x,'destinace'));}
   if(['stats','specs'].includes(s.type))s.items.forEach(x=>{text(x.label,'parametr');text(x.value,'hodnota');});
   if(s.type==='steps')s.items.forEach(x=>{text(x.title,'krok');text(x.text,'popis kroku');});
   if(s.type==='faq')s.items.forEach(x=>{text(x.question,'otázka');text(x.answer,'odpověď');});
   if(s.type==='cta')link(s.link);
   if(s.type==='contact'){if(s.form?.mode==='server')s.form={...serverFormDefaults,...s.form};if(!/^[^\s@<>?&#]+@[^\s@<>?&#]+\.[^\s@<>?&#]+$/.test(s.email))fail('Neplatný kontaktní e-mail');if(s.form&&!['demo','mailto','server'].includes(s.form.mode))fail('Neznámý režim formuláře.');if(s.form?.mode==='server'){if(!/^[a-z0-9-]{1,60}$/.test(s.form.id||'')||!/^0x[A-Za-z0-9_-]+$/.test(s.form.sitekey||''))fail('Serverový formulář vyžaduje ID a Turnstile sitekey');if(s.form.endpoint!=='/api/forms'&&!/^https:\/\/[^/]+\/api\/forms$/.test(s.form.endpoint||''))fail('Neplatný endpoint formuláře');}if(site.indexable&&s.form?.mode==='demo')fail('Produkční web nesmí obsahovat demo formulář');if(site.indexable&&s.email.endsWith('.invalid'))fail('Nahraďte ukázkový e-mail');}
  }
 }
 if(!paths.has('/'))fail('Chybí úvodní stránka /');
 if(site.indexable&&(origin.hostname.endsWith('.invalid')||origin.hostname.endsWith('.example')))fail('Pro produkci nastavte skutečnou doménu');
 return site;
}
