const {build}=require('esbuild');
const assert=require('node:assert/strict');
const path=require('node:path');
const {pathToFileURL}=require('node:url');
const output=path.resolve('.sites-runtime/approval-api-route.mjs');
const compile=()=>build({entryPoints:['app/api/approval/route.ts'],bundle:true,platform:'node',format:'esm',outfile:output,plugins:[{name:'test-request-identity',setup(build){build.onResolve({filter:/^\.\.\/\.\.\/access$/},()=>({path:'identity',namespace:'test'}));build.onLoad({filter:/.*/,namespace:'test'},()=>({contents:'export async function getActor(){return globalThis.__approvalActor}',loader:'js'}))}}]});
(async()=>{
 await compile();
 const {POST}=await import(pathToFileURL(output));
 const task={id:'review-task',title:'Arte',description:'',status:'aprovação fibroplast',assignees:['Farias'],tags:['fibroplast'],priority:'normal',start:'',due:'',subtasks:[],checklist:[],comments:[],attachments:[],history:[]};
 let row={data:JSON.stringify([task]),revision:0,status_config:'{}'},writes=0;
 const db={
  prepare(sql){return {
   async first(){assert(sql.startsWith('SELECT data,revision,status_config'));return structuredClone(row)},
   bind(...args){return {
    async run(){assert(sql.startsWith('UPDATE marketing_board SET data=?'));if(args[1]!==row.revision)return {meta:{changes:0}};row={...row,data:args[0],revision:row.revision+1};writes++;return {meta:{changes:1}}}
   }}
  }}
 };
 const actor=persona=>({role:'editor',persona,db,user:{email:persona+'@example.test',displayName:persona}});
 const request=(decision='approved',revision=row.revision,extra={},origin='https://board.test')=>new Request('https://board.test/api/approval',{method:'POST',headers:{'Content-Type':'application/json',Origin:origin},body:JSON.stringify({id:task.id,decision,revision,...extra})});
 globalThis.__approvalActor=null;assert.equal((await POST(request())).status,401);
 globalThis.__approvalActor=actor('lucio');assert.equal((await POST(request('approved',0,{},'https://attacker.test'))).status,403);
 globalThis.__approvalActor={...actor('lucio'),role:'visualizador'};assert.equal((await POST(request())).status,403);
 globalThis.__approvalActor=actor('farias');assert.equal((await POST(request())).status,403);assert.equal(writes,0);
 globalThis.__approvalActor=actor('lucio');
 const first=await POST(request('approved',0,{reviewer:'mateus',email:'mateus@example.test'}));assert.equal(first.status,200);
 let current=await first.json();assert(current.task.approval.votes.lucio);assert.equal(current.task.approval.votes.mateus,undefined);assert.equal(current.task.status,task.status);
 const duplicate=await POST(request());assert.equal(duplicate.status,200);assert.equal(writes,1);
 globalThis.__approvalActor=actor('mateus');assert.equal((await POST(request('approved',0))).status,409);assert.equal(writes,1);
 const second=await POST(request());assert.equal(second.status,200);assert.equal((await second.json()).task.status,'aprovado ✅');
 assert.equal((await POST(request('adjust'))).status,400,'A terminal round cannot be changed');
 row={data:JSON.stringify([task]),revision:0,status_config:'{}'};writes=0;
 globalThis.__approvalActor=actor('lucio');const left=POST(request('approved',0));
 globalThis.__approvalActor=actor('mateus');const right=POST(request('approved',0));
 const responses=await Promise.all([left,right]);assert.deepEqual(responses.map(r=>r.status).sort(),[200,409]);assert.equal(writes,1,'CAS allows only one concurrent revision to commit');
 const loser=responses[0].status===409?'lucio':'mateus';globalThis.__approvalActor=actor(loser);
 const retry=await POST(request());assert.equal(retry.status,200);assert.equal((await retry.json()).task.status,'aprovado ✅');
 row={data:JSON.stringify([task]),revision:0,status_config:'{}'};globalThis.__approvalActor=actor('lucio');
 const negative=await POST(request('adjust'));assert.equal(negative.status,200);assert.equal((await negative.json()).task.status,'ajustar ⚠️');
 row={data:JSON.stringify([task]),revision:0,status_config:'{}'};globalThis.__approvalActor={...actor(''),role:'administrador'};
 const adminFirst=await POST(request('approved',row.revision,{reviewer:'lucio'}));assert.equal(adminFirst.status,200);const adminFinal=await POST(request('approved',row.revision,{reviewer:'mateus'}));assert.equal(adminFinal.status,200);const resultAdmin=await adminFinal.json();assert.equal(resultAdmin.task.status,'aprovado ✅');assert.equal(resultAdmin.task.approval.votes.mateus.by,'@example.test');
 const purchase={...task,status:'a fazer farias',tags:['fibroplast','COMPRA'],purchase:{requiresArt:false,stage:'orçamento',quote:{place:'Loja',quantity:3,unitPrice:20}}};row={data:JSON.stringify([purchase]),revision:0,status_config:'{}'};
 globalThis.__approvalActor=actor('mateus');assert.equal((await POST(request('approved',0,{scope:'quote'}))).status,403);
 globalThis.__approvalActor=actor('lucio');assert.equal((await POST(request('adjust',0,{scope:'quote'}))).status,400);const quoteResponse=await POST(request('approved',0,{scope:'quote'}));assert.equal(quoteResponse.status,200);assert.equal((await quoteResponse.json()).task.purchase.stage,'aprovado');
 delete globalThis.__approvalActor;
 // A movement after approval can request adjustments only as a reviewer.
 globalThis.__approvalActor=actor('lucio');row.data=JSON.stringify([{...task,status:'aprovado ✅'}]);
 const moved=await POST(request('adjust',row.revision,{movement:true}));assert.equal(moved.status,200);assert.equal((await moved.json()).task.status,'ajustar ⚠️');
 globalThis.__approvalActor=actor('farias');assert.equal((await POST(request('adjust',row.revision,{movement:true}))).status,403);
 console.log('PASS: approval HTTP authentication, origin and role checks, reviewer spoofing ignored, idempotent writes, stale revisions, concurrent vote CAS, retry preserves first vote and immediate negative routing.');
})().catch(error=>{console.error(error);process.exitCode=1});
