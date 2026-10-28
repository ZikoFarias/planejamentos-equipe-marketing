import {env} from 'cloudflare:workers';
import {cookies} from 'next/headers';
import {getActor} from '../../../../access';
import {tokenHash,validToken,SESSION_COOKIE} from '../../../../team-auth';
import {exchangeCentralCode,protectCentralToken,CENTRAL_DRIVE_EMAIL} from '../../../../../server/drive-central-auth';
export async function GET(req:Request){try{
 const actor=await getActor();if(!actor||actor.role!=='administrador')return new Response('Entre novamente com a conta administradora.',{status:403});
 const url=new URL(req.url),state=url.searchParams.get('state')||'',code=url.searchParams.get('code')||'';const token=(await cookies()).get(SESSION_COOKIE)?.value;
 if(!token||!validToken(state)||!code||code.length>4096)return new Response('Autorização cancelada ou inválida. Inicie novamente pelo site.',{status:400});
 const pending=await env.DB!.prepare('DELETE FROM marketing_drive_auth_state WHERE state_hash=? AND session_hash=? RETURNING verifier,expires_at').bind(await tokenHash(state),await tokenHash(token)).first<{verifier:string,expires_at:number}>();
 if(!pending||pending.expires_at<=Date.now())return new Response('Autorização expirada ou já utilizada.',{status:400});
 const auth=await exchangeCentralCode({clientId:env.GOOGLE_DRIVE_CLIENT_ID!,clientSecret:env.GOOGLE_DRIVE_CLIENT_SECRET!,code,verifier:pending.verifier,redirectUri:new URL('/api/drive/central/callback',req.url).href});
 const encrypted=await protectCentralToken(auth.refreshToken,env.GOOGLE_DRIVE_ENCRYPTION_KEY!);
 await env.DB!.prepare('INSERT INTO marketing_drive_connection VALUES(1,?,?,?) ON CONFLICT(id) DO UPDATE SET email=excluded.email,encrypted_refresh=excluded.encrypted_refresh,connected_at=excluded.connected_at').bind(CENTRAL_DRIVE_EMAIL,encrypted,new Date().toISOString()).run();
 return new Response('Conta central marketinglukegroup@gmail.com autorizada. Você pode voltar ao planejamento. A autorização foi protegida no servidor.',{headers:{'Content-Type':'text/plain; charset=utf-8','Cache-Control':'no-store','Referrer-Policy':'no-referrer'}});
 }catch{return new Response('Não foi possível concluir. Confirme a conta marketinglukegroup@gmail.com e tente novamente pelo site.',{status:400,headers:{'Cache-Control':'no-store'}})}}
