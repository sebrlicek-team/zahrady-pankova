import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import {build,root,files,inspectAssets,checkLinks} from '../scripts/build.mjs';
import {validate} from '../src/lib/validate.mjs';
import {renderPage} from '../src/page.mjs';
const config=()=>fs.readFile(path.join(root,'sites/showcase.json'),'utf8').then(JSON.parse);
for(const name of ['showcase','milacek','beran','italboats'])test(`Sestavení ${name}: odkazy, SEO, oddělení zdrojů`,async()=>{
 const tmp=await fs.mkdtemp(path.join(os.tmpdir(),'ccn-test-'));try{await build(name,tmp);const paths=await files(tmp);assert(paths.some(x=>x.endsWith('detail/index.html')));assert(!paths.some(x=>x.includes('/src/')||x.includes('/sites/')||x.endsWith('wrangler.jsonc')));const html=await fs.readFile(path.join(tmp,'index.html'),'utf8');assert.match(html,/noindex,nofollow/);assert.equal((html.match(/<h1[ >]/g)||[]).length,1);assert.equal((html.match(/<form /g)||[]).length,1);assert.match(html,new RegExp(`data-mode="${name==='showcase'?'server':'demo'}"`));}finally{await fs.rm(tmp,{recursive:true,force:true});}
});
test('Odmítne nebezpečné URL, neznámé moduly a duplicitní ID',async()=>{
 let s=await config();s.pages[0].sections[0].actions[0].href='javascript:alert(1)';assert.throws(()=>validate(s),/URL/);
 s=await config();s.pages[0].sections[1].type='unknown';assert.throws(()=>validate(s),/Neznámý modul/);
 s=await config();s.pages[0].sections[1].id='uvod';assert.throws(()=>validate(s),/duplicitní/);
 s=await config();s.pages[0].path='/../../x/';assert.throws(()=>validate(s),/cesta/);
});
test('Nezamění ukázkový formulář za produkční odesílání',async()=>{const s=await config();s.indexable=true;s.url='https://example.com';s.pages[0].sections.find(x=>x.type==='contact').form.mode='demo';assert.throws(()=>validate(s),/demo formulář/);});
test('Text z konfigurace nemůže vložit HTML',async()=>{const s=await config();s.pages[0].sections[0].title='<script>alert(1)</script>';const html=renderPage(validate(s),s.pages[0]);assert.match(html,/&lt;script&gt;/);assert(!html.includes('<script>alert'));});
test('Přeskupení a vypnutí volitelných modulů',async()=>{const s=await config();const p=s.pages[0];p.sections=[p.sections[0],p.sections.find(x=>x.type==='contact'),p.sections[2]];assert.doesNotThrow(()=>validate(s));const html=renderPage(s,p);assert(html.indexOf('data-module="contact"')<html.indexOf('data-module="cards"'));});
test('Video a externí přehrávač mají alternativu a povolený původ',async()=>{const s=await config();const m=s.pages[0].sections[0].media;m.kind='video';m.video='/assets/banner.mp4';let html=renderPage(validate(s),s.pages[0]);assert.match(html,/preload="none"/);assert.match(html,/data-src="\/assets\/banner.mp4"/);m.kind='embed';m.embed='https://player.vimeo.com/video/916650966';html=renderPage(validate(s),s.pages[0]);assert(!html.includes('<iframe'));m.embed='https://untrusted.example/player';assert.throws(()=>validate(s),/Externí video/);});
test('Odmítne nadlimitní soubor i technickou složku v public',async()=>{const tmp=await fs.mkdtemp(path.join(os.tmpdir(),'ccn-assets-'));try{const f=await fs.open(path.join(tmp,'big.mp4'),'w');await f.truncate(25*1024*1024+1);await f.close();await assert.rejects(inspectAssets(tmp),/25 MiB/);await fs.rm(path.join(tmp,'big.mp4'));await fs.mkdir(path.join(tmp,'.git'));await fs.writeFile(path.join(tmp,'.git','HEAD'),'x');await assert.rejects(inspectAssets(tmp),/Technický soubor/);}finally{await fs.rm(tmp,{recursive:true,force:true});}});
test('Chybějící soubor nebo kotva zastaví kontrolu',async()=>{const tmp=await fs.mkdtemp(path.join(os.tmpdir(),'ccn-links-'));try{await fs.writeFile(path.join(tmp,'index.html'),'<a href="/missing/">x</a>');await assert.rejects(checkLinks(tmp),/Chybějící soubor/);await fs.writeFile(path.join(tmp,'index.html'),'<a href="#missing">x</a>');await assert.rejects(checkLinks(tmp),/Chybějící kotva/);}finally{await fs.rm(tmp,{recursive:true,force:true});}});

test('Mapa se nenačítá bez kliknutí a adresa je bezpečně zakódovaná',async()=>{const s=await config();const m=s.pages[0].sections.find(x=>x.type==='location');m.address='Praha & okolí <test>';const html=renderPage(validate(s),s.pages[0]);assert(!html.includes('<iframe'));assert.match(html,/data-map/);assert.match(html,/Praha%20%26%20okol/);m.embed=false;assert(!renderPage(validate(s),s.pages[0]).includes('data-map'));});
test('Nové moduly odmítnou neplatné kontakty a nebezpečné odkazy',async()=>{let s=await config();s.pages[0].sections.find(x=>x.type==='team').items[0].email='x?bcc=y@example.com';assert.throws(()=>validate(s),/e-mail/);s=await config();s.pages[0].sections.find(x=>x.type==='downloads').items[0].href='javascript:alert(1)';assert.throws(()=>validate(s),/URL/);s=await config();s.pages[0].sections.find(x=>x.type==='reviews').items[0].source={label:'Zdroj',href:'javascript:alert(1)'};assert.throws(()=>validate(s),/URL/);});

test('Serverový formulář přebírá společný endpoint a Turnstile bez nastavení příjemce ve webu',async()=>{
 const s=await config();s.pages[0].sections.find(x=>x.type==='contact').form={mode:'server'};
 const html=renderPage(validate(s),s.pages[0]);
 assert.match(html,/data-endpoint="https:\/\/template.ccn-dev.cz\/api\/forms"/);
 assert.match(html,/data-form-id="contact"/);assert.match(html,/data-sitekey="0x/);
 assert(!html.includes('data-recipient='));
});
