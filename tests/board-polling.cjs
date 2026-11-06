const {build}=require('esbuild'),assert=require('node:assert/strict'),path=require('path'),{pathToFileURL}=require('url');
(async()=>{
 const file=path.resolve('.sites-runtime/board-polling-test.mjs');
 await build({entryPoints:['app/api/board/route.ts'],bundle:true,platform:'node',format:'esm',outfile:file,plugins:[{name:'identity',setup(b){b.onResolve({filter:/^\.\.\/\.\.\/access$/},()=>({path:'actor',namespace:'test'}));b.onLoad({filter:/.*/,namespace:'test'},()=>({contents:'export async function getActor(){return globalThis.__pollActor}',loader:'js'}))}}]});
 let reads=0;
 const data=JSON.stringify([{id:'card',tags:['fibroplast'],assignees:['Farias'],status:'a fazer farias'}]);
 const db={prepare(sql){return {bind(){return this},async first(){reads++;if(sql==='SELECT revision FROM marketing_board WHERE id=1')return {revision:7};if(sql.startsWith('SELECT *'))return {revision:8,data,status_config:'{}'};return null},async run(){return {}},async all(){return {results:[]}}}}};
 globalThis.__pollActor={role:'editor',persona:'farias',user:{email:'farias@test',displayName:'Farias'},db};
 const {GET}=await import(pathToFileURL(file));
 let response=await GET(new Request('https://board.test/api/board?revision=7&role=editor&persona=farias'));assert.equal(response.status,200);assert.deepEqual(await response.json(),{unchanged:true,revision:7});assert.equal(reads,1);
 response=await GET(new Request('https://board.test/api/board?revision=6&role=editor&persona=farias'));assert.equal((await response.json()).tasks.length,1);
 response=await GET(new Request('https://board.test/api/board?revision=7&role=administrador&persona=farias'));assert.equal((await response.json()).role,'editor');
 globalThis.__pollActor=null;assert.equal((await GET(new Request('https://board.test/api/board?revision=7&role=editor&persona=farias'))).status,401);
 console.log('PASS: unchanged polls skip board/profile reads, changed revisions return data, roles cannot be spoofed, expired sessions rejected.');
})().catch(e=>{console.error(e);process.exitCode=1});
