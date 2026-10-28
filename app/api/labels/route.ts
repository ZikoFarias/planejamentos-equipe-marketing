import {getActor} from '../../access';
import {readStatusConfig} from '../../status-config';
import {validLabel} from '../../labels';
import {companies} from '../../workflow';
import type {Task} from '../../model';
const json=(data:unknown,status=200)=>Response.json(data,{status});
export async function POST(req:Request){try{
 if(req.headers.get('origin')!==new URL(req.url).origin)return json({error:'Origem inválida.'},403);
 const actor=await getActor();if(!actor)return json({error:'Entre novamente.'},401);if(actor.role!=='administrador')return json({error:'Apenas administradores alteram etiquetas compartilhadas.'},403);
 const body:any=await req.json();if(typeof body.id!=='string'||!validLabel(body.name,body.color))return json({error:'Informe um nome e uma cor válidos.'},400);
 const row=await actor.db.prepare('SELECT data,revision,status_config FROM marketing_board WHERE id=1').first<{data:string,revision:number,status_config:string}>();if(!row||row.revision!==body.revision)return json({error:'O quadro mudou. Recarregue antes de editar a etiqueta.'},409);
 const tasks=JSON.parse(row.data) as Task[],known=new Set(['COMPRA',...companies.map(c=>c.id),...tasks.flatMap(t=>t.tags)]),config=readStatusConfig(row.status_config);if(!known.has(body.id))return json({error:'Salve um cartão com a nova etiqueta antes de editá-la.'},400);
 config.labels={...config.labels,[body.id]:{name:body.name.trim(),color:body.color.toLowerCase()}};
 const result=await actor.db.prepare('UPDATE marketing_board SET status_config=?,revision=revision+1 WHERE id=1 AND revision=?').bind(JSON.stringify(config),row.revision).run();if(!result.meta.changes)return json({error:'Outra pessoa alterou o quadro. Recarregue antes de tentar novamente.'},409);
 return json({labels:config.labels,revision:row.revision+1});
 }catch{return json({error:'Não foi possível salvar a etiqueta.'},500)}}
