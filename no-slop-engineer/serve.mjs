import {createServer} from 'node:http';
import {readFile,stat} from 'node:fs/promises';
import {fileURLToPath} from 'node:url';
import {resolve,extname,sep} from 'node:path';
const root=fileURLToPath(new URL('../dist/no-slop-engineer/',import.meta.url));
const port=Number(process.env.NO_SLOP_PORT||4317);
const types={'.html':'text/html; charset=utf-8','.css':'text/css; charset=utf-8','.mjs':'text/javascript; charset=utf-8','.md':'text/plain; charset=utf-8','.json':'application/json; charset=utf-8'};
createServer(async(req,res)=>{try{if(!['GET','HEAD'].includes(req.method)){res.writeHead(405);return res.end();}const path=decodeURIComponent(new URL(req.url,'http://localhost').pathname);const file=resolve(root,`.${path.endsWith('/')?path+'index.html':path}`);if(!file.startsWith(resolve(root)+sep)){res.writeHead(403);return res.end();}if(!(await stat(file)).isFile())throw new Error('not a file');const data=await readFile(file);res.writeHead(200,{'Content-Type':types[extname(file)]||'application/octet-stream','Cache-Control':'no-cache','X-Content-Type-Options':'nosniff'});res.end(req.method==='HEAD'?undefined:data);}catch{res.writeHead(404);res.end('Not found');}}).listen(port,'127.0.0.1',()=>console.log(`Outline workbench: http://127.0.0.1:${port}`));
