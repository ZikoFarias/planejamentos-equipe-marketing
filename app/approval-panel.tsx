'use client';
import {BadgeCheck} from 'lucide-react';
import {lucioOnly} from './reviewer-policy';
import type {LabelConfig} from './labels';
import type {ApprovalRemoval} from './approval';
import {ProfileAvatar,profileName,hideProfilePopovers} from './profile-avatar';
import type {Task} from './model';
export function approvalHeaderMembers(task:Task,labels:LabelConfig={}){
 if(task.approval?.administrative){
  const event=task.history.find(item=>/aprova[çc][aã]o administrativa/i.test(item.text));
  return [{reviewer:'administrative' as ApprovalRemoval,name:event?.by||'Administrador',profile:'ezequiel2303f@gmail.com',approved:true,admin:true,label:'Arte aprovada pelo administrador, sem necessidade das outras aprovações.'}];
 }
 if(task.approval?.designer){const {by,name}=task.approval.designer;return [{reviewer:'designer' as ApprovalRemoval,name,profile:by,approved:true,admin:false,label:name+' · Arte aprovada para Compras'}]}
 return (lucioOnly(task,labels)?['lucio']:['lucio','mateus']).map(person=>{const name=person==='lucio'?'Lucio Alves Xavier':'Mateus',vote=task.approval?.votes[person as 'lucio'|'mateus'];return {reviewer:person as ApprovalRemoval,name,profile:name,approved:vote?.decision==='approved',admin:false,label:profileName(name)+' · '+(vote?.decision==='approved'?'Aprovado':vote?.decision==='adjust'?'Solicitou ajustes':'Aguardando aprovação')}});
}
export function ApprovalHeader({task,labels,canRemove=false,busy=false,onRemove}:{task:Task,labels?:LabelConfig,canRemove?:boolean,busy?:boolean,onRemove?:(reviewer:ApprovalRemoval)=>void}){
 const approvalDates=task.approvalDates||[];
 const datesLabel=approvalDates.map(date=>new Intl.DateTimeFormat('pt-BR',{day:'2-digit',month:'short',timeZone:'UTC'}).format(new Date(date+'T12:00:00Z'))).join(' · ');
 return <div className="task-approval-header" aria-label={approvalDates.length?`Revisão da arte. Datas planejadas em Aprovado: ${datesLabel}`:'Revisão da arte'}>{approvalHeaderMembers(task,labels).map(member=>{
  const avatar=<span className={'approval-avatar '+(member.approved?'verified':'pending')} title={member.label} aria-label={member.label}><ProfileAvatar name={member.profile}/>{member.approved&&<BadgeCheck size={15} className="approval-check"/>}{member.admin&&<small>ADM</small>}</span>;
  if(!canRemove||!member.approved||!onRemove)return <span key={member.name}>{avatar}</span>;
  return <details key={member.name} className="approval-member-actions" onToggle={event=>{if(event.currentTarget.open)hideProfilePopovers()}} onBlur={event=>{if(!event.currentTarget.contains(event.relatedTarget as Node))event.currentTarget.open=false}} onKeyDown={event=>{if(event.key==='Escape'){event.preventDefault();event.stopPropagation();event.currentTarget.open=false;event.currentTarget.querySelector('summary')?.focus()}}}>
   <summary aria-label={'Opções da aprovação de '+member.name}><span inert>{avatar}</span></summary>
   <div className="approval-removal-menu"><button type="button" disabled={busy} onClick={event=>{const menu=event.currentTarget.closest('details');if(menu)menu.open=false;onRemove(member.reviewer)}}>Remover aprovação</button></div>
  </details>;
 })}{approvalDates.length>0&&<span className="approval-date-history" title={'Histórico das datas planejadas em Aprovado: '+datesLabel}><small>Aprovado:</small> {datesLabel}</span>}</div>;
}
