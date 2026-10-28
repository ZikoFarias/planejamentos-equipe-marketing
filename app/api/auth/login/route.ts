import {env} from 'cloudflare:workers';
import {teamAccounts,validTeamRole,checkPassword,newToken,tokenHash,sessionCookie,SESSION_SECONDS} from '../../../team-auth';
const json=(body:unknown,status=200,headers:Record<string,string>={})=>Response.json(body,{status,headers:{'Cache-Control':'no-store',...headers}});
export async function POST(req:Request){try{
 if(req.headers.get('origin')!==new URL(req.url).origin)return json({error:'Origem inválida.'},403);
 if(!env.BOARD_LOGIN_HASH||!env.BOARD_LOGIN_SALT)return json({error:'O login da equipe ainda não foi configurado nesta hospedagem.'},503);
 const body:any=await req.json();if(typeof body.email!=='string'||body.email.length>320||typeof body.password!=='string'||body.password.length>256)return json({error:'Informe o e-mail cadastrado e a senha de acesso.'},400);
 const email=body.email.trim().toLowerCase(),key=await tokenHash(email),now=Date.now(),db=env.DB!;
 const attempt=await db.prepare('SELECT attempts,reset_at FROM marketing_login_attempts WHERE key=?').bind(key).first<{attempts:number,reset_at:number}>();
 if(attempt&&attempt.reset_at>now&&attempt.attempts>=8)return json({error:'Muitas tentativas. Aguarde 15 minutos antes de tentar novamente.'},429,{'Retry-After':'900'});
 await db.prepare('INSERT INTO marketing_login_attempts(key,attempts,reset_at) VALUES(?,1,?) ON CONFLICT(key) DO UPDATE SET attempts=CASE WHEN reset_at<=? THEN 1 ELSE attempts+1 END,reset_at=CASE WHEN reset_at<=? THEN excluded.reset_at ELSE reset_at END').bind(key,now+15*60*1000,now,now).run();
 const updatedAttempt=await db.prepare('SELECT attempts,reset_at FROM marketing_login_attempts WHERE key=?').bind(key).first<{attempts:number,reset_at:number}>();if(updatedAttempt&&updatedAttempt.attempts>8)return json({error:'Muitas tentativas. Aguarde 15 minutos antes de tentar novamente.'},429,{'Retry-After':'900'});
 const passwordOK=await checkPassword(body.password,env.BOARD_LOGIN_SALT,env.BOARD_LOGIN_HASH);
 const member=await db.prepare('SELECT role,persona FROM marketing_members WHERE email=?').bind(email).first<{role:string,persona:string}>();
 if(!passwordOK||!teamAccounts[email]||!member||!validTeamRole(email,member.role)||member.persona!==teamAccounts[email])return json({error:'E-mail ou senha inválidos. Use uma conta autorizada da equipe.'},401);
 const token=newToken();await db.prepare('INSERT INTO marketing_sessions(token_hash,email,expires_at) VALUES(?,?,?)').bind(await tokenHash(token),email,now+SESSION_SECONDS*1000).run();
 await db.prepare('DELETE FROM marketing_login_attempts WHERE key=? OR reset_at<=?').bind(key,now).run();await db.prepare('DELETE FROM marketing_sessions WHERE expires_at<=?').bind(now).run();
 return json({ok:true},200,{'Set-Cookie':sessionCookie(token,new URL(req.url).protocol==='https:')});
 }catch{return json({error:'Não foi possível entrar. Tente novamente.'},500)}}
