import {env} from 'cloudflare:workers';
import {getChatGPTUser} from './chatgpt-auth';
import {Actor,Persona} from './permissions';
export async function getActor(){const user=await getChatGPTUser();if(!user)return null;const db=env.DB!;
 await db.prepare('INSERT OR IGNORE INTO marketing_members(email,role) SELECT ?, ? WHERE NOT EXISTS (SELECT 1 FROM marketing_members)').bind(user.email.toLowerCase(),'administrador').run();
 const member=await db.prepare('SELECT role,persona FROM marketing_members WHERE email=?').bind(user.email.toLowerCase()).first<{role:string,persona:Persona}>();
 return {user,db,role:member?.role||'',persona:member?.persona||''} as {user:NonNullable<typeof user>,db:typeof db}&Actor;
}
