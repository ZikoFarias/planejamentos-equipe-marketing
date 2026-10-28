import assert from 'node:assert/strict';
import {centralAccount,centralAuthorizationUrl,exchangeCentralCode,refreshCentralAccess,protectCentralToken,revealCentralToken,CENTRAL_DRIVE_EMAIL} from '../server/drive-central-auth';
const url=new URL(centralAuthorizationUrl('client','https://board.test/api/drive/central/callback','random-state','pkce'));
assert.equal(url.searchParams.get('state'),'random-state');assert.equal(url.searchParams.get('code_challenge_method'),'S256');assert.equal(url.searchParams.get('access_type'),'offline');assert.equal(url.searchParams.get('login_hint'),CENTRAL_DRIVE_EMAIL);
await assert.rejects(()=>centralAccount('token',async()=>Response.json({email:'other@gmail.com',email_verified:true})),/apenas a conta/);
await assert.rejects(()=>centralAccount('token',async()=>Response.json({email:CENTRAL_DRIVE_EMAIL,email_verified:false})),/apenas a conta/);
const tokens=await exchangeCentralCode({clientId:'client',clientSecret:'test-secret',code:'code',verifier:'proof',redirectUri:'https://board.test/api/drive/central/callback'},async(url,init)=>{
 if(url.includes('userinfo'))return Response.json({email:CENTRAL_DRIVE_EMAIL,email_verified:true});assert.equal(init.body.get('code_verifier'),'proof');return Response.json({access_token:'access',refresh_token:'refresh'});
});assert.equal(tokens.refreshToken,'refresh');
await assert.rejects(()=>refreshCentralAccess({clientId:'',clientSecret:'',refreshToken:''}),/administrador/);
assert.equal(await refreshCentralAccess({clientId:'client',clientSecret:'secret',refreshToken:'refresh'},async(url,init)=>{assert.equal(init.body.get('grant_type'),'refresh_token');return Response.json({access_token:'renewed'})}),'renewed');
const key=btoa('k'.repeat(32)),encrypted=await protectCentralToken('private-refresh-token',key);assert(!encrypted.includes('private-refresh-token'));assert.equal(await revealCentralToken(encrypted,key),'private-refresh-token');await assert.rejects(()=>revealCentralToken(encrypted,btoa('x'.repeat(32))));
console.log('PASS: central account pinned, verified email, offline consent, PKCE, refresh credentials remain server-side, token encryption and wrong-key rejection.');
