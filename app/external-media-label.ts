import type {Task} from './model';
import {labelName,type LabelConfig} from './labels';
const normalize=(value:string)=>value.normalize('NFD').replace(/[\u0300-\u036f]/g,'').trim().replace(/\s+/g,' ').toUpperCase();
export function externalMediaLabel(task:Pick<Task,'tags'>,config:LabelConfig={}){
 return task.tags.find(id=>[id,labelName(id,config)].some(value=>['MIDIA EXTERNA','MIDIA EXTERIOR'].includes(normalize(value))));
}
export function purchaseLabel(task:Pick<Task,'tags'>,config:LabelConfig={}){
 return task.tags.find(id=>[id,labelName(id,config)].some(value=>['COMPRA','COMPRAR'].includes(normalize(value))));
}
export function highlightedLabel(task:Task,config:LabelConfig={}){
 const media=externalMediaLabel(task,config),purchase=purchaseLabel(task,config);
 const approved=['aprovado ✅','concluidos e postados'].includes(task.status)||task.workflowResume==='aprovado ✅'||['aprovado','pagamento','aguardando chegada','concluído'].includes(task.purchase?.stage||'');
 return media&&(!purchase||!approved)?media:purchase||media;
}
