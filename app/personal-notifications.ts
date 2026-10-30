import type {Task} from './model';
import {isPurchase,purchaseReady} from './purchases';
import {lucioOnly} from './reviewer-policy';
import type {LabelConfig} from './labels';
export type NotificationPersona='luiz'|'farias'|'lucio'|'mateus';
export type NotificationTask=Pick<Task,'id'|'title'|'status'|'tags'|'assignees'|'purchase'|'approval'|'workflowResume'>;
export type NotificationTarget={id:string,title:string,status:string};
export type PersonalEvent={recipient:NotificationPersona,kind:string,title:string,message:string,taskId?:string,targets?:NotificationTarget[]};
export type PersonalNotification={id:number,kind:string,title:string,message:string,taskId?:string,targets:NotificationTarget[],createdAt:string,readAt:string|null,seenAt:string|null};
const normalized=(value:string)=>value.normalize('NFD').replace(/[\u0300-\u036f]/g,'').trim().toLowerCase();
const asTask=(task:NotificationTask)=>task as Task;
const review=(task:NotificationTask)=>task.status==='aprovação'||task.status.startsWith('aprovação ');
const assigned=(task:NotificationTask,person:'luiz'|'farias')=>task.assignees.some(name=>normalized(name)===person)||task.status.endsWith(' '+person)||(person==='farias'&&isPurchase(asTask(task)));
export function personalEvents(old:NotificationTask|null,next:NotificationTask,labels:LabelConfig={}):PersonalEvent[]{
 const events:PersonalEvent[]=[];
 const add=(recipient:NotificationPersona,kind:string,title:string,message:string)=>events.push({recipient,kind,title,message,taskId:next.id});
 const ready=purchaseReady(asTask(next)),wasReady=!!old&&purchaseReady(asTask(old));
 if(next.status==='a fazer luiz'&&(!old||old.status!==next.status||!assigned(old,'luiz')))add('luiz','assigned','Novo cartão para você',next.title+' foi adicionado em A Fazer Luiz.');
 if(assigned(next,'farias')&&(!old||!assigned(old,'farias'))&&!(ready&&!wasReady))add('farias','assigned','Novo cartão para você',next.title+' foi atribuído a você.');
 for(const person of ['luiz','farias'] as const)if(next.status==='ajustar ⚠️'&&assigned(next,person)&&(!old||old.status!==next.status||!assigned(old,person)))add(person,'adjust','Cartão para ajustar',next.title+' precisa de ajustes.');
 if(ready&&!wasReady)add('farias','purchase-arrived','Nova compra disponível',next.title+' está disponível na área Compras.');
 if(ready&&next.purchase?.stage==='aprovado'&&(!old||!wasReady||old.purchase?.stage!=='aprovado'))add('farias','purchase-approved','Compra aprovada',next.title+' está em Aprovado na área Compras.');
 if(ready&&next.purchase?.stage==='orçamento'&&(!old||!wasReady||old.purchase?.stage!=='orçamento'))add('lucio','budget','Compra aguardando sua confirmação',next.title+' chegou a Orçamento.');
 if(review(next)){
  const newRound=!old||old.status!==next.status||old.approval?.round!==next.approval?.round;
  if(newRound)add('lucio','review','Arte aguardando revisão',next.title+' foi enviado para aprovação.');
  const onlyLucio=lucioOnly(asTask(next),labels);
  if(!onlyLucio&&(newRound||!!old&&lucioOnly(asTask(old),labels)))add('mateus','review','Arte aguardando revisão',next.title+' foi enviado para aprovação.');
  if(!onlyLucio&&next.approval?.votes.mateus?.decision==='approved'&&old?.approval?.votes.mateus?.decision!=='approved'&&next.approval?.votes.lucio?.decision!=='approved')add('lucio','last-review','Falta apenas sua aprovação', 'Mateus aprovou '+next.title+'. Falta apenas você.');
  if(!onlyLucio&&next.approval?.votes.lucio?.decision==='approved'&&old?.approval?.votes.lucio?.decision!=='approved'&&next.approval?.votes.mateus?.decision!=='approved')add('mateus','last-review','Falta apenas sua aprovação','Lúcio aprovou '+next.title+'. Falta apenas você.');
 }
 return events;
}
export function dailySummary(person:NotificationPersona,tasks:NotificationTask[],day:string,labels:LabelConfig={}):PersonalEvent{
 const pending=tasks.filter(task=>{
  if(person==='lucio')return review(task)&&task.approval?.votes.lucio?.decision!=='approved'||purchaseReady(asTask(task))&&task.purchase?.stage==='orçamento';
  if(person==='mateus')return review(task)&&!lucioOnly(asTask(task),labels)&&task.approval?.votes.mateus?.decision!=='approved';
  if(person==='farias'&&purchaseReady(asTask(task)))return !['stand-by','concluído'].includes(task.purchase?.stage||'comprar');
  return assigned(task,person)&&!['aprovado ✅','stand-by ⛔','concluidos e postados'].includes(task.status);
 });
 const counts:Record<string,number>={};
 for(const task of pending){const category=person==='farias'&&purchaseReady(asTask(task))?'em compras':task.status.startsWith('a fazer ')?'a fazer':task.status==='ajustar ⚠️'?'para ajustar':review(task)?'em aprovação':task.purchase?.stage==='orçamento'?'em orçamento':'em andamento';counts[category]=(counts[category]||0)+1}
 return {recipient:person,kind:'daily',title:'Resumo diário · '+day.split('-').reverse().join('/'),message:pending.length?'Você tem '+pending.length+' '+(pending.length===1?'cartão pendente':'cartões pendentes')+': '+Object.entries(counts).map(([name,count])=>count+' '+name).join(' · ')+'.':'Você não tem cartões pendentes neste momento.',targets:pending.slice(0,100).map(task=>({id:task.id,title:task.title,status:task.status}))};
}
