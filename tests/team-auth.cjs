const {build}=require('esbuild'),assert=require('node:assert/strict'),fs=require('node:fs');
const {DatabaseSync}=require('node:sqlite'),{pbkdf2Sync}=require('node:crypto'),{pathToFileURL}=require('node:url'),path=require('node:path');
(async()=>{
 const sqlite=new DatabaseSync(':memory:');sqlite.exec('CREATE TABLE marketing_members(email TEXT PRIMARY KEY,role TEXT,persona TEXT)');
 for(const file of ['0003_team_access','0004_team_login','0005_team_administrator','0006_login_challenges'])sqlite.exec(fs.readFileSync('drizzle/'+file+'.sql','utf8'));
 const db={prepare(sql){return {bind(...args){const statement=sqlite.prepare(sql);return {first:async()=>statement.get(...args)||null,run:async()=>({meta:{changes:statement.run(...args).changes}})}}}}};
 const salt='a'.repeat(32),password='test-only-password',hash=pbkdf2Sync(password,salt,100000,32,'sha256').toString('hex');
 await build({entryPoints:['app/team-login-handler.ts','app/login-proof.ts','app/team-auth.ts'],bundle:true,platform:'node',format:'esm',outdir:'.sites-runtime/auth-tests',outExtension:{'.js':'.mjs'}});
 const load=name=>import(pathToFileURL(path.resolve('.sites-runtime/auth-tests/'+name+'.mjs')));
 const {handleTeamLogin:handle}=await load('team-login-handler');const {deriveLoginKey,loginProof,verifyLoginProof}=await load('login-proof');
 const env={DB:db,BOARD_LOGIN_HASH:hash,BOARD_LOGIN_SALT:salt};
 const req=(body,origin='https://board.test')=>new Request('https://board.test/api/auth/login',{method:'POST',headers:{'Content-Type':'application/json',Origin:origin},body:JSON.stringify(body)});
 const challenge=async email=>{const r=await handle(req({email}),env,true);return {r,body:await r.json()}};
 const credentials=async(email,secret=password)=>{const c=await challenge(email);assert.equal(c.r.status,200);const normalized=email.trim().toLowerCase();return {email,challenge:c.body.challenge,proof:await loginProof(await deriveLoginKey(secret,c.body.salt),normalized,c.body.challenge)}};
 assert.equal(await deriveLoginKey(password,salt),hash,'Existing PBKDF2 strength and stored secrets remain compatible');
 assert.equal((await handle(req({email:'marketingluke09@gmail.com'},'https://other.test'),env,true)).status,403);
 assert.equal((await handle(req({email:'marketingluke09@gmail.com',password}),env)).status,401,'No expensive raw-password fallback');
 for(const email of ['marketingluke09@gmail.com','marketingluke06@gmail.com','marketingluke02@gmail.com','marketingluke24@gmail.com','ezequiel2303f@gmail.com']){
  const body=await credentials(' '+email.toUpperCase()+' ');const response=await handle(req(body),env);assert.equal(response.status,200);const cookie=response.headers.get('set-cookie');assert.match(cookie,/HttpOnly/);assert.match(cookie,/SameSite=Lax/);assert.match(cookie,/Secure/);assert.match(cookie,/Max-Age=43200/);const token=cookie.match(/marketing_session=([a-f0-9]+)/)[1];assert.equal(sqlite.prepare('SELECT count(*) n FROM marketing_sessions WHERE token_hash=?').get(token).n,0);assert.equal((await handle(req(body),env)).status,401,'Replayed proofs are denied');
 }
 assert.equal((await handle(req(await credentials('unknown@test.com')),env)).status,401);
 const wrong=await credentials('marketingluke09@gmail.com','wrong');assert.equal((await handle(req(wrong),env)).status,401);assert.equal((await handle(req(wrong),env)).status,401);
 const expired=await credentials('marketingluke09@gmail.com');sqlite.exec('UPDATE marketing_login_challenges SET expires_at=0');assert.equal((await handle(req(expired),env)).status,401);
 const other=await credentials('marketingluke09@gmail.com');other.email='marketingluke24@gmail.com';assert.equal((await handle(req(other),env)).status,401,'Challenge is email-bound');
 const simultaneous=await credentials('marketingluke09@gmail.com');const both=await Promise.all([handle(req(simultaneous),env),handle(req(simultaneous),env)]);assert.deepEqual(both.map(r=>r.status).sort(),[200,401]);
 const revoked=await credentials('marketingluke09@gmail.com');sqlite.exec("UPDATE marketing_members SET role='visualizador',persona='mateus' WHERE email='marketingluke09@gmail.com'");assert.equal((await handle(req(revoked),env)).status,401,'Membership is checked at proof consumption');
 for(let i=0;i<8;i++)assert.equal((await challenge('blocked@test.com')).r.status,200);const limited=await challenge('blocked@test.com');assert.equal(limited.r.status,429);assert.equal(limited.r.headers.get('retry-after'),'900');
 assert(!await verifyLoginProof(hash,'other@test.com','a'.repeat(64),'b'.repeat(64)));
 const core=await load('team-auth');assert(await core.checkPassword(password,salt,hash));assert(!await core.checkPassword('wrong',salt,hash));
 sqlite.close();console.log('PASS: five accounts, unchanged PBKDF2, wrong passwords, identity binding, one-use/expired/replayed/concurrent proofs, role revocation, origin, attempt limits and private sessions.');
})().catch(error=>{console.error(error);process.exitCode=1});
