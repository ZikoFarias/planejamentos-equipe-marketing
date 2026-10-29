import {driveFolders} from '../../../../drive-config';
import {env} from 'cloudflare:workers';
import {getActor} from '../../../../access';
import {canSeeTask} from '../../../../permissions';
import type {Task} from '../../../../model';
import {centralAccess} from '../../../../../server/drive-central-storage';
export async function GET(req:Request){try{
 const actor=await getActor();if(!actor)return new Response('Entre novamente.',{status:401});
 const id=new URL(req.url).searchParams.get('id')||'';if(!/^[\w-]{10,200}$/.test(id))return new Response('Inválido.',{status:400});
 const row=await env.DB!.prepare('SELECT data FROM marketing_board WHERE id=1').first<{data:string}>();const tasks=JSON.parse(row?.data||'[]') as Task[];
 const linkedTask=tasks.find(t=>canSeeTask(t,actor)&&t.attachments.some(a=>a.drive?.fileId===id));const linked=!!linkedTask;
 let pending=await env.DB!.prepare('SELECT email,task_id FROM marketing_central_uploads WHERE file_id=?').bind(id).first<{email:string,task_id:string}>();
 if(!pending&&linkedTask){const metadata=await fetch('https://www.googleapis.com/drive/v3/files/'+id+'?fields=id,parents&supportsAllDrives=true',{headers:{Authorization:'Bearer '+await centralAccess(env)}});if(metadata.ok){const actual:any=await metadata.json();const allowed=new Set(Object.values(driveFolders).flatMap(f=>Object.values(f)));if(actual.id===id&&actual.parents?.some((parent:string)=>allowed.has(parent))){await env.DB!.prepare('INSERT OR IGNORE INTO marketing_central_uploads(file_id,email,task_id,created_at) VALUES(?,?,?,?)').bind(id,actor.user.email,linkedTask.id,Date.now()).run();pending={email:actor.user.email,task_id:linkedTask.id}}}}
 if(pending?.task_id==='_background'&&pending.email!==actor.user.email)return new Response('Arquivo pessoal indisponível.',{status:403});
 if(!pending||(!linked&&pending.email!==actor.user.email))return new Response('Arquivo indisponível.',{status:403});
 const headers:Record<string,string>={Authorization:'Bearer '+await centralAccess(env)};const range=req.headers.get('Range');if(range)headers.Range=range;
 const file=await fetch('https://www.googleapis.com/drive/v3/files/'+id+'?alt=media&supportsAllDrives=true',{headers});if(!file.ok)return new Response('Arquivo indisponível no Drive.',{status:502});
 const out=new Headers({'Cache-Control':'private, no-store','X-Content-Type-Options':'nosniff','Content-Disposition':new URL(req.url).searchParams.get('download')==='1'?"attachment; filename*=UTF-8''"+encodeURIComponent(linkedTask?.attachments.find(a=>a.drive?.fileId===id)?.name||'arquivo'):'inline'});for(const name of ['Content-Type','Content-Length','Content-Range','Accept-Ranges']){const value=file.headers.get(name);if(value)out.set(name,value)}
 if(!/^(image\/(png|jpeg|webp|gif|avif)|video\/(mp4|webm|quicktime)|application\/pdf)(;|$)/.test(out.get('Content-Type')||''))out.set('Content-Disposition','attachment');
 return new Response(file.body,{status:file.status,headers:out});
 }catch{return new Response('Conexão central indisponível.',{status:503})}}
