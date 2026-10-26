import fs from 'node:fs/promises';
import path from 'node:path';
export function previewUrl(value){
 const u=new URL(value);
 if(u.protocol!=='https:'||u.username||u.password||u.pathname!=='/'||u.search||u.hash||u.port||u.hostname==='localhost'||u.hostname.endsWith('.invalid')||u.hostname.endsWith('.example'))throw new Error('Zadejte skutečnou HTTPS pracovní adresu bez cesty, portu a přihlašovacích údajů.');
 return u.origin;
}
export async function selectProject(root,requested){
 let project;
 try{project=JSON.parse(await fs.readFile(path.join(root,'project.json'),'utf8'));}catch(e){if(e.code==='ENOENT')return requested||'showcase';throw e;}
 const {slug,name,url,worker}=project;
 if(!/^[a-z][a-z0-9-]{0,62}$/.test(slug)||worker!==slug||typeof name!=='string'||!name.trim()||previewUrl(url)!==url)throw new Error('Neplatný project.json.');
 if(requested&&requested!==slug)throw new Error(`Aktivní projekt je ${slug}, nikoli ${requested}. Odstraňte staré SITE nebo argument sestavení.`);
 const site=JSON.parse(await fs.readFile(path.join(root,'sites',slug+'.json'),'utf8'));
 const config=JSON.parse(await fs.readFile(path.join(root,'wrangler.jsonc'),'utf8'));
 if(config.name!==worker)throw new Error('Název Workeru nesouhlasí s project.json.');
 if(site.url!==url||site.name!==name)throw new Error('Název nebo URL klientské konfigurace nesouhlasí s project.json. Sjednoťte oba soubory.');
 if(project.stage!=='preview'&&project.stage!=='production')throw new Error('Neplatná fáze projektu.');
 if(project.stage==='preview'&&site.indexable!==false)throw new Error('Pracovní náhled musí mít indexable: false.');
 return slug;
}
