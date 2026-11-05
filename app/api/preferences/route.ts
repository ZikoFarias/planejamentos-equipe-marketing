import {env} from 'cloudflare:workers';
import {getActor} from '../../access';
import {defaultAppearance,validAppearance,sharedAppearance,appearanceAreas,type Appearance} from '../../appearance';
const json=(data:unknown,status=200)=>Response.json(data,{status,headers:{'Cache-Control':'private, no-store'}});
async function read(db:D1Database,key:string){const row=await db.prepare('SELECT data FROM marketing_preferences WHERE email=?').bind(key).first<{data:string}>();const value=row?JSON.parse(row.data):defaultAppearance;return {exists:!!row,value:validAppearance(value)?value:defaultAppearance}}
export async function GET(){try{const actor=await getActor();if(!actor?.role)return json({error:'Entre novamente para abrir sua aparência.'},401);const [personal,shared]=await Promise.all([read(actor.db,actor.user.email.toLowerCase()),read(actor.db,'_team_defaults')]);return json(shared.exists?sharedAppearance(personal.value,shared.value):personal.value)}catch{return json({error:'Não foi possível carregar sua aparência. O quadro continua disponível.'},503)}}
export async function POST(req:Request){try{
 if(req.headers.get('origin')!==new URL(req.url).origin)return json({error:'Origem inválida.'},403);
 const actor=await getActor();if(!actor?.role)return json({error:'Entre novamente para salvar sua aparência.'},401);
 const raw=await req.text();if(raw.length>64000)return json({error:'Preferências inválidas.'},400);
 const value=JSON.parse(raw);if(!validAppearance(value))return json({error:'Preferências inválidas.'},400);
 const section=(value as any).section as string|undefined,scope=(value as any).scope||'general';
 if(section!==undefined&&!['background','statuses'].includes(section)||section==='statuses'&&scope!=='general'&&!(appearanceAreas as readonly string[]).includes(scope))return json({error:'Configuração inválida.'},400);
 if(section==='statuses'&&actor.role!=='administrador')return json({error:'Apenas o administrador pode alterar nomes e cores.'},403);
 if(section!=='statuses'&&value.background){
  if(value.background.startsWith('/api/background/')){const id=value.background.split('/').pop();const owner=await actor.db.prepare('SELECT email,task_id FROM marketing_central_uploads WHERE file_id=?').bind(id).first<{email:string,task_id:string}>();if(owner?.email!==actor.user.email.toLowerCase()||owner.task_id!=='_background')return json({error:'Escolha uma imagem de fundo enviada por você.'},403)}
  else{const id=value.background.split('/').pop();const owner=await actor.db.prepare('SELECT email FROM marketing_uploads WHERE id=?').bind(id).first<{email:string}>();if(!env.BUCKET||owner?.email!==actor.user.email.toLowerCase()||!await env.BUCKET.head(id!))return json({error:'Envie sua imagem de fundo novamente.'},400)}
 }
 const [personal,shared]=await Promise.all([read(actor.db,actor.user.email.toLowerCase()),read(actor.db,'_team_defaults')]);
 let nextShared=shared.value,nextPersonal:Appearance;
 if(actor.role==='administrador'&&section!=='background'){
  nextShared=section==='statuses'&&scope!=='general'?{...shared.value,areas:{...shared.value.areas,[scope]:value.areas?.[scope]||{colors:{},names:{}}}}:{...shared.value,colors:value.colors,names:value.names||(section===undefined?shared.value.names:undefined)||{},...(section===undefined&&value.areas?{areas:value.areas}:{})};
  nextShared={...nextShared,background:''};
  await actor.db.prepare('INSERT INTO marketing_preferences(email,data,updated_at) VALUES(?,?,?) ON CONFLICT(email) DO UPDATE SET data=excluded.data,updated_at=excluded.updated_at').bind('_team_defaults',JSON.stringify(nextShared),Date.now()).run();
  await actor.db.prepare('UPDATE marketing_board SET revision=revision+1 WHERE id=1').run();
 }
 if(section==='statuses')nextPersonal=sharedAppearance(personal.value,nextShared);
 else if(section==='background')nextPersonal=sharedAppearance({...personal.value,background:value.background,backgroundColor:value.backgroundColor||'',headerColor:value.headerColor??personal.value.headerColor},nextShared);
 else{const {section:ignored,scope:ignoredScope,...clean}=value as any;nextPersonal=sharedAppearance(clean,nextShared);if(actor.role!=='administrador'){delete nextPersonal.names;delete nextPersonal.areas;if(nextShared.names)nextPersonal.names=nextShared.names;if(nextShared.areas)nextPersonal.areas=nextShared.areas;}}
 await actor.db.prepare('INSERT INTO marketing_preferences(email,data,updated_at) VALUES(?,?,?) ON CONFLICT(email) DO UPDATE SET data=excluded.data,updated_at=excluded.updated_at').bind(actor.user.email.toLowerCase(),JSON.stringify(nextPersonal),Date.now()).run();
 return json(nextPersonal);
 }catch{return json({error:'Não foi possível salvar a aparência. A configuração anterior foi preservada.'},503)}}
