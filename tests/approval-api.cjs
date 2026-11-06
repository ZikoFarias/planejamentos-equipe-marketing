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
 const adminFirst=await POST(request('approved',row.revision,{reviewer:'lucio'}));assert.equal(adminFirst.status,200);const adminFinal=await POST(request('approved',row.revision,{reviewer:'mateus'}));assert.equal(adminFinal.status,200);const resultAdmin=await adminFinal.json();assert.equal(resultAdmin.task.status,'aprovado ✅');assert.equal(resultAdmin.task.approval.administrative,true);assert.deepEqual(resultAdmin.task.approval.votes,{});
 const purchase={...task,status:'a fazer farias',tags:['fibroplast','COMPRA'],purchase:{requiresArt:false,stage:'orçamento',quote:{place:'Loja',quantity:3,unitPrice:20}}};row={data:JSON.stringify([purchase]),revision:0,status_config:'{}'};
 globalThis.__approvalActor=actor('mateus');assert.equal((await POST(request('approved',0,{scope:'quote'}))).status,403);
 globalThis.__approvalActor=actor('lucio');assert.equal((await POST(request('adjust',0,{scope:'quote'}))).status,400);const quoteResponse=await POST(request('approved',0,{scope:'quote'}));assert.equal(quoteResponse.status,200);assert.equal((await quoteResponse.json()).task.purchase.stage,'aprovado');
 row={data:JSON.stringify([{...purchase,purchase:{requiresArt:false,stage:'orçamento',quotes:[]}}]),revision:0,status_config:'{}'};globalThis.__approvalActor=actor('lucio');const noQuoteResponse=await POST(request('approved',0,{scope:'quote',movement:true}));assert.equal(noQuoteResponse.status,200);assert.equal((await noQuoteResponse.json()).task.purchase.stage,'aprovado');
 delete globalThis.__approvalActor;
 // A movement after approval can request adjustments only as a reviewer.
 globalThis.__approvalActor=actor('lucio');row.data=JSON.stringify([{...task,status:'aprovado ✅'}]);
 const moved=await POST(request('adjust',row.revision,{movement:true}));assert.equal(moved.status,200);assert.equal((await moved.json()).task.status,'ajustar ⚠️');
 globalThis.__approvalActor=actor('farias');assert.equal((await POST(request('adjust',row.revision,{movement:true}))).status,403);

 const votes={lucio:{decision:'approved',by:'lucio@example.test',at:'2026-11-06'},mateus:{decision:'approved',by:'mateus@example.test',at:'2026-11-06'}};
 const approved={...task,status:'aprovado ✅',approval:{round:2,votes}};
 row={data:JSON.stringify([approved]),revision:0,status_config:'{}'};writes=0;
 for(const persona of ['lucio','mateus','farias','luiz','laura']){
  globalThis.__approvalActor=actor(persona);
  assert.equal((await POST(request(undefined,0,{action:'remove',reviewer:'lucio'}))).status,403);
 }
 assert.equal(writes,0);globalThis.__approvalActor={...actor('farias'),role:'administrador'};
 const removed=await POST(request(undefined,0,{action:'remove',reviewer:'lucio'}));assert.equal(removed.status,200);
 const revoked=(await removed.json()).task;assert.equal(revoked.status,'aprovação fibroplast');assert.equal(revoked.approval.votes.lucio,undefined);assert.deepEqual(revoked.approval.votes.mateus,votes.mateus);assert.match(revoked.history[0].text,/removeu a aprovação de Lúcio/);
 assert.equal((await POST(request(undefined,0,{action:'remove',reviewer:'mateus'}))).status,409);
 assert.equal((await POST(request(undefined,row.revision,{action:'remove',reviewer:'lucio'}))).status,400);assert.equal(writes,1);
 globalThis.__approvalActor=actor('lucio');assert.equal((await POST(request())).status,200);assert.equal(JSON.parse(row.data)[0].status,'aprovado ✅');
 globalThis.__approvalActor={...actor('farias'),role:'administrador'};
 for(const kind of ['administrative','designer']){
  const approval={round:1,votes:{},...(kind==='administrative'?{administrative:true}:{designer:{by:'farias@example.test',name:'Farias',at:'2026-11-06'}})};
  row={data:JSON.stringify([{...approved,tags:['fibroplast','COMPRA'],approval,purchase:{requiresArt:true,mediaLabel:'MÍDIA EXTERNA',stage:'pagamento'}}]),revision:0,status_config:'{}'};
  const response=await POST(request(undefined,0,{action:'remove',reviewer:kind}));assert.equal(response.status,200);
  const value=(await response.json()).task;assert.equal(value.status,'aprovação fibroplast');assert.equal(value.approval[kind],undefined);assert(value.tags.includes('MÍDIA EXTERNA'));assert.equal(value.purchase.stage,'comprar');assert.equal(value.purchase.quoteApproval,undefined);
 }
 row={data:JSON.stringify([approved]),revision:0,status_config:'{}'};
 const removals=await Promise.all(['lucio','mateus'].map(reviewer=>POST(request(undefined,0,{action:'remove',reviewer}))));
 assert.deepEqual(removals.map(response=>response.status).sort(),[200,409]);assert.equal(Object.keys(JSON.parse(row.data)[0].approval.votes).length,1);
 console.log('PASS: approval HTTP authentication, origin and role checks, reviewer spoofing ignored, idempotent writes, stale revisions, concurrent vote CAS, retry preserves first vote and immediate negative routing.');
})().catch(error=>{console.error(error);process.exitCode=1});
