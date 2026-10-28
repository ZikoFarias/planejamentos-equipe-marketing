import {withParticipants} from './participants';
import {isPurchase,purchaseReady,normalizePurchase} from './purchases';
import {protectApproval} from './approval';
import {StatusConfig,emptyStatusConfig,configuredTask,customStatus} from './status-config';
import {stampPosted} from './task-order';
import type {Task} from './model';
import {normalizeApproval,personalColumns} from './workflow';
export const personas=['luiz','farias','mateus','lucio'] as const;
export type Persona=typeof personas[number]|'';
export type Actor={role:string,persona:Persona};
export type Area='geral'|'luiz'|'farias'|'aprovacoes'|'compras';
export const names:Record<string,string>={luiz:'Luiz',farias:'Farias',mateus:'Mateus',lucio:'Lucio Alves Xavier'};
export function personId(name:string){const n=name.trim().toLocaleLowerCase('pt-BR');return n==='lucio alves xavier'?'lucio':personas.find(p=>p===n)||''}
export const luizStatuses=['a fazer luiz','em andamento luiz','ideias','aprovação postos','aprovação ervateira','aprovação luke group'];
export const fariasStatuses=['a fazer farias','em andamento farias','aprovação fibroplast','aprovação materiais','aprovação concreto'];
export const sharedStatuses=['ajustar ⚠️','aprovado ✅','stand-by ⛔','concluidos e postados'];
export const reviewStatuses=['a fazer farias','a fazer luiz','aprovação fibroplast','aprovação postos','aprovação ervateira','aprovação materiais','aprovação concreto','aprovação luke group',...sharedStatuses];
export function ownerOf(status:string):'luiz'|'farias'|''{return ['a fazer luiz','em andamento luiz','ideias'].includes(status)?'luiz':['a fazer farias','em andamento farias'].includes(status)?'farias':''}
export function assignedTo(t:Task,persona:string){return t.assignees.some(n=>n.trim().toLocaleLowerCase('pt-BR')===persona)}
export function defaultArea(persona:Persona):Area{return persona==='luiz'||persona==='farias'?persona:'aprovacoes'}
export function areaStatuses(area:Area){return area==='luiz'||area==='farias'?personalColumns.map(([key])=>key):null}
export function inArea(t:Task,area:Area){if(area==='compras')return purchaseReady(t);if(isPurchase(t)&&purchaseReady(t))return false;if(area==='geral')return true;if(area==='aprovacoes')return true;return (area==='luiz'?['a fazer luiz','em andamento luiz','ideias']:['a fazer farias','em andamento farias']).includes(t.status)||((t.status.startsWith('aprovação ')||sharedStatuses.includes(t.status)||customStatus(t.status))&&assignedTo(t,area))}
export function canSeeTask(t:Task,actor:Actor){return ['administrador','editor','visualizador'].includes(actor.role)&&(actor.role==='administrador'||!!actor.persona)}
export function canManageTask(t:Task,actor:Actor){if(actor.role==='administrador')return true;if(actor.role!=='editor'||!['luiz','farias'].includes(actor.persona))return false;if(isPurchase(t))return actor.persona==='farias';return inArea(t,defaultArea(actor.persona))}
export function assignStatusOwner(t:Task):Task{const owner=ownerOf(t.status);return withParticipants(owner&&!assignedTo(t,owner)?{...t,assignees:[...t.assignees,names[owner]]}:t)}
export function mergeScopedTasks(current:Task[],incoming:Task[],actor:Actor,now=new Date().toISOString(),config:StatusConfig=emptyStatusConfig):Task[]{
 if(actor.role==='visualizador'||(actor.role!=='administrador'&&!actor.persona))throw Error('Seu perfil não permite alterar tarefas.');
 const old=new Map(current.map(t=>[t.id,t]));
 const next=incoming.map(t=>{const previous=old.get(t.id);if(previous&&!canManageTask(previous,actor)){if(JSON.stringify(previous)!==JSON.stringify(t))throw Error('Você pode visualizar este cartão, mas apenas o responsável pode alterá-lo.');return previous;}
 if(isPurchase(t)&&previous&&actor.role!=='administrador'&&actor.persona!=='farias'&&JSON.stringify(t.purchase)!==JSON.stringify(previous.purchase))throw Error('Farias é responsável por editar e direcionar as compras.');
 const changed=!previous||JSON.stringify(previous)!==JSON.stringify(t);const task=changed?stampPosted(previous,normalizePurchase(protectApproval(previous,{...assignStatusOwner(configuredTask(assignStatusOwner(normalizeApproval(t)),config)),title:t.title.trim().toLocaleUpperCase('pt-BR')}),previous),now):t;
 if(!canManageTask(task,actor))throw Error('Esta etapa ou tarefa não pertence à sua área.');
 if(!previous&&!isPurchase(task)&&!['a fazer farias','a fazer luiz'].includes(task.status))throw Error('Crie as artes apenas em A FAZER FARIAS ou A FAZER LUIZ.');
 if(changed&&(sharedStatuses.includes(task.status)||task.status.startsWith('aprovação ')||customStatus(task.status))&&!assignedTo(task,'luiz')&&!assignedTo(task,'farias'))throw Error('Atribua a tarefa a Luiz e/ou Farias antes de enviar para aprovação ou uma etapa compartilhada.');
 return task;});
 const ids=new Set(next.map(t=>t.id));if(ids.size!==next.length)throw Error('Identificador de tarefa duplicado.');
 const incomingIds=new Set(next.map(t=>t.id));return [...current.filter(t=>!incomingIds.has(t.id)&&!canManageTask(t,actor)),...next];
}
