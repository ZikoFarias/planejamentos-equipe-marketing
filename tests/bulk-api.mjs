import assert from 'node:assert/strict';
import {execFileSync} from 'node:child_process';
const base='http://127.0.0.1:5173',headers={Cookie:'__sites_local_auth=1',Origin:base,'Content-Type':'application/json'};
const get=async()=>{const r=await fetch(base+'/api/board',{headers});assert.equal(r.status,200);return r.json()};
const post=(tasks,revision)=>fetch(base+'/api/board',{method:'POST',headers,body:JSON.stringify({tasks,revision})});
const ids=new Set(['bulk-api-l','bulk-api-f']);
function actor(role,persona){execFileSync(process.execPath,['--import','./scripts/sites-env.mjs','./node_modules/wrangler/bin/wrangler.js','d1','execute','DB','--local','--config','dist/server/wrangler.json','--persist-to','.wrangler/state','--command',`UPDATE marketing_members SET role='${role}',persona='${persona}' WHERE email='seedy@sites.test'`],{stdio:'pipe',env:{...process.env,CLOUDFLARE_CF_FETCH_ENABLED:'false'}})}
const original=await get();assert.equal(original.role,'administrador');
const make=(id,person)=>({id,title:'[TESTE LOCAL] '+id,status:'a fazer '+person,assignees:[person==='luiz'?'Luiz':'Farias'],tags:[person==='luiz'?'posto-ps':'fibroplast'],priority:'normal',start:'',due:'2026-10-25',description:'',attachments:[],subtasks:[],checklist:[],comments:[],history:[]});
try{
 assert.equal((await post([...original.tasks,make('bulk-api-l','luiz'),make('bulk-api-f','farias')],original.revision)).status,200);let b=await get();
 const invalid=b.tasks.map(t=>t.id==='bulk-api-l'?{...t,priority:'alta'}:t.id==='bulk-api-f'?{...t,status:'inválido'}:t);assert.equal((await post(invalid,b.revision)).status,400);assert.equal((await get()).tasks.find(t=>t.id==='bulk-api-l').priority,'normal');
 actor('editor','luiz');const visible=await get();assert.equal((await post([...visible.tasks.map(t=>t.id==='bulk-api-l'?{...t,priority:'alta'}:t),{...make('bulk-api-f','farias'),priority:'alta'}],visible.revision)).status,403);actor('administrador','');b=await get();assert.equal(b.tasks.find(t=>t.id==='bulk-api-l').priority,'normal');
 const stale=b.revision;assert.equal((await post(b.tasks.map(t=>ids.has(t.id)?{...t,status:'concluidos e postados'}:t),b.revision)).status,200);b=await get();for(const t of b.tasks.filter(t=>ids.has(t.id)))assert(!isNaN(Date.parse(t.postedAt)));const stamp=b.tasks.find(t=>t.id==='bulk-api-l').postedAt;
 assert.equal((await post(b.tasks.map(t=>ids.has(t.id)?{...t,postedAt:'2099-01-01T00:00:00Z',priority:'alta'}:t),b.revision)).status,200);b=await get();assert.equal(b.tasks.find(t=>t.id==='bulk-api-l').postedAt,stamp);assert.equal((await post(b.tasks.filter(t=>!ids.has(t.id)),stale)).status,409);assert.equal((await get()).tasks.filter(t=>ids.has(t.id)).length,2);
 actor('visualizador','luiz');const viewer=await get();assert.equal((await post([],viewer.revision)).status,403);actor('administrador','');b=await get();assert.equal((await post(b.tasks.filter(t=>!ids.has(t.id)),b.revision)).status,200);assert.equal((await get()).tasks.filter(t=>ids.has(t.id)).length,0);
 console.log('PASS API: lote inválido e acesso indevido não alteram parte das tarefas, timestamp do servidor preservado em edição, conflito impede exclusão e visualizador bloqueado; exclusão em lote autorizada.');
}finally{actor('administrador','');const b=await get();if(b.tasks.some(t=>ids.has(t.id)))assert.equal((await post(b.tasks.filter(t=>!ids.has(t.id)),b.revision)).status,200)}
