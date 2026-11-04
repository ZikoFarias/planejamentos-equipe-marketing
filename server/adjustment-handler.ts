import {canCancelAdjustment,cancelTaskAdjustment} from '../app/adjustments';
import type {Actor} from '../app/permissions';
import type {Task} from '../app/model';
import {readStatusConfig} from '../app/status-config';
const json=(body:unknown,status=200)=>Response.json(body,{status,headers:{'Cache-Control':'no-store'}});
export async function handleCancelAdjustment(req:Request,env:Cloudflare.Env,actor:(Actor&{user:{email:string}})|null){
 if(req.method!=='POST')return json({error:'Método inválido.'},405);
 if(req.headers.get('origin')!==new URL(req.url).origin)return json({error:'Origem inválida.'},403);
 if(!actor)return json({error:'Entre novamente.'},401);
 try{
 const body:any=await req.json();if(typeof body.id!=='string'||body.id.length>200||!Number.isSafeInteger(body.revision)||JSON.stringify(body).length>14000)return json({error:'Solicitação inválida.'},400);
 const row=await env.DB!.prepare('SELECT data,revision,status_config FROM marketing_board WHERE id=1').first<{data:string,revision:number,status_config:string}>();
 if(!row||row.revision!==body.revision)return json({error:'O quadro mudou. Reabra o cartão para conferir antes de cancelar o ajuste.'},409);
 const tasks=JSON.parse(row.data) as Task[],task=tasks.find(item=>item.id===body.id);
 if(!task||!canCancelAdjustment(task,actor))return json({error:'Este ajuste não está disponível para sua conta.'},403);
 let updated:Task;try{updated=cancelTaskAdjustment(task,actor,readStatusConfig(row.status_config),body.captionText)}catch(error){return json({error:(error as Error).message},400)}
 updated={...updated,history:[{text:(task.status==='ajustar legenda'?'Cancelou o ajuste de legenda':'Cancelou o ajuste de arte')+' e devolveu o cartão para aprovação.',by:actor.user.email,at:new Date().toISOString()},...task.history]};
 const next=tasks.map(item=>item.id===task.id?updated:item);
 const result=await env.DB!.prepare('UPDATE marketing_board SET data=?,revision=revision+1 WHERE id=1 AND revision=?').bind(JSON.stringify(next),row.revision).run();
 if(!result.meta.changes)return json({error:'O cartão mudou durante o cancelamento. Confira antes de tentar novamente.'},409);
 return json({tasks:next,revision:row.revision+1,task:updated});
 }catch{return json({error:'Não foi possível cancelar o ajuste. Tente novamente.'},500)}
}
