import type {Task} from './model';
import {labelName,type LabelConfig} from './labels';
const normalize=(value:string)=>value.normalize('NFD').replace(/[\u0300-\u036f]/g,'').trim().replace(/\s+/g,' ').toUpperCase();
export function externalMediaLabel(task:Pick<Task,'tags'>&Partial<Pick<Task,'taskType'|'externalArtwork'|'status'|'approval'>>,config:LabelConfig={}){
 if(task.taskType){if(task.taskType==='artes-externas')return 'MÍDIA EXTERNA';if(task.taskType==='compras'&&task.externalArtwork&&!(['aprovado ✅','stand-by ⛔','concluidos e postados'].includes(task.status||'')&&(task.approval?.votes.lucio?.decision==='approved'||task.approval?.administrative||task.approval?.designer)))return 'MÍDIA EXTERNA';return undefined}
 return task.tags.find(id=>[id,labelName(id,config)].some(value=>['MIDIA EXTERNA','MIDIA EXTERIOR'].includes(normalize(value))));
}
export function purchaseLabel(task:Pick<Task,'tags'|'taskType'>,config:LabelConfig={}){
 if(task.taskType)return task.taskType==='compras'?'COMPRA':undefined;
 return task.tags.find(id=>[id,labelName(id,config)].some(value=>['COMPRA','COMPRAR','COMPRAS'].includes(normalize(value))));
}
export function highlightedLabel(task:Task,config:LabelConfig={}){
 const media=externalMediaLabel(task,config),purchase=purchaseLabel(task,config);
 const approved=['aprovado ✅','concluidos e postados'].includes(task.status)||task.workflowResume==='aprovado ✅'||['aprovado','pagamento','aguardando chegada','concluído'].includes(task.purchase?.stage||'');
 return media&&(!purchase||!approved)?media:purchase||media;
}
