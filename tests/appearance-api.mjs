import assert from 'node:assert/strict';
import {execFileSync} from 'node:child_process';
import fs from 'node:fs';
const base='http://127.0.0.1:5173',auth={Cookie:'__sites_local_auth=1',Origin:base},headers={...auth,'Content-Type':'application/json'};
const get=async()=>{const r=await fetch(base+'/api/preferences',{headers});assert.equal(r.status,200);return r.json()};
const post=value=>fetch(base+'/api/preferences',{method:'POST',headers,body:JSON.stringify(value)});
function sql(command){execFileSync(process.execPath,['--import','./scripts/sites-env.mjs','./node_modules/wrangler/bin/wrangler.js','d1','execute','DB','--local','--config','dist/server/wrangler.json','--persist-to','.wrangler/state','--command',command],{stdio:'pipe',env:{...process.env,CLOUDFLARE_CF_FETCH_ENABLED:'false'}})}
const initial=await get();let uploaded;
try{
 sql("UPDATE marketing_members SET role='visualizador',persona='luiz' WHERE email='seedy@sites.test'");
 const denied=await fetch(base+'/api/files',{method:'POST',headers,body:JSON.stringify({action:'init',name:'tarefa.png',type:'image/png',size:10})});assert.equal(denied.status,403);
 const bytes=fs.readFileSync('.sites-runtime/capa-laranja.png');const init=await fetch(base+'/api/files',{method:'POST',headers,body:JSON.stringify({action:'init',purpose:'background',name:'fundo.png',type:'image/png',size:bytes.length})});assert.equal(init.status,200);const session=await init.json();const part=await fetch(base+'/api/files/'+session.id+'/parts?part=1',{method:'PUT',headers:auth,body:bytes});assert.equal(part.status,200);const complete=await fetch(base+'/api/files/'+session.id+'/parts',{method:'POST',headers,body:JSON.stringify({parts:[await part.json()]})});assert.equal(complete.status,200);uploaded=await complete.json();
 const value={background:uploaded.url,colors:{'a fazer':'#aa4499'}};assert.equal((await post(value)).status,200);assert.deepEqual(await get(),value);
 assert.equal((await post({...value,colors:{x:'url(javascript:evil)'}})).status,400);assert.deepEqual(await get(),value);
 assert.equal((await post({...value,background:'https://example.com/fundo.png'})).status,400);assert.deepEqual(await get(),value);
 const board=await (await fetch(base+'/api/board',{headers})).json();assert.equal((await fetch(base+'/api/board',{method:'POST',headers,body:JSON.stringify({tasks:board.tasks,revision:board.revision})})).status,403);
 sql("UPDATE marketing_uploads SET email='outra-pessoa@teste.local' WHERE id='"+session.id+"'");assert.equal((await post(value)).status,403);assert.equal((await fetch(base+uploaded.url+'?preview=1',{headers})).status,403);
 sql("UPDATE marketing_uploads SET email='seedy@sites.test' WHERE id='"+session.id+"'");
 console.log('PASS: aparência persistente, visualizador personaliza fundo sem editar tarefas, anexos normais bloqueados, cores e URLs inválidas rejeitadas, fundo de outro usuário bloqueado, dados anteriores preservados.');
}finally{sql("UPDATE marketing_members SET role='administrador',persona='' WHERE email='seedy@sites.test'");assert.equal((await post(initial)).status,200)}
