import type {Task} from '../app/model';
import type {Actor} from '../app/permissions';
import {changeCaption} from '../app/captions';
import {readStatusConfig} from '../app/status-config';
const json=(body:unknown,status=200)=>Response.json(body,{status,headers:{'Cache-Control':'no-store'}});
export async function handleCaption(req:Request,env:Cloudflare.Env,actor:(Actor&{user:{email:string}})|null){
 if(req.method!=='POST')return json({error:'Método inválido.'},405);
 if(req.headers.get('origin')!==new URL(req.url).origin)return json({error:'Origem inválida.'},403);
 if(!actor)return json({error:'Entre novamente.'},401);
 try{
 const body:any=await req.json();
 if(typeof body.id!=='string'||!['save','submit','request_adjust'].includes(body.action)||JSON.stringify(body).length>20000)return json({error:'Solicitação inválida.'},400);
 for(let attempt=0;attempt<4;attempt++){
 const row=await env.DB!.prepare('SELECT data,revision,status_config FROM marketing_board WHERE id=1').first<{data:string,revision:number,status_config:string}>();
 if(!row)return json({error:'Quadro indisponível.'},404);
 const tasks=JSON.parse(row.data) as Task[],task=tasks.find(t=>t.id===body.id);
 if(!task)return json({error:'Cartão não encontrado.'},404);
 let updated:Task;try{updated=changeCaption(task,{...actor,email:actor.user.email},body.action,body.text,body.version,readStatusConfig(row.status_config).labels)}catch(error){return json({error:(error as Error).message},403)}
 const at=new Date().toISOString(),text=body.action==='submit'?'Laura enviou a legenda para aprovação':body.action==='request_adjust'?'Solicitou ajuste da legenda':'Atualizou a legenda';
 updated={...updated,history:[{text,by:actor.user.email,at},...task.history]};
 const next=tasks.map(t=>t.id===task.id?updated:t);
 const result=await env.DB!.prepare('UPDATE marketing_board SET data=?,revision=revision+1 WHERE id=1 AND revision=?').bind(JSON.stringify(next),row.revision).run();
 if(result.meta.changes)return json({tasks:next,revision:row.revision+1,task:updated});
 }
 return json({error:'O quadro mudou. Tente novamente; sua legenda continua no campo.'},409);
 }catch{return json({error:'Não foi possível salvar a legenda. Tente novamente.'},500)}
}
