import assert from 'node:assert/strict';
import {execFileSync} from 'node:child_process';
const base='http://127.0.0.1:5173',headers={Cookie:'__sites_local_auth=1',Origin:base,'Content-Type':'application/json'},week='2098-05-05';
const board=async()=>{const r=await fetch(base+'/api/board',{headers});assert.equal(r.status,200);return r.json()};
const launch=(action,day='all')=>fetch(base+'/api/weekly',{method:'POST',headers,body:JSON.stringify({action,day,week})});
function actor(role,persona){execFileSync(process.execPath,['--import','./scripts/sites-env.mjs','./node_modules/wrangler/bin/wrangler.js','d1','execute','DB','--local','--config','dist/server/wrangler.json','--persist-to','.wrangler/state','--command',`UPDATE marketing_members SET role='${role}',persona='${persona}' WHERE email='seedy@sites.test'`],{stdio:'pipe',env:{...process.env,CLOUDFLARE_CF_FETCH_ENABLED:'false'}})}
const original=await board();assert.equal(original.role,'administrador');const initial=await(await launch('preview')).json();assert.equal(initial.create,25);const ids=new Set(initial.plan.map(p=>p.task.id));
try{
 let result=await(await launch('create','0')).json();assert.equal(result.created,3);result=await(await launch('create','0')).json();assert.equal(result.created,0);assert.equal(result.skipped,3);
 let b=await board(),first=initial.plan[0].task.id;let changed=b.tasks.map(t=>t.id===first?{...t,status:'aprovado ✅'}:t);assert.equal((await fetch(base+'/api/board',{method:'POST',headers,body:JSON.stringify({tasks:changed,revision:b.revision})})).status,200);
 const responses=await Promise.all([launch('create'),launch('create')]);const results=await Promise.all(responses.map(r=>{assert.equal(r.status,200);return r.json()}));assert.equal(results.reduce((sum,r)=>sum+r.created,0),22);b=await board();assert.equal(b.tasks.filter(t=>ids.has(t.id)).length,25);assert.equal(b.tasks.find(t=>t.id===first).status,'aprovado ✅');
 for(const role of ['visualizador','editor']){actor(role,'luiz');assert.equal((await launch('create')).status,403)}actor('visualizador','mateus');assert.equal((await launch('create')).status,403);actor('editor','mateus');assert.equal((await launch('preview')).status,200);assert.equal((await(await launch('create')).json()).created,0);
 console.log('PASS API: dia isolado, lote completo, idempotência, dois cliques concorrentes sem duplicar, status anterior preservado e bloqueio de visualizador/designer.');
}finally{actor('administrador','');const b=await board();assert.equal((await fetch(base+'/api/board',{method:'POST',headers,body:JSON.stringify({tasks:b.tasks.filter(t=>!ids.has(t.id)),revision:b.revision})})).status,200);console.log('Lote fictício local removido.');}
