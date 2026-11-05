import {isWeeklyDraft} from './weekly-drafts';
import {needsCaption,captionAfterArt} from './captions';
import {externalMediaLabel} from './external-media-label';
import type {LabelConfig} from './labels';
import {guardArtFlow} from './art-flow';
import {protectSpelling} from './spelling';
import {withParticipants} from './participants';
import {isPurchase,purchaseHasArt,purchaseReady,normalizePurchase,guardPurchaseEdit,guardPurchaseFlow} from './purchases';
import {protectApproval} from './approval';
import {StatusConfig,emptyStatusConfig,configuredTask,customStatus} from './status-config';
import {stampPosted} from './task-order';
import type {Task} from './model';
import {normalizeApproval,personalColumns} from './workflow';
export const personas=['luiz','farias','mateus','lucio','laura'] as const;
export type Persona=typeof personas[number]|'';
export type Actor={role:string,persona:Persona};
export type Area='geral'|'luiz'|'farias'|'aprovacoes'|'compras'|'laura';
export const names:Record<string,string>={luiz:'Luiz',farias:'Farias',mateus:'Mateus',laura:'Laura',lucio:'Lucio Alves Xavier'};
export function personId(name:string){const n=name.trim().toLocaleLowerCase('pt-BR');return n==='lucio alves xavier'?'lucio':personas.find(p=>p===n)||''}
export const luizStatuses=['a fazer luiz','em andamento luiz','ideias','aprovação postos','aprovação ervateira','aprovação luke group'];
export const fariasStatuses=['a fazer farias','em andamento farias','aprovação fibroplast','aprovação materiais','aprovação concreto'];
export const sharedStatuses=['ajustar legenda','ajustar ⚠️','aprovado ✅','stand-by ⛔','concluidos e postados'];
export const reviewStatuses=['a fazer farias','a fazer luiz','aprovação fibroplast','aprovação postos','aprovação ervateira','aprovação materiais','aprovação concreto','aprovação luke group',...sharedStatuses];
export function ownerOf(status:string):'luiz'|'farias'|''{return ['a fazer luiz','em andamento luiz','ideias'].includes(status)?'luiz':['a fazer farias','em andamento farias'].includes(status)?'farias':''}
export function assignedTo(t:Task,persona:string){return t.assignees.some(n=>n.trim().toLocaleLowerCase('pt-BR')===persona)}
export function defaultArea(persona:Persona):Area{return persona==='laura'?'laura':persona==='luiz'||persona==='farias'?persona:'aprovacoes'}
export function areaStatuses(area:Area){return area==='luiz'||area==='farias'?personalColumns.map(([key])=>key):null}
export function inArea(t:Task,area:Area){if(isWeeklyDraft(t))return area==='geral'||area==='aprovacoes';return belongsToArea(t,area)}
function belongsToArea(t:Task,area:Area){if(area==='laura')return needsCaption(t);if(area==='compras')return purchaseReady(t);if(isPurchase(t)&&!purchaseHasArt(t))return false;if(area==='geral')return true;if(area==='aprovacoes')return true;return (area==='luiz'?['a fazer luiz','em andamento luiz','ideias']:['a fazer farias','em andamento farias']).includes(t.status)||((t.status.startsWith('aprovação ')||sharedStatuses.includes(t.status)||customStatus(t.status))&&assignedTo(t,area))}
export function canSeeTask(t:Task,actor:Actor){return ['administrador','editor','visualizador'].includes(actor.role)&&(actor.role==='administrador'||!!actor.persona)}
export function canCreateTask(t:Task,actor:Actor){if(actor.role==='administrador')return true;if(actor.role!=='editor'||!actor.persona||actor.persona==='laura')return false;return ['a fazer farias','a fazer luiz'].includes(t.status)}
export function canManageTask(t:Task,actor:Actor){if(actor.role==='administrador')return true;if(actor.role!=='editor'||!actor.persona||actor.persona==='laura')return false;if(isPurchase(t)){if(['farias','lucio'].includes(actor.persona))return true;if(!purchaseHasArt(t)||actor.persona==='mateus')return false;}if(['aprovado ✅','stand-by ⛔','concluidos e postados'].includes(t.status))return true;if(['lucio','mateus'].includes(actor.persona))return true;return belongsToArea(t,defaultArea(actor.persona))}
export function assignStatusOwner(t:Task,labels:LabelConfig={}):Task{const owner=ownerOf(t.status);return withParticipants(owner&&!assignedTo(t,owner)?{...t,assignees:[...t.assignees,names[owner]]}:t,labels)}
const sameTaskData=(a:Task,b:Task)=>{const encode=(value:Task)=>JSON.stringify(value,(_key,item)=>item&&typeof item==='object'&&!Array.isArray(item)?Object.fromEntries(Object.keys(item).sort().map(key=>[key,item[key]])):item);return encode(a)===encode(b)};
export function mergeScopedTasks(current:Task[],incoming:Task[],actor:Actor,now=new Date().toISOString(),config:StatusConfig=emptyStatusConfig):Task[]{
 if(actor.role==='visualizador'||(actor.role!=='administrador'&&!actor.persona))throw Error('Seu perfil não permite alterar tarefas.');
 const old=new Map(current.map(t=>[t.id,t]));
 const next=incoming.map(t=>{const previous=old.get(t.id);if(JSON.stringify(previous?.caption)!==JSON.stringify(t.caption))throw Error('Use a área de legendas para atualizar a legenda.');if(previous&&!canManageTask(previous,actor)){if(!sameTaskData(previous,t)&&!sameTaskData(withParticipants(previous,config.labels),t))throw Error('Você pode visualizar este cartão, mas apenas o responsável pode alterá-lo.');return previous;}t=protectSpelling(previous,t);
 guardPurchaseEdit(previous,t,actor);
 const changed=!previous||!sameTaskData(previous,t);const task=changed?stampPosted(previous,guardPurchaseFlow(previous,normalizePurchase(protectApproval(previous,{...assignStatusOwner(configuredTask(assignStatusOwner(normalizeApproval(t),config.labels),config),config.labels),title:t.title.trim().toLocaleUpperCase('pt-BR')},actor.role==='administrador',config.labels),previous,actor.role==='administrador'),actor),now):t;
 if(!previous&&canCreateTask(task,actor)&&actor.role==='editor'&&['a fazer farias','a fazer luiz'].includes(task.status))return captionAfterArt(previous,guardArtFlow(previous,task,actor,config.labels));
 if(previous&&isPurchase(task)&&!externalMediaLabel(task)&&canManageTask(previous,actor))return captionAfterArt(previous,guardArtFlow(previous,task,actor,config.labels));
 if(!canManageTask(task,actor))throw Error('Esta etapa ou tarefa não pertence à sua área.');
 if(!previous&&!isPurchase(task)&&actor.role!=='administrador'&&!['a fazer farias','a fazer luiz'].includes(task.status))throw Error('Crie as artes apenas em A FAZER FARIAS ou A FAZER LUIZ.');

 if(changed&&(sharedStatuses.includes(task.status)||task.status.startsWith('aprovação ')||customStatus(task.status))&&!assignedTo(task,'luiz')&&!assignedTo(task,'farias'))throw Error('Atribua a tarefa a Luiz e/ou Farias antes de enviar para aprovação ou uma etapa compartilhada.');
 return captionAfterArt(previous,guardArtFlow(previous,task,actor,config.labels));});
 const ids=new Set(next.map(t=>t.id));if(ids.size!==next.length)throw Error('Identificador de tarefa duplicado.');
 const incomingIds=new Set(next.map(t=>t.id));return [...current.filter(t=>!incomingIds.has(t.id)&&!canManageTask(t,actor)),...next];
}
