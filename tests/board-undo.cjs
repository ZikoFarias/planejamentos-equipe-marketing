const assert=require('node:assert/strict');
const {readFileSync}=require('node:fs');
const {DatabaseSync}=require('node:sqlite');
const {buildSync}=require('esbuild');
const {resolve}=require('node:path');

const output=resolve('.sites-runtime/board-undo-test.cjs');
buildSync({entryPoints:['server/board-undo.ts'],bundle:true,platform:'node',format:'cjs',outfile:output});
const {applyBoardPatch,boardPatch,handleBoardUndo,rememberBoardAction}=require(output);
const task={id:'card',title:'Arte',description:'Original',status:'a fazer farias',history:[]};
const moved={...task,status:'aprovação fibroplast'};
const patch=boardPatch([task],[moved],null,null);
assert.deepEqual(applyBoardPatch([{...moved,description:'Outra edição'}],patch,false),[{...task,description:'Outra edição'}]);
assert.throws(()=>applyBoardPatch([{...moved,status:'ajustar ⚠️'}],patch,false),/alterou/);
const other={...task,id:'other'},insertion=boardPatch([task],[other,task],null,null);
assert.deepEqual(applyBoardPatch([other,task],insertion,false),[task]);
assert.deepEqual(applyBoardPatch([task],insertion,true),[other,task]);
assert.deepEqual(applyBoardPatch([other,task],boardPatch([task,other],[other,task],null,null),false),[task,other]);

(async()=>{
 const sql=new DatabaseSync(':memory:');
 sql.exec('CREATE TABLE marketing_board(id INTEGER PRIMARY KEY,data TEXT,revision INTEGER,status_config TEXT)');
 sql.exec(readFileSync('drizzle/0014_board_undo.sql','utf8'));
 sql.prepare('INSERT INTO marketing_board VALUES(1,?,3,NULL)').run(JSON.stringify([moved]));
 const db={prepare(query){let args=[];return {bind(...values){args=values;return this;},async first(){return sql.prepare(query).get(...args);},run(){return {meta:{changes:sql.prepare(query).run(...args).changes}};}};},async batch(statements){return statements.map(statement=>statement.run());}};
 const author={role:'editor',persona:'farias',user:{email:'farias@test',displayName:'Farias'}};
 const outsider={role:'editor',persona:'luiz',user:{email:'luiz@test',displayName:'Luiz'}};
 const call=(actor,redo=false,origin='https://board.test')=>handleBoardUndo(new Request('https://board.test/api/undo',{method:'POST',headers:{Origin:origin},body:JSON.stringify({redo})}),db,actor);
 await rememberBoardAction(db,{revision:2,data:JSON.stringify([task]),status_config:null},3,author.user.email);
 assert.equal((await call(author,false,'https://other.test')).status,403);
 assert.equal((await call(null)).status,401);
 assert.deepEqual(await (await call(outsider)).json(),{empty:true});
 assert.equal((await call(author)).status,200);
 assert.equal(JSON.parse(sql.prepare('SELECT data FROM marketing_board').get().data)[0].status,task.status);
 assert.deepEqual(await (await call(author)).json(),{empty:true});
 assert.equal((await call(author,true)).status,200);
 assert.equal(JSON.parse(sql.prepare('SELECT data FROM marketing_board').get().data)[0].status,moved.status);
 console.log('PASS: private undo and redo, ownership checks, board ordering and conflict protection.');
})().catch(error=>{console.error(error);process.exitCode=1;});
