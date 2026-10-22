'use client';
import {Check,X} from 'lucide-react';
import type {Task} from './model';
import {isApproval,type Decision,type Reviewer} from './approval';
export function ApprovalPanel({task,persona,writable,busy,dirty,persisted,onVote}:{task:Task,persona:string,writable:boolean,busy:boolean,dirty:boolean,persisted:boolean,onVote:(decision:Decision)=>void}){
 const reviewers:[Reviewer,string][]=[['lucio','Lucio'],['mateus','Mateus']];
 const active=isApproval(task.status);
 return <section className="detail-section approval-panel"><div className="approval-heading"><h3>Revisão da arte</h3><small>Rodada {task.approval?.round||1}</small></div><p>Um voto para ajustar devolve o cartão. Dois votos positivos aprovam a arte.</p>
  <div className="approval-voters">{reviewers.map(([id,name])=>{const vote=task.approval?.votes[id],disabled=busy||!writable||persona!==id||dirty||!persisted||!active;return <div className="approval-voter" key={id}><strong>{name}</strong><span className={'vote-state '+(vote?.decision||'')}>{vote?.decision==='approved'?'Aprovado':vote?.decision==='adjust'?'Ajustar':'Aguardando voto'}</span><div><button type="button" className="vote-adjust" disabled={disabled} aria-label={name+': solicitar ajustes'} aria-pressed={vote?.decision==='adjust'} onClick={()=>onVote('adjust')}><X size={17}/></button><button type="button" className="vote-approve" disabled={disabled} aria-label={name+': aprovar arte'} aria-pressed={vote?.decision==='approved'} onClick={()=>onVote('approved')}><Check size={17}/></button></div></div>})}</div>
  <small>{!persisted?'Salve o cartão antes de enviar para revisão.':dirty?'Salve as alterações antes de votar.':!active?'Os votos ficam disponíveis quando o cartão está em aprovação. Reenviar para aprovação inicia uma nova rodada.':!['lucio','mateus'].includes(persona)?'Cada voto deve ser registrado pela conta de Lucio ou Mateus.':'Seu voto é registrado imediatamente.'}</small>
 </section>
}
