const {build}=require('esbuild'),assert=require('node:assert/strict'),fs=require('fs'),path=require('path'),{pathToFileURL}=require('node:url'),{DatabaseSync}=require('node:sqlite');
(async()=>{
 const out=path.resolve('.sites-runtime/drive-cleanup-test.mjs');
 await build({entryPoints:['server/drive-cleanup.ts'],bundle:true,platform:'node',format:'esm',outfile:out,plugins:[{name:'private-auth',setup(b){b.onResolve({filter:/\/drive-central-storage$/},()=>({path:'drive',namespace:'test'}));b.onLoad({filter:/.*/,namespace:'test'},()=>({contents:'export async function centralAccess(){if(globalThis.__authFail)throw Error("expired");return "test-token"}',loader:'js'}))}}]});
 const {processDriveCleanup}=await import(pathToFileURL(out));
 const sqlite=new DatabaseSync(':memory:');
 sqlite.exec("CREATE TABLE marketing_board(id INTEGER PRIMARY KEY,revision INTEGER,data TEXT);INSERT INTO marketing_board VALUES(1,0,'[]');CREATE TABLE marketing_central_uploads(file_id TEXT PRIMARY KEY,email TEXT,task_id TEXT,created_at INTEGER);");
 sqlite.exec(fs.readFileSync('drizzle/0012_drive_cleanup.sql','utf8'));
 // Reapplying the migration is safe and does not enqueue historical orphan files.
 sqlite.exec(fs.readFileSync('drizzle/0012_drive_cleanup.sql','utf8'));
 const db={prepare(sql){let args=[];return{bind(...v){args=v;return this},async first(){return sqlite.prepare(sql).get(...args)||null},async all(){return{results:sqlite.prepare(sql).all(...args)}},async run(){return{meta:{changes:Number(sqlite.prepare(sql).run(...args).changes)}}}}}};
 const env={DB:db},register=(id,task='one')=>sqlite.prepare('INSERT INTO marketing_central_uploads VALUES(?,?,?,?)').run(id,'user@test',task,0);
 const file=id=>({name:id,url:'https://drive.google.com/file/d/'+id+'/view',drive:{central:true,fileId:id}});
 const task=(id,attachments=[],comments=[])=>({id,attachments,comments,history:[]});
 const write=tasks=>sqlite.prepare('UPDATE marketing_board SET data=?,revision=revision+1 WHERE id=1').run(JSON.stringify(tasks));
 const job=id=>sqlite.prepare('SELECT * FROM marketing_drive_cleanup WHERE file_id=?').get(id);
 const calls=[];let fail=false;
 const drive=async(url,init)=>{assert.equal(init.method,'PATCH');assert.equal(init.headers.Authorization,'Bearer test-token');const id=new URL(url).pathname.split('/').pop(),value=JSON.parse(init.body);assert.deepEqual(Object.keys(value),['trashed']);calls.push({id,trashed:value.trashed});if(fail)return new Response('',{status:503});return Response.json({id,trashed:value.trashed})};
 register('file_one_123');register('historical_orphan');
 write([task('one',[file('file_one_123')])]);assert(!job('file_one_123'));assert(!job('historical_orphan'));
 // Removing one of two references keeps the file; removing the last queues it.
 write([task('one',[file('file_one_123')]),task('mirror',[file('file_one_123')])]);
 write([task('mirror',[file('file_one_123')])]);assert(!job('file_one_123'));
 // History is an audit log, not an active attachment.
 write([{...task('one'),history:[{attachments:[file('file_one_123')]}]}]);assert.equal(job('file_one_123').desired_trashed,1);
 assert.equal(await processDriveCleanup(env,0,drive),1);assert.deepEqual(calls,[{id:'file_one_123',trashed:true}]);assert(!job('historical_orphan'));
 assert.equal(await processDriveCleanup(env,0,drive),0);assert.equal(calls.length,1);
 // Undo re-links and restores only files that were previously queued by this app.
 write([task('one',[file('file_one_123')])]);assert.equal(job('file_one_123').desired_trashed,0);
 assert.equal(await processDriveCleanup(env,0,drive),1);assert.deepEqual(calls.at(-1),{id:'file_one_123',trashed:false});
 // Comments preserve active references even when an item leaves the gallery.
 write([task('one',[],[{attachments:[file('file_one_123')]}])]);assert.equal(job('file_one_123').desired_trashed,0);
 write([]);assert.equal(job('file_one_123').desired_trashed,1);
 // Google failures remain durable and retry with backoff.
 fail=true;assert.equal(await processDriveCleanup(env,0,drive),0);assert.equal(job('file_one_123').next_attempt,60000);assert.equal(job('file_one_123').attempts,1);
 assert.equal(await processDriveCleanup(env,100,drive),0);
 fail=false;assert.equal(await processDriveCleanup(env,60000,drive),1);
 // Registered personal images and files not uploaded through the app cannot be trashed.
 register('profile_file','_profile');register('background_file','_background');
 write([task('two',[file('profile_file'),file('background_file'),file('unregistered_file')])]);write([]);
 for(const id of ['profile_file','background_file','unregistered_file'])assert(!job(id));
 // A failed board CAS never creates a removal job.
 register('cas_file');write([task('three',[file('cas_file')])]);
 sqlite.prepare("UPDATE marketing_board SET data='[]' WHERE id=1 AND revision=-1").run();assert(!job('cas_file'));
 // If the Google connection expires, keep the removal pending until reauthorization.
 write([]);globalThis.__authFail=true;assert.equal(await processDriveCleanup(env,0,drive),0);assert.equal(job('cas_file').attempts,1);globalThis.__authFail=false;
 // Undo before processing cancels deletion, and the pending restore is idempotent.
 write([task('three',[file('cas_file')])]);assert.equal(await processDriveCleanup(env,0,drive),1);assert.deepEqual(calls.at(-1),{id:'cas_file',trashed:false});
 // A slow deletion finishing after Undo must not overwrite the restored intent.
 register('race_file');write([task('race',[file('race_file')])]);write([]);let raced=false;
 const raceDrive=async(url,init)=>{const id=new URL(url).pathname.split('/').pop(),data=JSON.parse(init.body);if(id==='race_file'&&data.trashed&&!raced){raced=true;write([task('race',[file('race_file')])]);await processDriveCleanup(env,0,drive)}return Response.json({id,trashed:data.trashed})};
 await processDriveCleanup(env,0,raceDrive);assert(job('race_file').applied_generation<job('race_file').generation);
 await processDriveCleanup(env,0,drive);assert.deepEqual(calls.at(-1),{id:'race_file',trashed:false});

 sqlite.exec(fs.readFileSync('drizzle/0013_quote_drive_cleanup.sql','utf8'));
 register('quote_file_123');
 const quoted={...task('one'),purchase:{quotes:[{attachments:[file('quote_file_123')]}]}};
 write([quoted]);assert(!job('quote_file_123'));
 write([task('one')]);assert.equal(job('quote_file_123').desired_trashed,1);
 write([quoted]);assert.equal(job('quote_file_123').desired_trashed,0);
 console.log('PASS: atomic removal queue, whole-card deletion, shared/comment references, no historical purge, private files protected, trash only, undo restore, failed CAS, Drive outage and retries.');
})().catch(e=>{console.error(e);process.exitCode=1});
