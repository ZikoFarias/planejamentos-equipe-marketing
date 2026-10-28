import {env} from 'cloudflare:workers';
import {getActor} from '../../../../access';
import {canSeeTask} from '../../../../permissions';
import type {Task} from '../../../../model';
import {centralAccess} from '../../../../../server/drive-central-storage';
export async function GET(req:Request){try{
 const actor=await getActor();if(!actor)return new Response('Entre novamente.',{status:401});
 const id=new URL(req.url).searchParams.get('id')||'';if(!/^[\w-]{10,200}$/.test(id))return new Response('Inválido.',{status:400});
 const row=await env.DB!.prepare('SELECT data FROM marketing_board WHERE id=1').first<{data:string}>();const tasks=JSON.parse(row?.data||'[]') as Task[];
 const linked=tasks.some(t=>canSeeTask(t,actor)&&t.attachments.some(a=>a.drive?.fileId===id));
 const pending=await env.DB!.prepare('SELECT email FROM marketing_central_uploads WHERE file_id=?').bind(id).first<{email:string}>();
 if(!pending||(!linked&&pending.email!==actor.user.email))return new Response('Arquivo indisponível.',{status:403});
 const headers:Record<string,string>={Authorization:'Bearer '+await centralAccess(env)};const range=req.headers.get('Range');if(range)headers.Range=range;
 const file=await fetch('https://www.googleapis.com/drive/v3/files/'+id+'?alt=media&supportsAllDrives=true',{headers});if(!file.ok)return new Response('Arquivo indisponível no Drive.',{status:502});
 const out=new Headers({'Cache-Control':'private, no-store','X-Content-Type-Options':'nosniff','Content-Disposition':'inline'});for(const name of ['Content-Type','Content-Length','Content-Range','Accept-Ranges']){const value=file.headers.get(name);if(value)out.set(name,value)}
 if(!/^(image\/(png|jpeg|webp|gif|avif)|video\/(mp4|webm|quicktime)|application\/pdf)(;|$)/.test(out.get('Content-Type')||''))out.set('Content-Disposition','attachment');
 return new Response(file.body,{status:file.status,headers:out});
 }catch{return new Response('Conexão central indisponível.',{status:503})}}
