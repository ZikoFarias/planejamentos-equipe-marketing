import assert from 'node:assert/strict';
import fs from 'node:fs';
import {execFileSync} from 'node:child_process';
if(!fs.existsSync('.sites-runtime/capa-azul.png')||!fs.existsSync('.sites-runtime/capa-laranja.png'))execFileSync(process.execPath,['tests/make-fixtures.cjs']);
const base='http://127.0.0.1:5173',auth={Cookie:'__sites_local_auth=1',Origin:base},headers={...auth,'Content-Type':'application/json'};
const get=async()=>{const r=await fetch(base+'/api/board',{headers});assert.equal(r.status,200);return r.json()};
const post=async tasks=>{const b=await get();return fetch(base+'/api/board',{method:'POST',headers,body:JSON.stringify({tasks,revision:b.revision})})};
async function upload(name,path){const bytes=fs.readFileSync(path);const init=await fetch(base+'/api/files',{method:'POST',headers,body:JSON.stringify({action:'init',name,type:'image/png',size:bytes.length})});assert.equal(init.status,200,await init.clone().text());const session=await init.json(),parts=[];for(let offset=0,n=1;offset<bytes.length;offset+=session.partSize,n++){const r=await fetch(base+'/api/files/'+session.id+'/parts?part='+n,{method:'PUT',headers:auth,body:bytes.subarray(offset,Math.min(bytes.length,offset+session.partSize))});assert.equal(r.status,200,await r.clone().text());parts.push(await r.json())}const done=await fetch(base+'/api/files/'+session.id+'/parts',{method:'POST',headers,body:JSON.stringify({parts})});assert.equal(done.status,200,await done.clone().text());return done.json()}
const initial=await get();assert.equal(initial.role,'administrador');let id;
try{
 const tooBig=await fetch(base+'/api/files',{method:'POST',headers,body:JSON.stringify({action:'init',name:'maior.bin',size:100*1024*1024+1})});assert.equal(tooBig.status,400);
 const blue=await upload('capa-azul.png','.sites-runtime/capa-azul.png'),orange=await upload('capa-laranja.png','.sites-runtime/capa-laranja.png');assert.equal(blue.size,12*1024*1024);
 const preview=await fetch(base+blue.url+'?preview=1',{headers:auth});assert.equal(preview.status,200);assert.equal(preview.headers.get('content-type'),'image/png');assert(preview.headers.get('content-disposition').startsWith('inline'));await preview.body.cancel();
 const range=await fetch(base+blue.url+'?preview=1',{headers:{...auth,Range:'bytes=0-15'}});assert.equal(range.status,206);assert.equal((await range.arrayBuffer()).byteLength,16);assert.equal((await fetch(base+blue.url+'?preview=1')).status,401);
 id=crypto.randomUUID();const task={id,title:'[teste local] capa e etiquetas',description:'Teste fictício de interface.',status:'a fazer luiz',assignees:['Luiz'],tags:['fibroplast','campanha teste'],priority:'normal',start:'',due:'',subtasks:[],checklist:[],comments:[],attachments:[blue,orange],coverUrl:blue.url,history:[]};assert.equal((await post([...initial.tasks,task])).status,200);
 let current=await get();assert.equal(current.tasks.find(t=>t.id===id).title,'[TESTE LOCAL] CAPA E ETIQUETAS');assert(current.labels.includes('campanha teste'));assert.equal(current.labels.filter(t=>['fibroplast','postos','ervateira','materiais','concreto','luke group'].includes(t)).length,6);
 const invalid=current.tasks.map(t=>t.id===id?{...t,coverUrl:'https://example.com/nao-anexado.png'}:t);assert.equal((await post(invalid)).status,400);
 const switched=current.tasks.map(t=>t.id===id?{...t,coverUrl:orange.url}:t);assert.equal((await post(switched)).status,200);current=await get();assert.equal(current.tasks.find(t=>t.id===id).coverUrl,orange.url);
 fs.writeFileSync('.sites-runtime/polish-fixture.json',JSON.stringify({id,blue,orange}));console.log('PASS: upload de 12 MB em partes, prévia PNG autenticada, leitura parcial, limite 100 MB, títulos em caixa alta, catálogo de etiquetas, capa escolhida e persistida, capa inválida rejeitada.');
}finally{if(id&&!process.argv.includes('--keep')){const b=await get();assert.equal((await post(b.tasks.filter(t=>t.id!==id))).status,200)}}
