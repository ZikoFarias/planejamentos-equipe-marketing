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
 for(let attempt=0;attempt<4;attempt++){
  const row=await env.DB!.prepare('SELECT data,revision FROM marketing_board WHERE id=1').first<{data:string,revision:number}>();const tasks=JSON.parse(row?.data||'[]') as Task[],task=tasks.find(t=>t.id===body.taskId);
  if(!task||!canSeeTask(task,actor)||!canManageTask(task,actor))return json({error:'Sem permissão para comentar neste cartão.'},403);
  const existing=task.comments.find(c=>c.id===body.id);if(existing){if(existing.by!==actor.user.email||existing.text!==body.text.trim()||JSON.stringify(existing.attachments?.map(a=>a.url)||[])!==JSON.stringify([...new Set(body.urls)]))return json({error:'Este comentário já foi enviado. Recarregue o cartão para conferir.'},409);return json({tasks:tasks.filter(t=>canSeeTask(t,actor)),revision:row!.revision});}
  if(body.urls.length&&!canAttachArt(task,actor))return json({error:'Seu perfil não pode adicionar mídia nesta etapa.'},403);
  const urls=[...new Set(body.urls)] as string[],attachments=urls.map(url=>task.attachments.find(a=>a.url===url));if(attachments.some(a=>!a))return json({error:'Aguarde as imagens terminarem de enviar antes de comentar.'},400);
  const comment={id:body.id,text:body.text.trim(),by:actor.user.email,at:new Date().toISOString(),...(attachments.length?{attachments:attachments as Task['attachments']}:{})};const next=tasks.map(t=>t.id===task.id?{...t,comments:[...t.comments,comment]}:t);
  const result=await env.DB!.prepare('UPDATE marketing_board SET data=?,revision=revision+1 WHERE id=1 AND revision=?').bind(JSON.stringify(next),row!.revision).run();if(result.meta.changes)return json({tasks:next.filter(t=>canSeeTask(t,actor)),revision:row!.revision+1});
 }
 return json({error:'O cartão está recebendo outras alterações. Tente enviar novamente.'},409);
}catch{return json({error:'Não foi possível confirmar o comentário. Suas imagens continuam no cartão; tente novamente.'},503)}}
