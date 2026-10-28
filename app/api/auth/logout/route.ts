import {env} from 'cloudflare:workers';
import {cookies} from 'next/headers';
import {SESSION_COOKIE,validToken,tokenHash,sessionCookie} from '../../../team-auth';
export async function POST(req:Request){
 if(req.headers.get('origin')!==new URL(req.url).origin)return new Response(null,{status:403});
 const token=(await cookies()).get(SESSION_COOKIE)?.value;if(token&&validToken(token))await env.DB!.prepare('DELETE FROM marketing_sessions WHERE token_hash=?').bind(await tokenHash(token)).run();
 return new Response(null,{status:204,headers:{'Cache-Control':'no-store','Set-Cookie':sessionCookie('',new URL(req.url).protocol==='https:',0)}});
}
