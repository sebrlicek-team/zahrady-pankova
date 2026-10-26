import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import {execFileSync} from 'node:child_process';
import {root} from '../scripts/build.mjs';
import {selectProject,previewUrl} from '../scripts/project.mjs';
test('Client setup, default build, metadata and drift guards',async()=>{
 const dir=await fs.mkdtemp(path.join(os.tmpdir(),'ccn-setup-'));
 try{
  for(const f of ['scripts','src','sites','public','docs','package.json','wrangler.jsonc'])await fs.cp(path.join(root,f),path.join(dir,f),{recursive:true});
  await fs.rm(path.join(dir,'docs/PROJECT.md'),{force:true});
  const run=(script,args=[])=>execFileSync(process.execPath,[script,...args],{cwd:dir,encoding:'utf8',stdio:'pipe',env:{...process.env,SITE:''}});
  const args=['--slug','novy-klient','--name','Nový klient','--url','https://novy-klient.ccn-dev.cz/'];
  run('scripts/setup-project.mjs',args);
  assert.equal(await selectProject(dir),'novy-klient');
  run('scripts/build.mjs');
  const html=await fs.readFile(path.join(dir,'dist/index.html'),'utf8');
  assert.match(html,/https:\/\/novy-klient.ccn-dev.cz\//);assert.match(html,/noindex,nofollow/);
  assert.match(await fs.readFile(path.join(dir,'dist/sitemap.xml'),'utf8'),/novy-klient.ccn-dev.cz/);
  assert.equal(JSON.parse(await fs.readFile(path.join(dir,'wrangler.jsonc'))).name,'novy-klient');
  const before=await fs.readFile(path.join(dir,'project.json'),'utf8');
  assert.throws(()=>run('scripts/setup-project.mjs',args),/už existuje/);
  assert.equal(await fs.readFile(path.join(dir,'project.json'),'utf8'),before);
  await assert.rejects(selectProject(dir,'showcase'),/Aktivní projekt/);
  const p=path.join(dir,'sites/novy-klient.json'),site=JSON.parse(await fs.readFile(p));
  site.url='https://wrong.example.com';await fs.writeFile(p,JSON.stringify(site));
  assert.throws(()=>run('scripts/build.mjs'),/nesouhlasí/);
  site.url='https://novy-klient.ccn-dev.cz';site.indexable=true;await fs.writeFile(p,JSON.stringify(site));
  await assert.rejects(selectProject(dir),/indexable/);
 }finally{await fs.rm(dir,{recursive:true,force:true});}
});
test('Catalog defaults and invalid preview addresses',async()=>{
 const dir=await fs.mkdtemp(path.join(os.tmpdir(),'ccn-catalog-'));
 try{assert.equal(await selectProject(dir),'showcase');assert.equal(await selectProject(dir,'milacek'),'milacek');}finally{await fs.rm(dir,{recursive:true,force:true});}
 for(const url of ['http://client.cz','https://user:pass@client.cz','https://client.cz/path','https://client.example.invalid'])assert.throws(()=>previewUrl(url));
});
