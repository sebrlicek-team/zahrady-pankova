import fs from 'node:fs/promises';
import path from 'node:path';
import {escape} from '../src/lib/html.mjs';
export async function checkSeo(out,site){
 const fail=message=>{throw new Error('SEO kontrola: '+message);};
 const sitemap=await fs.readFile(path.join(out,'sitemap.xml'),'utf8');
 const expected=site.pages.map(p=>escape(new URL(p.path,site.url).href));
 const actual=[...sitemap.matchAll(/<loc>(.*?)<\/loc>/g)].map(m=>m[1]);
 if(JSON.stringify(actual)!==JSON.stringify(expected))fail('Sitemap neodpovídá stránkám a hlavní doméně.');
 const robots=await fs.readFile(path.join(out,'robots.txt'),'utf8');
 const headers=await fs.readFile(path.join(out,'_headers'),'utf8');
 if(site.indexable){
  if(!robots.includes('Sitemap: '+new URL('/sitemap.xml',site.url).href)||/^Disallow:\s*\/\s*$/m.test(robots))fail('Produkční robots.txt nepovoluje správnou indexaci.');
  if(/noindex/i.test(headers))fail('Produkční HTTP hlavičky zakazují indexaci.');
 }else if(!robots.includes('Disallow: /')||!headers.includes('X-Robots-Tag: noindex'))fail('Náhled musí zakazovat indexaci.');
 for(const page of site.pages){
  const html=await fs.readFile(path.join(out,page.path.slice(1),'index.html'),'utf8');
  const canonical=[...html.matchAll(/<link rel="canonical" href="([^"]+)"/g)].map(m=>m[1]);
  if(canonical.length!==1||canonical[0]!==escape(new URL(page.path,site.url).href))fail('Neplatný canonical: '+page.path);
  const policy=site.indexable?'index,follow':'noindex,nofollow';
  if(!html.includes('<meta name="robots" content="'+policy+'">'))fail('Neplatná indexace stránky: '+page.path);
 }
}
