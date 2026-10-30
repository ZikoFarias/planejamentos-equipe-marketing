'use client';
import {lucioOnly} from './reviewer-policy';
import type {LabelConfig} from './labels';
import {ProfileAvatar,profileName} from './profile-avatar';
import type {Task} from './model';
import {isApproval,type Decision,type Reviewer} from './approval';
export function ApprovalPanel({task,labels,persona,admin=false,writable,busy,dirty,persisted,onVote}:{task:Task,labels?:LabelConfig,persona:string,admin?:boolean,writable:boolean,busy:boolean,dirty:boolean,persisted:boolean,onVote:(decision:Decision,reviewer:Reviewer)=>void}){
 const reviewers:[Reviewer,string][]=lucioOnly(task,labels)?[['lucio','Lucio']]:[['lucio','Lucio'],['mateus','Mateus']];
 const active=isApproval(task.status);
 return <section className="detail-section approval-panel"><div className="approval-heading"><h3>Revisão da arte</h3><small>Rodada {task.approval?.round||1}</small></div><p>{lucioOnly(task,labels)?'Lúcio aprova arrastando o cartão para Aprovado. Para solicitar correções, arraste para Ajustar.':'Mova para Aprovado para registrar seu voto. Dois votos positivos aprovam a arte.'}</p>
  <div className="approval-voters">{reviewers.map(([id,name])=>{const vote=task.approval?.votes[id];return <div className="approval-voter" key={id}><ProfileAvatar name={name}/><strong>{profileName(name)}</strong><span className={'vote-state '+(vote?.decision||'')}>{vote?.decision==='approved'?'Aprovado':vote?.decision==='adjust'?'Ajustar':'Aguardando voto'}</span></div>})}</div>
  <small>{!persisted?'Salve o cartão antes de enviar para revisão.':dirty?'As alterações serão salvas automaticamente antes de votar.':!active?'Os votos ficam disponíveis quando o cartão está em aprovação. Reenviar para aprovação inicia uma nova rodada.':admin?'Administrador: você pode movimentar os cartões com sua autorização administrativa.':!['lucio','mateus'].includes(persona)?'Cada voto deve ser registrado pela conta de Lucio ou Mateus.':'Mova o cartão para Aprovado ou Ajustar no quadro.'}</small>
 </section>
}
