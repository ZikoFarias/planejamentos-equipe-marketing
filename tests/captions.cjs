const {build}=require('esbuild'),assert=require('node:assert/strict'),{DatabaseSync}=require('node:sqlite'),fs=require('fs'),path=require('path'),{pathToFileURL}=require('node:url');
(async()=>{
await build({entryPoints:['server/caption-handler.ts','app/captions.ts','app/permissions.ts','app/model.ts','app/art-flow.ts'],bundle:true,platform:'node',format:'esm',outdir:'.sites-runtime/caption-tests',outExtension:{'.js':'.mjs'}});
const load=f=>import(pathToFileURL(path.resolve('.sites-runtime/caption-tests/'+f+'.mjs')));
const {handleCaption}=await load('server/caption-handler'),{changeCaption,needsCaption,captionColumn,captionSent,captionAfterArt,captionColumns}=await load('app/captions'),{blank}=await load('app/model'),{mergeScopedTasks,defaultArea,canManageTask,canCreateTask}=await load('app/permissions'),{canAttachArt}=await load('app/art-flow');
const sql=new DatabaseSync(':memory:');sql.exec('CREATE TABLE marketing_board(id INTEGER PRIMARY KEY,data TEXT,revision INTEGER,status_config TEXT)');
let current={...blank('aprovação fibroplast'),title:'Arte social',tags:['fibroplast'],assignees:['Farias','Mateus','Lucio Alves Xavier'],approval:{round:2,votes:{lucio:{decision:'approved',by:'lucio@test',at:'2026-11-03T12:00:00Z'}}}};
sql.prepare('INSERT INTO marketing_board VALUES(1,?,4,?)').run(JSON.stringify([current]),'{}');
const db={prepare(text){let args=[];return{bind(...values){args=values;return this},async first(){return sql.prepare(text).get(...args)},async run(){return{meta:{changes:sql.prepare(text).run(...args).changes}}}}}};
const laura={role:'editor',persona:'laura',user:{email:'lauradeprimoberti07@gmail.com'}},lucio={role:'editor',persona:'lucio',user:{email:'marketingluke09@gmail.com'}},farias={role:'editor',persona:'farias',user:{email:'marketingluke06@gmail.com'}};
const call=(actor,body,origin='https://board.test')=>handleCaption(new Request('https://board.test/api/captions',{method:'POST',headers:{Origin:origin,'Content-Type':'application/json'},body:JSON.stringify(body)}),{DB:db},actor);
assert(needsCaption(current));assert(!needsCaption({...current,tags:['fibroplast','COMPRA']}));assert(!needsCaption({...current,tags:['fibroplast','MÍDIA EXTERNA']}));assert(!needsCaption(blank('a fazer farias')));assert.equal(defaultArea('laura'),'laura');assert.equal(captionColumn(current),'caption:todo');assert(!canManageTask(current,laura));assert(!canCreateTask(blank(),laura));assert(!canAttachArt(current,laura));
assert.equal((await call(null,{id:current.id,action:'save',text:'Teste',version:0})).status,401);
assert.equal((await call(laura,{id:current.id,action:'save',text:'Teste',version:0},'https://evil.test')).status,403);
assert.equal((await call(farias,{id:current.id,action:'submit',text:'Teste',version:0})).status,403);
assert.equal((await call(laura,{id:current.id,action:'submit',text:' ',version:0})).status,403);
let r=await call(laura,{id:current.id,action:'save',text:'Nossa legenda',version:0,status:'aprovado ✅',title:'spoof'});assert.equal(r.status,200);let body=await r.json();assert.equal(body.task.status,current.status);assert.equal(body.task.title,current.title);assert.deepEqual(body.task.approval,current.approval);assert(!captionSent(body.task));
assert.equal((await call(laura,{id:current.id,action:'submit',text:'Nossa legenda',version:0})).status,403,'stale caption does not overwrite');
r=await call(laura,{id:current.id,action:'submit',text:'Nossa legenda',version:1});body=await r.json();assert(captionSent(body.task));assert.equal(captionColumn(body.task),'caption:review');assert.equal(body.task.caption.submittedBy,laura.user.email);current=body.task;
r=await call(lucio,{id:current.id,action:'request_adjust'});body=await r.json();assert.equal(body.task.status,'ajustar legenda');assert.equal(captionColumn(body.task),'caption:adjust');assert(!captionSent(body.task));assert.deepEqual(body.task.approval,current.approval);current=body.task;
assert.equal((await call(laura,{id:current.id,action:'request_adjust'})).status,403);
r=await call(laura,{id:current.id,action:'submit',text:'Legenda corrigida',version:current.caption.version});body=await r.json();assert.equal(body.task.status,'aprovação fibroplast');assert(captionSent(body.task));assert.deepEqual(body.task.approval,current.approval);current=body.task;
assert.throws(()=>mergeScopedTasks([current],[{...current,caption:{...current.caption,text:'forjada'}}],lucio),/legendas/);assert.throws(()=>mergeScopedTasks([current],[{...current,title:'outra'}],laura),/responsável/);
const approved={...current,status:'aprovado ✅',approval:{round:2,votes:{},administrative:true}};
const adjusted=changeCaption(approved,{...lucio,email:lucio.user.email},'request_adjust',undefined,undefined);
const returned=changeCaption(adjusted,{...laura,email:laura.user.email},'submit','Corrigida',adjusted.caption.version);
assert.equal(returned.status,'aprovado ✅');assert.deepEqual(returned.approval,approved.approval);
const edited=changeCaption(current,{...laura,email:laura.user.email},'save','Mudou',current.caption.version);assert(!captionSent(edited));
const reset=captionAfterArt({...current,status:'ajustar ⚠️'},{...current,status:'aprovação fibroplast'});assert.equal(reset.caption.status,'todo');assert.equal(reset.caption.text,current.caption.text);assert(!captionSent(reset));assert.equal(reset.caption.version,current.caption.version+1);assert.equal(captionAfterArt(current,current),current);assert.equal(captionColumns.length,6);for(const status of ['aprovado ✅','stand-by ⛔','concluidos e postados'])assert.equal(captionColumn({...current,status}),status);
const admin={role:'administrador',persona:'farias',user:{email:'ezequiel2303f@gmail.com'}};
for(const status of ['aprovação fibroplast','ajustar legenda','aprovado ✅','stand-by ⛔','concluidos e postados']){
 const base={...current,status,caption:{text:'',status:status==='ajustar legenda'?'adjust':'todo',version:20},approval:{round:5,votes:{},administrative:true}};
 sql.prepare('UPDATE marketing_board SET data=?,revision=revision+1').run(JSON.stringify([base]));
 for(const action of ['move_todo','move_review','move_adjust']){
  const saved=JSON.parse(sql.prepare('SELECT data FROM marketing_board').get().data)[0];
  const moved=await call(admin,{id:base.id,action,text:'',version:saved.caption.version});assert.equal(moved.status,200);const result=await moved.json();assert.equal(captionColumn(result.task),action==='move_todo'?'caption:todo':action==='move_review'?'caption:review':'caption:adjust');assert.equal(result.task.caption.text,'');assert.deepEqual(result.task.attachments,base.attachments);
 }
}
const saved=JSON.parse(sql.prepare('SELECT data FROM marketing_board').get().data)[0];
assert.equal((await call(laura,{id:saved.id,action:'move_review',text:'',version:saved.caption.version})).status,403);
assert.equal((await call(lucio,{id:saved.id,action:'move_todo',text:'',version:saved.caption.version})).status,403);
console.log('PASS: administrator moves across every Laura stage without required caption, while editors cannot bypass their workflow.');
console.log('PASS: Laura receives social review cards, captions save/submit/pink indicator, reviewer-only adjustment, original stage/votes preserved, stale edits denied, authentication/origin and art permissions protected.');
})().catch(e=>{console.error(e);process.exitCode=1});
