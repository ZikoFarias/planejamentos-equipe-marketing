import {isPurchase,approveQuote} from '../../purchases';
import {getActor} from '../../access';
import {canSeeTask} from '../../permissions';
import {castApprovalVote} from '../../approval';
import {readStatusConfig} from '../../status-config';
import type {Task} from '../../model';
export const dynamic='force-dynamic';
const json=(data:unknown,status=200)=>Response.json(data,{status,headers:{'Cache-Control':'no-store'}});
export async function POST(req:Request){
 try{
  if(req.headers.get('origin')!==new URL(req.url).origin)return json({error:'Origem inválida.'},403);
  const actor=await getActor();if(!actor)return json({error:'Entre novamente para votar.'},401);
  if(actor.role!=='administrador'&&!(actor.role==='editor'&&['lucio','mateus'].includes(actor.persona)))return json({error:'Apenas Lucio e Mateus podem registrar o próprio voto.'},403);
  const body:any=await req.json();if(typeof body.id!=='string'||!['approved','adjust'].includes(body.decision)||!Number.isSafeInteger(body.revision))return json({error:'Voto inválido.'},400);
  if(body.scope==='quote'&&body.decision!=='approved')return json({error:'Operação de orçamento inválida.'},400);
  const row=await actor.db.prepare('SELECT data,revision,status_config FROM marketing_board WHERE id=1').first<{data:string,revision:number,status_config:string}>();
  if(!row||row.revision!==body.revision)return json({error:'O quadro mudou. Recarregue e reabra o cartão antes de votar.'},409);
  const tasks=JSON.parse(row.data) as Task[],task=tasks.find(t=>t.id===body.id);
  if(!task||!canSeeTask(task,actor))return json({error:'Cartão indisponível para sua conta.'},403);
  if(isPurchase(task)&&actor.role!=='administrador'&&actor.persona!=='lucio')return json({error:'Compras são aprovadas apenas por Lucio.'},403);
  let updated:Task;try{updated=body.scope==='quote'?approveQuote(task,{...actor,email:actor.user.email,name:actor.user.displayName}):castApprovalVote(task,{...actor,email:actor.user.email,name:actor.user.displayName,reviewer:body.reviewer},body.decision,readStatusConfig(row.status_config))}catch(e:any){return json({error:e.message},400)}
  if(updated===task)return json({task,revision:row.revision});
  const result=await actor.db.prepare('UPDATE marketing_board SET data=?,revision=revision+1 WHERE id=1 AND revision=?').bind(JSON.stringify(tasks.map(t=>t.id===task.id?updated:t)),row.revision).run();
  if(!result.meta.changes)return json({error:'Outra pessoa votou ou alterou o quadro. Recarregue o cartão antes de tentar novamente.'},409);
  return json({task:updated,revision:row.revision+1});
 }catch{return json({error:'Não foi possível registrar o voto. Recarregue o cartão para conferir antes de tentar novamente.'},500)}
}
