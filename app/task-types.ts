import type {Task} from './model';
import type {LabelConfig} from './labels';
export type TaskTypeDefinition={id:string,name:string};
export const externalSubtypes=[['placas','Placas'],['cartoes','Cartões'],['panfletos','Panfletos'],['adesivos','Adesivos'],['embalagens','Embalagens'],['mockups','Mockups'],['catalogos','Catálogos']] as const;
export const builtInTaskTypes:TaskTypeDefinition[]=[{id:'rede-sociais',name:'Rede-sociais'},{id:'compras',name:'Compras'},{id:'artes-externas',name:'Artes externas'}];
const normalized=(s:string)=>s.normalize('NFD').replace(/[\u0300-\u036f]/g,'').trim().replace(/\s+/g,' ').toUpperCase();
export function specialTaskTag(tag:string,labels:LabelConfig={}){return [tag,labels[tag]?.name||''].some(s=>['COMPRA','COMPRAR','COMPRAS','MIDIA EXTERNA','MIDIA EXTERIOR'].includes(normalized(s)))}
export function legacyPurchase(tags:string[]){return tags.some(s=>['COMPRA','COMPRAR','COMPRAS'].includes(normalized(s)))}
export function legacyExternal(tags:string[],labels:LabelConfig={}){return tags.some(id=>[id,labels[id]?.name||''].some(s=>['MIDIA EXTERNA','MIDIA EXTERIOR'].includes(normalized(s))))}
export function taskTypeId(t:Pick<Task,'tags'|'taskType'>){return t.taskType||(legacyPurchase(t.tags)?'compras':legacyExternal(t.tags)?'artes-externas':'rede-sociais')}
export function taskTypeName(t:Pick<Task,'tags'|'taskType'|'taskSubtype'>,custom:TaskTypeDefinition[]=[]){return [...builtInTaskTypes,...custom].find(d=>d.id===taskTypeId(t))?.name||'Rede-sociais'}
export function taskSubtypeName(t:Pick<Task,'taskSubtype'>){return externalSubtypes.find(([id])=>id===t.taskSubtype)?.[1]||''}
export function normalizeTaskType<T extends Task>(task:T,labels:LabelConfig={}):T{
 const type=task.taskType||(legacyPurchase(task.tags)?'compras':legacyExternal(task.tags,labels)?'artes-externas':'rede-sociais');
 const tags=task.tags.filter(tag=>!specialTaskTag(tag,labels));
 const externalArtwork=type==='compras'&&(task.externalArtwork||legacyExternal(task.tags,labels)||!!task.purchase?.mediaLabel);
 let next:Task={...task,taskType:type,tags,...(externalArtwork?{externalArtwork:true,purchase:{...task.purchase,requiresArt:true,stage:task.purchase?.stage||'comprar',mediaLabel:task.purchase?.mediaLabel||'MÍDIA EXTERNA'}}:{})};
 const snapshot=task.purchase?.quoteApproval?.snapshot;
 if(snapshot){try{const data=JSON.parse(snapshot);if(!('taskType' in data)&&JSON.stringify(data.tags)===JSON.stringify(task.tags)&&data.title===task.title.trim().toLocaleUpperCase('pt-BR')&&data.description===task.description){const updated={...data,tags,taskType:type,taskSubtype:task.taskSubtype||''};next={...next,purchase:{...next.purchase!,quoteApproval:{...task.purchase!.quoteApproval!,snapshot:JSON.stringify(updated)}}}}}catch{}}
 return next as T;
}
export function changeTaskType(task:Task,type:string):Task{
 if(taskTypeId(task)===type)return task;
 const next={...task,taskType:type,taskSubtype:undefined,externalArtwork:undefined,tags:task.tags.filter(tag=>!specialTaskTag(tag))};
 if(type==='compras')next.purchase=task.purchase||{requiresArt:false,stage:'comprar'};
 // Financial data is retained when switching away; it does not activate the purchase workflow.
 return next;
}
export function validTaskType(task:Task,custom:TaskTypeDefinition[]=[]){return typeof task.taskType==='undefined'||[...builtInTaskTypes,...custom].some(type=>type.id===task.taskType)}
