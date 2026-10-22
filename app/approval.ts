import type {Task} from './model';
import type {Actor} from './permissions';
import {approvalFor} from './workflow';
import {statusDefinitions,type StatusConfig} from './status-config';
export type Reviewer='lucio'|'mateus';
export type Decision='approved'|'adjust';
export type Approval={round:number,votes:Partial<Record<Reviewer,{decision:Decision,by:string,at:string}>>};
export const isApproval=(status:string)=>status.startsWith('aprovação ');
export function approvalContent(task:Task){return JSON.stringify({title:task.title.trim().toLocaleUpperCase('pt-BR'),description:task.description,companies:task.tags,art:task.attachments.filter(a=>a.artworkKind!=='reference').map(a=>({url:a.url,name:a.name})),cover:task.coverUrl})}
// Ordinary task writes cannot add, erase or impersonate another person's vote.
export function protectApproval(previous:Task|undefined,next:Task):Task{
 if(JSON.stringify(previous?.approval)!==JSON.stringify(next.approval))throw Error('Use os botões de votação para registrar seu próprio voto.');
 const entering=isApproval(next.status)&&(!previous||!isApproval(previous.status));
 const changed=!!previous&&(!!previous.approval||previous.status==='aprovado ✅')&&approvalContent(previous)!==approvalContent(next);
 if(entering||changed){const status=changed&&next.status==='aprovado ✅'?approvalFor(next):next.status;return {...next,status,approval:{round:(previous?.approval?.round||0)+1,votes:{}}}}
 if(next.status==='aprovado ✅'&&previous?.status!==next.status&&!(previous?.approval?.votes.lucio?.decision==='approved'&&previous?.approval?.votes.mateus?.decision==='approved'))throw Error('A aprovação exige os votos positivos de Lucio e Mateus.');
 return next;
}
export function castApprovalVote(task:Task,actor:Actor&{email:string,name:string},decision:Decision,config:StatusConfig,now=new Date().toISOString()):Task{
 if(!['administrador','editor'].includes(actor.role)||!['lucio','mateus'].includes(actor.persona))throw Error('Apenas Lucio e Mateus podem votar, cada um pela própria conta.');
 if(!['approved','adjust'].includes(decision))throw Error('Voto inválido.');
 if(!isApproval(task.status))throw Error('Encaminhe o cartão para aprovação antes de votar. Uma nova aprovação inicia uma nova rodada.');
 const active=new Set(statusDefinitions(config).map(s=>s.id));if(!active.has('ajustar ⚠️')||!active.has('aprovado ✅'))throw Error('Os status AJUSTAR e APROVADO precisam estar ativos para a votação.');
 const reviewer=actor.persona as Reviewer,current=task.approval||{round:1,votes:{}};
 if(current.votes[reviewer]?.decision===decision)return task;
 const approval:Approval={round:current.round,votes:{...current.votes,[reviewer]:{decision,by:actor.email,at:now}}};
 const values=Object.values(approval.votes);
 const status=values.some(v=>v.decision==='adjust')?'ajustar ⚠️':approval.votes.lucio?.decision==='approved'&&approval.votes.mateus?.decision==='approved'?'aprovado ✅':task.status;
 return {...task,status,approval,history:[{text:`${actor.name} votou ${decision==='approved'?'aprovado':'ajustar'} · rodada ${approval.round}`,by:actor.name,at:now},...task.history]};
}
