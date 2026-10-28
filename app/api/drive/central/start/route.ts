import {env} from 'cloudflare:workers';
import {cookies} from 'next/headers';
import {getActor} from '../../../../access';
import {newToken,tokenHash,SESSION_COOKIE} from '../../../../team-auth';
import {centralAuthorizationUrl} from '../../../../../server/drive-central-auth';
export async function GET(req:Request){
 const actor=await getActor();if(!actor||actor.role!=='administrador')return new Response('Apenas o administrador pode autorizar a conta central.',{status:403});
 if(!env.GOOGLE_DRIVE_CLIENT_ID||!env.GOOGLE_DRIVE_CLIENT_SECRET||!env.GOOGLE_DRIVE_ENCRYPTION_KEY)return new Response('Credenciais centrais ainda não configuradas.',{status:503});
 const token=(await cookies()).get(SESSION_COOKIE)?.value;if(!token)return new Response('Entre com o e-mail administrador em /login.',{status:401});
 const state=newToken(),verifier=newToken(),digest=await crypto.subtle.digest('SHA-256',new TextEncoder().encode(verifier));const challenge=btoa(String.fromCharCode(...new Uint8Array(digest))).replaceAll('+','-').replaceAll('/','_').replaceAll('=','');
 await env.DB!.prepare('DELETE FROM marketing_drive_auth_state WHERE expires_at<=?').bind(Date.now()).run();
 await env.DB!.prepare('INSERT INTO marketing_drive_auth_state VALUES(?,?,?,?)').bind(await tokenHash(state),await tokenHash(token),verifier,Date.now()+600000).run();
 return Response.redirect(centralAuthorizationUrl(env.GOOGLE_DRIVE_CLIENT_ID,new URL('/api/drive/central/callback',req.url).href,state,challenge),302);
}
