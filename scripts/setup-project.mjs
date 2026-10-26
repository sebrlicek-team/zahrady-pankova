import fs from 'node:fs/promises';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {execFileSync} from 'node:child_process';
import {previewUrl} from './project.mjs';
import {validate} from '../src/lib/validate.mjs';
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
try{
 const args=process.argv.slice(2),options={};
 for(let i=0;i<args.length;i+=2){const key=args[i];if(!['--slug','--name','--url','--from'].includes(key)||!args[i+1]||args[i+1].startsWith('--')||options[key])throw new Error('Použití: npm run setup -- --slug klient --name "Název klienta" --url https://klient.ccn-dev.cz [--from milacek]');options[key]=args[i+1];}
 const slug=options['--slug'],name=options['--name']?.trim(),from=options['--from']||'milacek';
 if(!/^[a-z][a-z0-9-]{0,62}$/.test(slug||'')||['ccn-web-template','template','showcase'].includes(slug)||!name||!options['--url']||!/^[a-z0-9-]+$/.test(from))throw new Error('Vyplňte platný klientský slug, název a URL; název katalogu není povolen.');
 const url=previewUrl(options['--url']);
 if(new URL(url).hostname==='template.ccn-dev.cz')throw new Error('Adresa katalogu nesmí být adresou klienta.');
 let remotes='';try{remotes=execFileSync('git',['remote','-v'],{cwd:root,encoding:'utf8',stdio:['ignore','pipe','ignore']});}catch{}
 if(/CCNplus[/:]ccn-web-template(?:\.git)?(?:\s|$)/i.test(remotes))throw new Error('Setup spouštějte v klientské kopii, nikoli v repozitáři společné šablony.');
 const outputs=['project.json',`sites/${slug}.json`,'docs/PROJECT.md'];
 for(const f of outputs){try{await fs.access(path.join(root,f));throw new Error(`Soubor ${f} už existuje. Setup jej nepřepíše.`);}catch(e){if(e.code!=='ENOENT')throw e;}}
 const site=JSON.parse(await fs.readFile(path.join(root,'sites',from+'.json'),'utf8'));
 site.name=name;site.url=url;site.indexable=false;
 // A copied assembly must not inherit a live form or real test recipients.
 for(const page of site.pages)for(const section of page.sections)if(section.type==='contact'){section.email='kontakt@example.invalid';if(section.form)section.form={mode:'demo'};}
 validate(site);
 const project={slug,name,url,worker:slug,stage:'preview'};
 const worker={build:{command:'node scripts/build.mjs'},name:slug,compatibility_date:'2026-10-13',workers_dev:true,preview_urls:true,assets:{directory:'./dist',not_found_handling:'404-page'}};
 const files={ 'project.json':JSON.stringify(project,null,2)+'\n', [`sites/${slug}.json`]:JSON.stringify(site,null,2)+'\n', 'wrangler.jsonc':JSON.stringify(worker,null,2)+'\n', 'docs/PROJECT.md':`# Projekt: ${name}\n\n## Nastavení\n- Aktivní konfigurace: sites/${slug}.json\n- Worker: ${slug}\n- Pracovní URL: ${url}\n- Indexace: vypnutá\n- Výchozí sestava: ${from}\n\n## Stav\nPřipravená klientská kopie. Obsah a design jsou ukázkové, nikoli schválené. Nahraďte texty, kontakty a média. Formulář je pouze demo; testovací příjemci zatím nebyli určeni.\n\n## Ověření\nSetup validoval konfiguraci. Testy, build, prohlížeč a nasazení zbývají.\n\n## Další krok\nDoplnit zadání a postupovat podle IMPLEMENTATION.md. Doménu a Worker je nutné připojit v Cloudflare; setup je nezakládá.\n`};
 for(const [f,content] of Object.entries(files))await fs.writeFile(path.join(root,f),content);
 console.log(`Připraven ${slug}. Spusťte npm test && npm run build; náhled npm run dev. V Cloudflare použijte Worker ${slug} a příkaz npx wrangler deploy. Nahraďte ukázkový obsah. Pracovní URL připojte v Cloudflare.`);
}catch(e){console.error(e.message);process.exitCode=1;}

