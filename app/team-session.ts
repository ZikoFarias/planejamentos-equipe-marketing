import {cookies} from 'next/headers';
import {env} from 'cloudflare:workers';
import {SESSION_COOKIE,tokenHash,validToken,teamAccounts,validTeamRole} from './team-auth';
import {names,type Persona} from './permissions';
export async function getTeamSession(){
 const token=(await cookies()).get(SESSION_COOKIE)?.value;if(!token||!validToken(token))return null;
 const member=await env.DB!.prepare('SELECT m.email,m.role,m.persona FROM marketing_sessions s JOIN marketing_members m ON m.email=s.email WHERE s.token_hash=? AND s.expires_at>?').bind(await tokenHash(token),Date.now()).first<{email:string,role:string,persona:Persona}>();
 if(!member||!validTeamRole(member.email,member.role)||teamAccounts[member.email]!==member.persona)return null;
 return {user:{userId:member.email,email:member.email,displayName:names[member.persona],fullName:names[member.persona]},role:member.role,persona:member.persona};
}
