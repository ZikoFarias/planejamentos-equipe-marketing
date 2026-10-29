import {teamAccounts,validTeamRole,newToken,tokenHash,validToken,sessionCookie,SESSION_SECONDS} from './team-auth';
import {verifyLoginProof} from './login-proof';
import {loginAccount} from './profiles';
const json=(body:unknown,status=200,headers:Record<string,string>={})=>Response.json(body,{status,headers:{'Cache-Control':'no-store',...headers}});
const denied=()=>json({error:'E-mail ou senha inválidos. Use uma conta autorizada da equipe.'},401);
export async function handleTeamLogin(req:Request,env:Cloudflare.Env,challengeRequest=false){try{
 if(req.method!=='POST')return json({error:'Método inválido.'},405,{'Allow':'POST'});
 if(req.headers.get('origin')!==new URL(req.url).origin)return json({error:'Origem inválida.'},403);
 if(!env.DB||!env.BOARD_LOGIN_HASH||!env.BOARD_LOGIN_SALT)return json({error:'O login da equipe ainda não foi configurado nesta hospedagem.'},503);
 if(Number(req.headers.get('content-length')||0)>4096)return json({error:'Solicitação inválida.'},400);
 const body:any=await req.json();if(typeof body.email!=='string'||body.email.length>320)return json({error:'Informe o e-mail cadastrado.'},400);
 const email=body.email.trim().toLowerCase(),db=env.DB,now=Date.now();
 if(challengeRequest){
  if(!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))return json({error:'Informe um e-mail válido.'},400);
  const key=await tokenHash(email);
  // The atomic reservation also limits concurrent attempts and challenge issuance.
  const attempt=await db.prepare('INSERT INTO marketing_login_attempts(key,attempts,reset_at) VALUES(?,1,?) ON CONFLICT(key) DO UPDATE SET attempts=CASE WHEN reset_at<=? THEN 1 ELSE attempts+1 END,reset_at=CASE WHEN reset_at<=? THEN excluded.reset_at ELSE reset_at END RETURNING attempts').bind(key,now+900000,now,now).first<{attempts:number}>();
  if(!attempt||attempt.attempts>8)return json({error:'Muitas tentativas. Aguarde 15 minutos antes de tentar novamente.'},429,{'Retry-After':'900'});
  const challenge=newToken();await db.prepare('DELETE FROM marketing_login_challenges WHERE expires_at<=?').bind(now).run();
  await db.prepare('INSERT INTO marketing_login_challenges(token_hash,email,expires_at) VALUES(?,?,?)').bind(await tokenHash(challenge),email,now+120000).run();
  return json({challenge,salt:env.BOARD_LOGIN_SALT});
 }
 if(typeof body.challenge!=='string'||!validToken(body.challenge)||typeof body.proof!=='string'||!validToken(body.proof))return denied();
 // Consume before verification: wrong passwords and simultaneous replays cannot reuse a challenge.
 const challenge=await db.prepare('DELETE FROM marketing_login_challenges WHERE token_hash=? RETURNING email,expires_at').bind(await tokenHash(body.challenge)).first<{email:string,expires_at:number}>();
 if(!challenge||challenge.email!==email||challenge.expires_at<=now)return denied();
 if(!await verifyLoginProof(env.BOARD_LOGIN_HASH,email,body.challenge,body.proof))return denied();
 const profileRow=await db.prepare('SELECT data FROM marketing_preferences WHERE email=?').bind('_profiles').first<{data:string}>();const account=loginAccount(email,profileRow?JSON.parse(profileRow.data):{});if(!account)return denied();
 const member=await db.prepare('SELECT role,persona FROM marketing_members WHERE email=?').bind(account).first<{role:string,persona:string}>();
 if(!member||!validTeamRole(account,member.role)||member.persona!==teamAccounts[account])return denied();
 const token=newToken();await db.prepare('INSERT INTO marketing_sessions(token_hash,email,expires_at) VALUES(?,?,?)').bind(await tokenHash(token),account,now+SESSION_SECONDS*1000).run();
 await db.prepare('DELETE FROM marketing_login_attempts WHERE key=? OR reset_at<=?').bind(await tokenHash(email),now).run();
 await db.prepare('DELETE FROM marketing_sessions WHERE expires_at<=?').bind(now).run();
 return json({ok:true},200,{'Set-Cookie':sessionCookie(token,new URL(req.url).protocol==='https:')});
 }catch{return json({error:'Não foi possível entrar. Tente novamente.'},500)}}
