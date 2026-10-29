import {env} from 'cloudflare:workers';
import {getActor} from '../../access';
import {teamAccounts,tokenHash,validToken} from '../../team-auth';
import {accountPassword} from '../../password-store';
import {verifyLoginProof} from '../../login-proof';
const json=(value:unknown,status=200)=>Response.json(value,{status,headers:{'Cache-Control':'no-store'}});
export async function POST(req:Request){try{
 if(req.headers.get('origin')!==new URL(req.url).origin)return json({error:'Origem inválida.'},403);
 const actor=await getActor();if(!actor)return json({error:'Entre novamente.'},401);
 const raw=await req.text();if(raw.length>2000)return json({error:'Solicitação inválida.'},400);const body=JSON.parse(raw),email=body.email||actor.user.email;
 if(typeof email!=='string'||!Object.hasOwn(teamAccounts,email))return json({error:'Membro inválido.'},400);
 const own=email===actor.user.email;if(!own&&actor.role!=='administrador')return json({error:'Você só pode trocar sua própria senha.'},403);
 if(typeof body.salt!=='string'||!/^[a-f0-9]{32}$/.test(body.salt)||typeof body.hash!=='string'||!/^[a-f0-9]{64}$/.test(body.hash))return json({error:'Nova senha inválida.'},400);
 if(own){
  if(typeof body.challenge!=='string'||!validToken(body.challenge)||typeof body.proof!=='string'||!validToken(body.proof))return json({error:'Confirme sua senha atual.'},400);
  const challenge=await actor.db.prepare('DELETE FROM marketing_login_challenges WHERE token_hash=? RETURNING email,expires_at').bind(await tokenHash(body.challenge)).first<{email:string,expires_at:number}>();
  const profiles=await actor.db.prepare('SELECT data FROM marketing_preferences WHERE email=?').bind('_profiles').first<{data:string}>();const loginEmail=profiles?JSON.parse(profiles.data)[email]?.loginEmail||email:email;
  const verifier=await accountPassword(actor.db,email,{salt:env.BOARD_LOGIN_SALT!,hash:env.BOARD_LOGIN_HASH!});
  if(!challenge||challenge.email!==loginEmail||challenge.expires_at<=Date.now()||!await verifyLoginProof(verifier.hash,loginEmail,body.challenge,body.proof))return json({error:'Senha atual incorreta ou confirmação expirada.'},403);
 }
 await actor.db.batch([
  actor.db.prepare('INSERT INTO marketing_preferences(email,data,updated_at) VALUES(?,?,?) ON CONFLICT(email) DO UPDATE SET data=excluded.data,updated_at=excluded.updated_at').bind('_password:'+email,JSON.stringify({salt:body.salt,hash:body.hash}),Date.now()),
  actor.db.prepare('DELETE FROM marketing_sessions WHERE email=?').bind(email),
 ]);
 return json({ok:true,signInAgain:own});
 }catch{return json({error:'Não foi possível alterar a senha. Tente novamente.'},503)}}
