const {build}=require('esbuild');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const {DatabaseSync}=require('node:sqlite');
const {pbkdf2Sync}=require('node:crypto');
const {pathToFileURL}=require('node:url');
const path=require('node:path');
(async()=>{
 const sqlite=new DatabaseSync(':memory:');sqlite.exec('CREATE TABLE marketing_members(email TEXT PRIMARY KEY,role TEXT,persona TEXT)');sqlite.exec(fs.readFileSync('drizzle/0004_team_login.sql','utf8'));
 const accounts={'marketingluke09@gmail.com':'lucio','marketingluke06@gmail.com':'farias','marketingluke02@gmail.com':'luiz','marketingluke24@gmail.com':'mateus'};
 for(const [email,persona] of Object.entries(accounts))sqlite.prepare('INSERT INTO marketing_members VALUES(?,?,?)').run(email,'editor',persona);
 sqlite.exec(fs.readFileSync('drizzle/0005_team_administrator.sql','utf8'));
 const db={prepare(sql){return {bind(...args){const statement=sqlite.prepare(sql);return {first:async()=>statement.get(...args)||null,run:async()=>({meta:{changes:statement.run(...args).changes}})}}}}};
 const salt='a'.repeat(32),password='test-only-password',hash=pbkdf2Sync(password,salt,100000,32,'sha256').toString('hex');globalThis.__authEnv={DB:db,BOARD_LOGIN_HASH:hash,BOARD_LOGIN_SALT:salt};
 const output=path.resolve('.sites-runtime/team-login-route.mjs');await build({entryPoints:['app/api/auth/login/route.ts'],bundle:true,platform:'node',format:'esm',outfile:output,plugins:[{name:'auth-env',setup(b){b.onResolve({filter:/^cloudflare:workers$/},()=>({path:'env',namespace:'test'}));b.onLoad({filter:/.*/,namespace:'test'},()=>({contents:'export const env=globalThis.__authEnv',loader:'js'}))}}]});
 const {POST}=await import(pathToFileURL(output));const req=(email,secret=password,origin='https://board.test')=>new Request('https://board.test/api/auth/login',{method:'POST',headers:{'Content-Type':'application/json',Origin:origin},body:JSON.stringify({email,password:secret})});
 assert.equal((await POST(req('marketingluke09@gmail.com',password,'https://other.test'))).status,403);
 assert.equal((await POST(req('unknown@test.com'))).status,401);assert.equal((await POST(req('marketingluke09@gmail.com','wrong'))).status,401);
 for(const email of Object.keys(accounts)){const response=await POST(req(' '+email.toUpperCase()+' '));assert.equal(response.status,200);const cookie=response.headers.get('set-cookie');assert.match(cookie,/HttpOnly/);assert.match(cookie,/SameSite=Lax/);assert.match(cookie,/Secure/);assert.match(cookie,/Max-Age=43200/);const token=cookie.match(/marketing_session=([a-f0-9]+)/)[1];assert.equal(token.length,64);assert.equal(sqlite.prepare('SELECT count(*) n FROM marketing_sessions WHERE token_hash=?').get(token).n,0,'Raw session tokens are never stored');}
 assert.equal((await POST(req('ezequiel2303f@gmail.com'))).status,200);
 const before=sqlite.prepare('SELECT count(*) n FROM marketing_sessions').get().n;sqlite.prepare("UPDATE marketing_members SET role='administrador' WHERE persona='lucio'").run();assert.equal((await POST(req('marketingluke09@gmail.com'))).status,401);assert.equal(sqlite.prepare('SELECT count(*) n FROM marketing_sessions').get().n,before);
 for(let i=0;i<8;i++)assert.equal((await POST(req('blocked@test.com','wrong'))).status,401);const limited=await POST(req('blocked@test.com'));assert.equal(limited.status,429);assert.equal(limited.headers.get('retry-after'),'900');
 const outputCore=path.resolve('.sites-runtime/team-auth-core.mjs');await build({entryPoints:['app/team-auth.ts'],bundle:true,platform:'node',format:'esm',outfile:outputCore});const core=await import(pathToFileURL(outputCore));assert(await core.checkPassword(password,salt,hash));assert(!await core.checkPassword('wrong',salt,hash));assert(!core.validToken('forged'));assert.equal(core.sessionCookie('',false,0).includes('Max-Age=0'),true);
 sqlite.close();delete globalThis.__authEnv;console.log('PASS: four allowed accounts, password check, unknown and admin accounts denied, origin protection, private hashed sessions, expiry cookie and attempt limit.');
})().catch(error=>{console.error(error);process.exitCode=1});
