import {getActor} from '../../access';
import {validProfile,type Profiles} from '../../profiles';
import {teamAccounts,validTeamRole} from '../../team-auth';
const json=(value:unknown,status=200)=>Response.json(value,{status,headers:{'Cache-Control':'no-store'}});
export async function POST(req:Request){try{
 if(req.headers.get('origin')!==new URL(req.url).origin)return json({error:'Origem inválida.'},403);const actor=await getActor();if(!actor)return json({error:'Entre novamente.'},401);if(actor.role!=='administrador')return json({error:'Somente o administrador pode editar os perfis.'},403);
 const raw=await req.text();if(raw.length>2000)return json({error:'Perfil inválido.'},400);const body=JSON.parse(raw);if(!validProfile(body.email,body.name,body.photo))return json({error:'Informe nome e foto válidos.'},400);
 const row=await actor.db.prepare('SELECT data FROM marketing_preferences WHERE email=?').bind('_profiles').first<{data:string}>();const profiles:Profiles=row?JSON.parse(row.data):{};
 const loginEmail=String(body.loginEmail??profiles[body.email]?.loginEmail??body.email).trim().toLowerCase(),job=String(body.job??profiles[body.email]?.job??'').trim();
 if(!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(loginEmail)||loginEmail.length>254||job.length>100)return json({error:'Confira o e-mail e o cargo.'},400);
 if(Object.keys(teamAccounts).some(email=>email!==body.email&&(email===loginEmail||(profiles[email]?.loginEmail||email)===loginEmail)))return json({error:'Este e-mail já pertence a outro membro.'},409);
 if(body.role!==undefined&&(!validTeamRole(body.email,body.role)||(body.email===actor.user.email&&body.role!==actor.role)))return json({error:'Permissão inválida. O administrador deve manter seu acesso.'},400);
 if(body.photo&&body.photo!==profiles[body.email]?.photo){const id=body.photo.split('/').pop(),owner=await actor.db.prepare('SELECT email,task_id FROM marketing_central_uploads WHERE file_id=?').bind(id).first<{email:string,task_id:string}>();if(owner?.email!==actor.user.email||!['_background','_profile'].includes(owner.task_id))return json({error:'Envie a foto pela conta do administrador.'},403);await actor.db.prepare("UPDATE marketing_central_uploads SET task_id='_profile' WHERE file_id=? AND email=?").bind(id,actor.user.email).run()}
 profiles[body.email]={name:body.name.trim(),photo:body.photo,job,loginEmail};await actor.db.prepare('INSERT INTO marketing_preferences(email,data,updated_at) VALUES(?,?,?) ON CONFLICT(email) DO UPDATE SET data=excluded.data,updated_at=excluded.updated_at').bind('_profiles',JSON.stringify(profiles),Date.now()).run();if(body.role!==undefined)await actor.db.prepare('UPDATE marketing_members SET role=? WHERE email=?').bind(body.role,body.email).run();await actor.db.prepare('UPDATE marketing_board SET revision=revision+1 WHERE id=1').run();return json({profiles});
 }catch{return json({error:'Não foi possível salvar o perfil.'},503)}}
