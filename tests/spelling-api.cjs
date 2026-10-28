const {build}=require('esbuild'),assert=require('node:assert/strict'),path=require('node:path'),{pathToFileURL}=require('node:url');
(async()=>{
const outfile=path.resolve('.sites-runtime/spelling-api-tests.mjs');
await build({entryPoints:['app/api/spelling/route.ts'],bundle:true,platform:'node',format:'esm',outfile,plugins:[{name:'test-server',setup(b){b.onResolve({filter:/^cloudflare:workers$/},()=>({path:'env',namespace:'test'}));b.onResolve({filter:/^\.\.\/\.\.\/access$/},()=>({path:'actor',namespace:'test'}));b.onResolve({filter:/^\.\/drive-central-storage$/},()=>({path:'drive',namespace:'test'}));b.onLoad({filter:/.*/,namespace:'test'},args=>({contents:args.path==='env'?'export const env=globalThis.__env':args.path==='actor'?'export async function getActor(){return globalThis.__actor}':'export async function centralAccess(){return "private-drive-token"}',loader:'js'}))}}]});
const image={name:'arte.png',url:'https://drive.google.com/file/d/test_image_123/view',type:'image/png',size:3,artworkKind:'final',drive:{central:true,fileId:'test_image_123',folderId:'folder',folderName:'Arte',url:'',savedAt:''}};
const originalTask={id:'spelling-test',title:'Arte',description:'Descrição preservada',status:'a fazer farias',assignees:['Farias'],tags:['fibroplast'],priority:'normal',start:'',due:'',subtasks:[],checklist:[],comments:[],attachments:[image],history:[]};
let tasks=[],revision=0,job,quota=0,calls=0,mode='flagged',conflict=false;
function reset(){tasks=[structuredClone(originalTask)];revision=0;job=undefined;quota=0;calls=0;mode='flagged';conflict=false;}
const db={prepare(sql){let args=[];return {bind(...a){args=a;return this},async first(){
 if(sql.startsWith('SELECT data'))return {data:JSON.stringify(tasks),revision};
 if(sql.startsWith('INSERT INTO marketing_spelling_jobs')){if(job&&!((job.state==='pending'||args[3]===1||job.at<args[4])&&job.at<args[5]))return null;job={state:'running',at:args[2]};return {task_id:args[0]};}
 if(sql.startsWith('UPDATE marketing_spelling_quota'))return quota<40?{used:++quota}:null;
 if(sql.startsWith('SELECT file_id'))return {file_id:image.drive.fileId};
 throw Error('Unexpected first '+sql);
 },async run(){
 if(sql.startsWith('UPDATE marketing_board')){if(args[1]!==revision)return {meta:{changes:0}};tasks=JSON.parse(args[0]);revision++;return {meta:{changes:1}};}
 if(sql.startsWith('INSERT OR IGNORE INTO marketing_spelling_quota'))return {};
 if(sql.startsWith('UPDATE marketing_spelling_jobs')){job.state=args[0];return {}};
 throw Error('Unexpected run '+sql);
 }}}};
globalThis.__env={DB:db,GEMINI_API_KEY:'private-gemini-key'};
globalThis.__actor={role:'editor',persona:'farias',db,user:{email:'farias@test',displayName:'Farias'}};
const {POST}=await import(pathToFileURL(outfile));const req=(action='review',origin='https://board.test')=>new Request('https://board.test/api/spelling',{method:'POST',headers:{Origin:origin,'Content-Type':'application/json'},body:JSON.stringify({id:originalTask.id,action})});
const originalFetch=globalThis.fetch;
globalThis.fetch=async(url,init)=>{calls++;if(url.includes('googleapis.com/drive/')){assert.equal(init.headers.Authorization,'Bearer private-drive-token');return new Response(new Uint8Array([1,2,3]),{headers:{'Content-Type':'image/png'}})}
assert.equal(init.headers['x-goog-api-key'],'private-gemini-key');const body=JSON.parse(init.body);assert(body.contents[0].parts.some(p=>p.inlineData));if(conflict){tasks[0].description='Edição concorrente preservada';revision++;}if(mode==='429')return new Response('',{status:429});if(mode==='invalid')return Response.json({candidates:[{content:{parts:[{text:'not JSON'}]}}]});if(mode==='stale'){tasks[0].attachments=[];revision++;}
const result={readable:mode!=='unreadable',issues:mode==='flagged'?[{file:0,text:'PROMOÇÂO',suggestion:'PROMOÇÃO',reason:'Acento incorreto.'}]:[]};return Response.json({candidates:[{content:{parts:[{text:JSON.stringify(result)}]}}]});};
try{
 reset();globalThis.__actor=null;assert.equal((await POST(req())).status,401);assert.equal(calls,0);
 globalThis.__actor={role:'editor',persona:'farias',db,user:{email:'f@test',displayName:'Farias'}};assert.equal((await POST(req('review','https://evil.test'))).status,403);assert.equal(calls,0);
 reset();conflict=true;let response=await POST(req());assert.equal(response.status,200);let data=await response.json();assert.equal(data.tasks[0].status,'ajustar ⚠️');assert.equal(data.tasks[0].spelling.state,'flagged');assert.equal(data.tasks[0].description,'Edição concorrente preservada');assert(!JSON.stringify(data).includes('private-'));assert.equal((await POST(req('dismiss'))).status,403);
 const before=calls;await POST(req());assert.equal(calls,before,'duplicate request must not spend quota');
 globalThis.__actor.persona='lucio';assert.equal((await POST(req('dismiss'))).status,200);assert.equal(tasks[0].spelling.state,'dismissed');assert.equal(tasks[0].status,'ajustar ⚠️','dismiss never approves');
 for(const state of ['429','invalid','unreadable']){reset();mode=state;await POST(req());assert.equal(tasks[0].spelling.state,'pending');assert.equal(tasks[0].status,'a fazer farias');}
 reset();mode='clean';await POST(req());assert.equal(tasks[0].spelling.state,'clean');assert.equal(tasks[0].status,'a fazer farias');
 reset();mode='stale';await POST(req());assert.equal(tasks[0].status,'a fazer farias');assert.notEqual(tasks[0].spelling?.state,'flagged');
 reset();quota=40;await POST(req());assert.equal(calls,0);assert.equal(tasks[0].spelling.state,'pending');
 reset();delete globalThis.__env.GEMINI_API_KEY;await POST(req());assert.equal(calls,0);assert.equal(tasks[0].spelling.state,'pending');
 console.log('PASS: spelling HTTP auth, origin, reviewer dismissal, no auto-approval, strict Gemini parsing, free quota, idempotency, unavailable key, unreadable image, 429, stale artwork and concurrent edits.');
}finally{globalThis.fetch=originalFetch}
})().catch(e=>{console.error(e);process.exitCode=1});
