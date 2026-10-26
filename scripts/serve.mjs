import http from 'node:http';
import fs from 'node:fs/promises';
import path from 'node:path';
import {build,root} from './build.mjs';
import {selectProject} from './project.mjs';
const result=await build(await selectProject(root,process.argv[2]||process.env.SITE));
const mime={'.html':'text/html; charset=utf-8','.css':'text/css','.js':'text/javascript','.svg':'image/svg+xml','.png':'image/png','.jpg':'image/jpeg','.mp4':'video/mp4','.xml':'application/xml','.txt':'text/plain'};
const port=Number(process.env.PORT||4173);
http.createServer(async(req,res)=>{try{
 const pathname=decodeURIComponent(new URL(req.url,'http://localhost').pathname);
 const f=path.resolve(result.out,'.'+pathname+(pathname.endsWith('/')?'index.html':''));
 if(!f.startsWith(result.out+path.sep)){res.writeHead(403);res.end();return;}
 const data=await fs.readFile(f);res.writeHead(200,{'Content-Type':mime[path.extname(f)]||'application/octet-stream','Cache-Control':'no-store'});res.end(data);
}catch{res.writeHead(404,{'Content-Type':'text/html; charset=utf-8'});res.end(await fs.readFile(path.join(root,'dist','404.html')));}}).listen(port,'127.0.0.1',()=>console.log(`Náhled: http://127.0.0.1:${port}`));
