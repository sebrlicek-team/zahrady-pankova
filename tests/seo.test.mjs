import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import {checkSeo} from '../scripts/check-seo.mjs';
import {renderPage} from '../src/page.mjs';
import {build,root} from '../scripts/build.mjs';
test('SEO přepnutí náhledu na produkci a odmítnutí poškozené sitemap',async()=>{
 const out=await fs.mkdtemp(path.join(os.tmpdir(),'ccn-seo-'));
 try{
  const site=JSON.parse(await fs.readFile(path.join(root,'sites/showcase.json'),'utf8'));
  await build('showcase',out);await checkSeo(out,site);
  site.indexable=true;site.url='https://klient.cz/';
  for(const page of site.pages)await fs.writeFile(path.join(out,page.path.slice(1),'index.html'),renderPage(site,page));
  const sitemap='<urlset>'+site.pages.map(p=>'<url><loc>'+new URL(p.path,site.url).href+'</loc></url>').join('')+'</urlset>';
  await fs.writeFile(path.join(out,'sitemap.xml'),sitemap);
  await fs.writeFile(path.join(out,'robots.txt'),'User-agent: *\nAllow: /\nSitemap: https://klient.cz/sitemap.xml\n');
  await fs.writeFile(path.join(out,'_headers'),'/*\n  X-Content-Type-Options: nosniff\n');
  await checkSeo(out,site);
  await fs.writeFile(path.join(out,'sitemap.xml'),sitemap.replace('https://klient.cz/','https://wrong.cz/'));
  await assert.rejects(checkSeo(out,site),/Sitemap/);
  await fs.writeFile(path.join(out,'sitemap.xml'),sitemap);
  await fs.writeFile(path.join(out,'_headers'),'/*\n  X-Robots-Tag: noindex\n');
  await assert.rejects(checkSeo(out,site),/hlavičky/);
 }finally{await fs.rm(out,{recursive:true,force:true});}
});
