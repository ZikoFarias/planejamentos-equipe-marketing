import {mentionedEmails} from '../../comment-mentions';
import {env} from 'cloudflare:workers';
import {getActor} from '../../access';
import {canManageTask,canSeeTask} from '../../permissions';
import {canAttachArt} from '../../art-flow';
import type {Task} from '../../model';
const json=(value:unknown,status=200)=>Response.json(value,{status,headers:{'Cache-Control':'no-store'}});
export async function POST(req:Request){try{
 if(req.headers.get('origin')!==new URL(req.url).origin)return json({error:'Origem inválida.'},403);
 const actor=await getActor();if(!actor)return json({error:'Entre novamente.'},401);
 const body:any=await req.json();if(typeof body.taskId!=='string'||typeof body.id!=='string'||!/^[a-f0-9-]{36}$/.test(body.id)||typeof body.text!=='string'||body.text.length>10000||!Array.isArray(body.urls)||body.urls.length>20||body.urls.some((url:unknown)=>typeof url!=='string')||!body.text.trim()&&!body.urls.length)return json({error:'Adicione um comentário ou uma imagem.'},400);

 const profilesRow=body.text.includes('@')?await env.DB!.prepare('SELECT data FROM marketing_preferences WHERE email=?').bind('_profiles').first<{data:string}>():null;
 const profiles=profilesRow?JSON.parse(profilesRow.data):{},mentioned=mentionedEmails(body.text,profiles);
 const people=mentioned.length?(await env.DB!.prepare("SELECT email,role,persona FROM marketing_members WHERE role IN ('administrador','editor','visualizador')").all<{email:string,role:string,persona:import('../../permissions').Persona}>()).results:[];
 for(let attempt=0;attempt<4;attempt++){
  const row=await env.DB!.prepare('SELECT data,revision FROM marketing_board WHERE id=1').first<{data:string,revision:number}>();const tasks=JSON.parse(row?.data||'[]') as Task[],task=tasks.find(t=>t.id===body.taskId);
  if(!task||!canSeeTask(task,actor)||!canManageTask(task,actor))return json({error:'Sem permissão para comentar neste cartão.'},403);
  const existing=task.comments.find(c=>c.id===body.id);if(existing){if(existing.by!==actor.user.email||existing.text!==body.text.trim()||JSON.stringify(existing.attachments?.map(a=>a.url)||[])!==JSON.stringify([...new Set(body.urls)]))return json({error:'Este comentário já foi enviado. Recarregue o cartão para conferir.'},409);return json({tasks:tasks.filter(t=>canSeeTask(t,actor)),revision:row!.revision});}
  if(body.urls.length&&!canAttachArt(task,actor))return json({error:'Seu perfil não pode adicionar mídia nesta etapa.'},403);
  const urls=[...new Set(body.urls)] as string[],attachments=urls.map(url=>task.attachments.find(a=>a.url===url));if(attachments.some(a=>!a))return json({error:'Aguarde os arquivos terminarem de enviar antes de comentar.'},400);
  const comment={id:body.id,text:body.text.trim(),by:actor.user.email,at:new Date().toISOString(),...(attachments.length?{attachments:attachments as Task['attachments']}:{})};const next=tasks.map(t=>t.id===task.id?{...t,comments:[...t.comments,comment]}:t);

  const update=env.DB!.prepare('UPDATE marketing_board SET data=?,revision=revision+1 WHERE id=1 AND revision=?').bind(JSON.stringify(next),row!.revision);
  const recipients=people.filter(person=>mentioned.includes(person.email)&&person.email!==actor.user.email&&canSeeTask(task,person));
  const notifications=recipients.map(person=>env.DB!.prepare("INSERT OR IGNORE INTO marketing_notifications(event_key,email,kind,task_id,title,message,targets,created_at) SELECT ?,?,'comment-mention',?,?,?,?,? WHERE EXISTS(SELECT 1 FROM marketing_board b,json_each(b.data) task,json_each(task.value,'$.comments') item WHERE b.id=1 AND json_extract(task.value,'$.id')=? AND json_extract(item.value,'$.id')=? AND json_extract(item.value,'$.by')=? AND json_extract(item.value,'$.text')=?)").bind('mention:'+task.id+':'+comment.id+':'+person.email,person.email,task.id,'Você foi marcado em um comentário',(profiles[actor.user.email]?.name||actor.user.displayName||'Um integrante')+' marcou você em '+task.title+': '+comment.text.slice(0,250),'[]',comment.at,task.id,comment.id,actor.user.email,comment.text));
  const result=notifications.length?(await env.DB!.batch([update,...notifications]))[0]:await update.run();if(result.meta.changes)return json({tasks:next.filter(t=>canSeeTask(t,actor)),revision:row!.revision+1});

 }
 return json({error:'O cartão está recebendo outras alterações. Tente enviar novamente.'},409);
}catch{return json({error:'Não foi possível confirmar o comentário. Seus arquivos continuam no cartão; tente novamente.'},503)}}
