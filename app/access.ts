import {env} from 'cloudflare:workers';
import {getChatGPTUser} from './chatgpt-auth';
import {Actor,Persona} from './permissions';
import {getTeamSession} from './team-session';
import {cookies} from 'next/headers';
import {SESSION_COOKIE} from './team-auth';
export async function getActor(){const db=env.DB!,session=await getTeamSession();if(session)return {...session,db};if((await cookies()).has(SESSION_COOKIE))return null;const user=await getChatGPTUser();if(!user)return null;
 const member=await db.prepare('SELECT role,persona FROM marketing_members WHERE email=?').bind(user.email.toLowerCase()).first<{role:string,persona:Persona}>();
 if(member?.role!=='administrador')return null;
 return {user,db,role:member.role,persona:member.persona||''} as {user:NonNullable<typeof user>,db:typeof db}&Actor;
}
