import fs from 'node:fs/promises';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {checkSeo} from './check-seo.mjs';
import {selectProject} from './project.mjs';
import {validate} from '../src/lib/validate.mjs';
import {renderPage} from '../src/page.mjs';
import {escape} from '../src/lib/html.mjs';
export const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
export async function files(dir){const result=[];for(const entry of await fs.readdir(dir,{withFileTypes:true})){const p=path.join(dir,entry.name);if(entry.isSymbolicLink())throw new Error(`Symbolický odkaz není povolen: ${p}`);if(entry.isDirectory())result.push(...await files(p));else result.push(p);}return result;}
export async function inspectAssets(dir){
 const all=await files(dir);
 for(const f of all){const rel=path.relative(dir,f);if(rel.split(path.sep).some(part=>part.startsWith('.')&&part!=='.assetsignore'||part==='node_modules')||/^(wrangler\.|package(-lock)?\.json)/.test(path.basename(f)))throw new Error(`Technický soubor v public: ${rel}`);if((await fs.stat(f)).size>25*1024*1024)throw new Error(`Soubor přesahuje 25 MiB: ${rel}. Zmenšete jej nebo použijte externí úložiště.`);}
 return all;
}
export async function checkLinks(dir){
 const all=await files(dir),known=new Set(all.map(f=>'/'+path.relative(dir,f).split(path.sep).join('/'))),docs=new Map();
 for(const f of all.filter(x=>x.endsWith('.html'))){const html=await fs.readFile(f,'utf8');const pathname='/'+path.relative(dir,f).split(path.sep).join('/');const ids=[...html.matchAll(/\bid="([^"]+)"/g)].map(m=>m[1]);if(new Set(ids).size!==ids.length)throw new Error(`Duplicitní ID: ${pathname}`);docs.set(pathname,{html,ids:new Set(ids)});}
 for(const [pathname,{html}] of docs){for(const m of html.matchAll(/\b(?:href|src|poster|data-src)="([^"]+)"/g)){
  const value=m[1].replaceAll('&amp;','&');if(!value.startsWith('/')&&!value.startsWith('#'))continue;
  const u=new URL(value,'https://local.invalid'+pathname);if(u.hostname!=='local.invalid')continue;
  const target=u.pathname.endsWith('/')?u.pathname+'index.html':u.pathname;
  if(!known.has(target))throw new Error(`Chybějící soubor ${value} na ${pathname}`);
  if(u.hash&&docs.has(target)&&!docs.get(target).ids.has(decodeURIComponent(u.hash.slice(1))))throw new Error(`Chybějící kotva ${value} na ${pathname}`);
 }}
}
export async function build(name='showcase',out=path.join(root,'dist')){
 if(!/^[a-z0-9-]+$/.test(name))throw new Error('Neplatný název konfigurace');
 const site=validate(JSON.parse(await fs.readFile(path.join(root,'sites',name+'.json'),'utf8')));
 const assets=await inspectAssets(path.join(root,'public'));
 // Output is restricted to the project's dist directory or a test temporary directory supplied by the caller.
 await fs.rm(out,{recursive:true,force:true});await fs.mkdir(out,{recursive:true});
 for(const f of assets){if(path.basename(f)==='.assetsignore')continue;const dest=path.join(out,path.relative(path.join(root,'public'),f));await fs.mkdir(path.dirname(dest),{recursive:true});await fs.copyFile(f,dest);}
 for(const page of site.pages){const dest=path.join(out,page.path.slice(1),'index.html');await fs.mkdir(path.dirname(dest),{recursive:true});await fs.writeFile(dest,renderPage(site,page));}
 await fs.writeFile(path.join(out,'404.html'),'<!doctype html><html lang="cs"><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Stránka nenalezena</title><h1>Stránka nenalezena</h1><p><a href="/">Zpět na úvod</a></p></html>');
 const sitemap=site.pages.map(p=>`<url><loc>${escape(new URL(p.path,site.url).href)}</loc></url>`).join('');
 await fs.writeFile(path.join(out,'sitemap.xml'),`<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${sitemap}</urlset>`);
 await fs.writeFile(path.join(out,'robots.txt'),site.indexable?`User-agent: *\nAllow: /\nSitemap: ${new URL('/sitemap.xml',site.url).href}\n`:'User-agent: *\nDisallow: /\n');
 await fs.writeFile(path.join(out,'_headers'),`/*\n  X-Content-Type-Options: nosniff\n  Referrer-Policy: strict-origin-when-cross-origin\n${site.indexable?'':'  X-Robots-Tag: noindex, nofollow\n'}`);
 await checkLinks(out);await checkSeo(out,site);return {name,pages:site.pages.length,out};
}
if(process.argv[1]===fileURLToPath(import.meta.url)){selectProject(root,process.argv[2]||process.env.SITE).then(name=>build(name)).then(x=>console.log(`Hotovo: ${x.name}, ${x.pages} stránek → ${x.out}`)).catch(e=>{console.error(e.message);process.exitCode=1;});}

