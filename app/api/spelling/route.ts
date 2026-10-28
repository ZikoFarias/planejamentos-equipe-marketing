import {env} from 'cloudflare:workers';
import {getActor} from '../../access';
import {isPurchase} from '../../purchases';
import {canManageTask,canSeeTask} from '../../permissions';
import {spellingFingerprint} from '../../spelling';
import type {Task} from '../../model';
import {reviewArtwork,updateSpelling} from '../../../server/spelling-review';
const json=(value:unknown,status=200)=>Response.json(value,{status,headers:{'Cache-Control':'no-store'}});
export async function POST(req:Request){try{
 if(req.headers.get('origin')!==new URL(req.url).origin)return json({error:'Origem inválida.'},403);
 const actor=await getActor();if(!actor)return json({error:'Entre novamente.'},401);
 const body:any=await req.json();if(typeof body.id!=='string'||!['review','dismiss'].includes(body.action))return json({error:'Operação inválida.'},400);
 const row=await env.DB!.prepare('SELECT data FROM marketing_board WHERE id=1').first<{data:string}>();const task=(JSON.parse(row?.data||'[]') as Task[]).find(t=>t.id===body.id);if(!task||!canSeeTask(task,actor))return json({error:'Cartão indisponível.'},403);
 if(body.action==='dismiss'){
  if(actor.role!=='administrador'&&!(actor.role==='editor'&&(actor.persona==='lucio'||(actor.persona==='mateus'&&!isPurchase(task)))))return json({error:'Somente os revisores podem descartar um alerta.'},403);
  if(task.spelling?.state!=='flagged')return json({error:'Não há alerta para descartar.'},409);
  const fingerprint=spellingFingerprint(task);await updateSpelling(env,task.id,fingerprint,t=>({...t,spelling:{...t.spelling!,state:'dismissed',message:'Alerta descartado após revisão humana.'},history:[{text:'Descartou o alerta ortográfico após revisão humana.',by:actor.user.displayName,at:new Date().toISOString()},...t.history]}));return snapshot(actor); 
 }
 if(!canManageTask(task,actor))return json({error:'Sem permissão para analisar este cartão.'},403);
 await reviewArtwork(env,task.id,fetch,true);return snapshot(actor);
 }catch{return json({error:'A verificação está pendente. Tente novamente.'},503)}}

async function snapshot(actor:any){const row=await env.DB!.prepare('SELECT data,revision FROM marketing_board WHERE id=1').first<{data:string,revision:number}>();return json({tasks:(JSON.parse(row?.data||'[]') as Task[]).filter(t=>canSeeTask(t,actor)),revision:row?.revision})}
