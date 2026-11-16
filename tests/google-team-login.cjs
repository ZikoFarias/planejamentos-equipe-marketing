const assert = require('node:assert/strict');
const {build} = require('esbuild');
const {DatabaseSync} = require('node:sqlite');
const {pathToFileURL} = require('node:url');
const path = require('node:path');

(async () => {
 const {generateKeyPair, exportJWK, SignJWT} = await import('jose');
 const {publicKey, privateKey} = await generateKeyPair('RS256');
 const jwk = {...await exportJWK(publicKey), kid: 'test', alg: 'RS256'};
 global.fetch = async url => {
  assert.equal(String(url), 'https://www.googleapis.com/oauth2/v3/certs');
  return Response.json({keys: [jwk]});
 };
 const outfile = path.resolve('.sites-runtime/google-team-login-test.mjs');
 await build({entryPoints: ['app/google-team-login.ts'], bundle: true, platform: 'node', format: 'esm', outfile});
 const {handleGoogleTeamLogin} = await import(pathToFileURL(outfile).href);
 const sqlite = new DatabaseSync(':memory:');
 sqlite.exec(`CREATE TABLE marketing_login_challenges(token_hash TEXT PRIMARY KEY,email TEXT,expires_at INTEGER);
 CREATE TABLE marketing_sessions(token_hash TEXT PRIMARY KEY,email TEXT,expires_at INTEGER);
 CREATE TABLE marketing_preferences(email TEXT PRIMARY KEY,data TEXT);
 CREATE TABLE marketing_members(email TEXT PRIMARY KEY,role TEXT,persona TEXT);
 INSERT INTO marketing_members VALUES('marketingluke09@gmail.com','editor','lucio');`);
 const db = {
  prepare(sql) {return {bind(...args) {return {first: async () => sqlite.prepare(sql).get(...args), run: async () => sqlite.prepare(sql).run(...args)};}};},
  batch: async statements => Promise.all(statements.map(statement => statement.run())),
 };
 const env = {DB: db, GOOGLE_DRIVE_CLIENT_ID: 'test-client'};
 const origin = 'https://board.test';
 const post = (body, cookie = '', requestOrigin = origin) => handleGoogleTeamLogin(new Request(origin + '/api/auth/google', {method: 'POST', headers: {origin: requestOrigin, cookie}, body: JSON.stringify(body)}), env);
 assert.equal((await post({action: 'start'}, '', 'https://other.test')).status, 403);
 const start = await post({action: 'start'});
 const {nonce} = await start.json();
 const cookie = start.headers.get('set-cookie').split(';')[0];
 const sign = (email, audience, tokenNonce = nonce) => new SignJWT({email, email_verified: true, nonce: tokenNonce})
  .setProtectedHeader({alg: 'RS256', kid: 'test'}).setIssuer('https://accounts.google.com').setAudience(audience)
  .setSubject('google-user').setIssuedAt().setExpirationTime('5m').sign(privateKey);
 for (const credential of [await sign('other@gmail.com', 'test-client'), await sign('marketingluke09@gmail.com','wrong-client'), await sign('marketingluke09@gmail.com','test-client','wrong-nonce')]) {
  assert.equal((await post({credential}, cookie)).status, 401);
 }
 const credential = await sign('marketingluke09@gmail.com', 'test-client');
 const result = await post({credential}, cookie);
 assert.equal(result.status, 200);
 assert(result.headers.getSetCookie().some(value => value.startsWith('marketing_session=') && value.includes('HttpOnly')));
 assert.equal(sqlite.prepare('SELECT email FROM marketing_sessions').get().email, 'marketingluke09@gmail.com');
 assert.equal((await post({credential}, cookie)).status, 401);
 console.log('PASS: Google login checks account, audience, nonce and origin, issues a private session and rejects replay.');
})().catch(error => {console.error(error); process.exitCode = 1;});
