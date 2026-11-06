import {isPurchase,purchaseHasArt,syncPurchaseArt} from './purchases';
import {spellingFlagged} from './spelling';
import {lucioOnly} from './reviewer-policy';
import type {LabelConfig} from './labels';
import type {Task} from './model';
import type {Actor} from './permissions';
import {approvalFor} from './workflow';
import {statusDefinitions,type StatusConfig} from './status-config';
export type Reviewer='lucio'|'mateus';
export type Decision='approved'|'adjust';
export type Approval={administrative?:boolean,designer?:{by:string,name:string,at:string}, round:number,votes:Partial<Record<Reviewer,{decision:Decision,by:string,at:string}>>};
export const isApproval=(status:string)=>status.startsWith('aprovação ');
export function approvalContent(task:Task){return JSON.stringify({title:task.title.trim().toLocaleUpperCase('pt-BR'),description:task.description,companies:task.tags,art:task.attachments.filter(a=>a.artworkKind!=='reference').map(a=>({url:a.url,name:a.name})),cover:task.coverUrl})}
// Ordinary task writes cannot add, erase or impersonate another person's vote.
export function protectApproval(previous:Task|undefined,next:Task,admin=false,labels:LabelConfig={}):Task{
 if(!admin&&next.status==='aprovado ✅'&&spellingFlagged(next))throw Error('Revise ou descarte o alerta ortográfico antes de aprovar.');
 if(admin&&next.status==='aprovado ✅'&&previous?.status!==next.status){if(JSON.stringify(previous?.approval)!==JSON.stringify(next.approval))throw Error('Use os botões de votação para registrar seu próprio voto.');return {...next,approval:{round:(previous?.approval?.round||0)+1,votes:{},administrative:true}}}
 if(next.status==='aprovado ✅'&&previous?.status!==next.status)throw Error('Use os votos obrigatórios de Lúcio e Mateus para aprovar.');
 if(JSON.stringify(previous?.approval)!==JSON.stringify(next.approval))throw Error('Use os botões de votação para registrar seu próprio voto.');
 const entering=isApproval(next.status)&&(!previous||!isApproval(previous.status));
 const changed=!!previous&&(!!previous.approval||previous.status==='aprovado ✅')&&approvalContent(previous)!==approvalContent(next);
 if(previous&&previous.status!==next.status&&next.status==='ajustar ⚠️')return {...next,approval:{round:(previous.approval?.round||0)+1,votes:{}}};
 if(entering||changed){const status=changed&&next.status==='aprovado ✅'?'ajustar ⚠️':changed&&['aprovado ✅','stand-by ⛔','concluidos e postados'].includes(next.status)?approvalFor(next):next.status;return {...next,status,approval:{round:(previous?.approval?.round||0)+1,votes:{}}}}
 if(next.status==='aprovado ✅'&&previous?.status!==next.status&&!(previous?.approval?.votes.lucio?.decision==='approved'&&(lucioOnly(next,labels)||previous?.approval?.votes.mateus?.decision==='approved')))throw Error('A aprovação exige os votos positivos de Lucio e Mateus.');
 return next;
}
export function castApprovalVote(task:Task,actor:Actor&{email:string,name:string,reviewer?:Reviewer},decision:Decision,config:StatusConfig,now=new Date().toISOString()):Task{
 if(actor.role!=='administrador'&&decision==='approved'&&spellingFlagged(task))throw Error('Revise ou descarte o alerta ortográfico antes de aprovar.');
 const designer=actor.role==='editor'&&['farias','luiz'].includes(actor.persona)&&isPurchase(task)&&purchaseHasArt(task)&&task.assignees.some(name=>name.toLowerCase()===actor.persona);
 if(designer&&decision==='approved'&&isApproval(task.status)){
  if(!statusDefinitions(config).some(s=>s.id==='aprovado ✅'))throw Error('O status APROVADO precisa estar ativo.');
  return syncPurchaseArt({...task,status:'aprovado ✅',approval:{round:task.approval?.round||1,votes:{},designer:{by:actor.email,name:actor.name,at:now}},history:[{text:actor.name+' aprovou a arte para Compras',by:actor.name,at:now},...task.history]},task);
 }
 if(actor.role!=='administrador'&&!(actor.role==='editor'&&['lucio','mateus'].includes(actor.persona)))throw Error('Apenas Lucio e Mateus podem votar, cada um pela própria conta.');
 if(!['approved','adjust'].includes(decision))throw Error('Voto inválido.');
 if(actor.role==='administrador'&&decision==='approved'&&task.status==='aprovado ✅'&&task.approval?.administrative)return task;
 if(!isApproval(task.status))throw Error('Encaminhe o cartão para aprovação antes de votar. Uma nova aprovação inicia uma nova rodada.');
 const active=new Set(statusDefinitions(config).map(s=>s.id));if(!active.has('ajustar ⚠️')||!active.has('aprovado ✅'))throw Error('Os status AJUSTAR e APROVADO precisam estar ativos para a votação.');
 if(actor.role==='administrador'&&decision==='approved')return syncPurchaseArt({...task,status:'aprovado ✅',approval:{round:task.approval?.round||1,votes:{},administrative:true},history:[{text:'Registrou aprovação administrativa, sem necessidade das outras aprovações.',by:actor.name,at:now},...task.history]},task);
 const reviewer=(actor.role==='administrador'?actor.reviewer||actor.persona:actor.persona) as Reviewer;if(!['lucio','mateus'].includes(reviewer))throw Error('Apenas Lucio e Mateus podem receber um voto do administrador.');if(lucioOnly(task,config.labels)&&reviewer!=='lucio')throw Error('Este cartão é aprovado apenas por Lucio.');const current=task.approval||{round:1,votes:{}};
 const approval:Approval={round:current.round,votes:{...current.votes,[reviewer]:{decision,by:actor.email,at:now}}};
 const values=lucioOnly(task,config.labels)?[approval.votes.lucio].filter(Boolean):Object.values(approval.votes);
 const status=values.some(v=>v?.decision==='adjust')?'ajustar ⚠️':approval.votes.lucio?.decision==='approved'&&(lucioOnly(task,config.labels)||approval.votes.mateus?.decision==='approved')?'aprovado ✅':task.status;
 if(current.votes[reviewer]?.decision===decision&&status===task.status)return task;
 return syncPurchaseArt({...task,status,approval,history:[{text:`${actor.name}${actor.role==='administrador'?' por '+reviewer:''} votou ${decision==='approved'?'aprovado':'ajustar'} · rodada ${approval.round}`,by:actor.name,at:now},...task.history]},task);
}

export type ApprovalRemoval=Reviewer|'administrative'|'designer';
export function removeApproval(task:Task,reviewer:ApprovalRemoval,actor:Actor&{name:string},config:StatusConfig,now=new Date().toISOString()):Task{
 if(actor.role!=='administrador')throw Error('Apenas o administrador pode remover aprovações.');
 const current=task.approval;
 if(!current)throw Error('Esta aprovação já foi removida. Recarregue o cartão.');
 const approval={...current,votes:{...current.votes}};
 let name:string;
 if(reviewer==='administrative'){
  if(!current.administrative)throw Error('Este cartão não tem aprovação administrativa.');
  delete approval.administrative;name='administrador';
 }else if(reviewer==='designer'){
  if(!current.designer)throw Error('Este cartão não tem aprovação do designer.');
  name=current.designer.name;delete approval.designer;
 }else{
  if(current.votes[reviewer]?.decision!=='approved')throw Error('Esta pessoa não tem uma aprovação para remover.');
  delete approval.votes[reviewer];name=reviewer==='lucio'?'Lúcio':'Mateus';
 }
 const status=approvalFor(task);
 if(!statusDefinitions(config).some(s=>s.id===status))throw Error('Ative a coluna de aprovação desta empresa antes de remover o voto.');
 return syncPurchaseArt({...task,status,approval,history:[{text:actor.name+' removeu a aprovação de '+name,by:actor.name,at:now},...task.history]},task);
}
