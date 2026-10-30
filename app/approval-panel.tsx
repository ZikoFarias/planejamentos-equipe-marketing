'use client';
import {BadgeCheck} from 'lucide-react';
import {lucioOnly} from './reviewer-policy';
import type {LabelConfig} from './labels';
import {ProfileAvatar,profileName} from './profile-avatar';
import type {Task} from './model';
export function approvalHeaderMembers(task:Task,labels:LabelConfig={}){
 if(task.approval?.administrative){
  const event=task.history.find(item=>/aprova[çc][aã]o administrativa/i.test(item.text));
  return [{name:event?.by||'Administrador',approved:true,admin:true,label:'Arte aprovada pelo administrador, sem necessidade das outras aprovações.'}];
 }
 return (lucioOnly(task,labels)?['lucio']:['lucio','mateus']).map(person=>{const name=person==='lucio'?'Lucio Alves Xavier':'Mateus',vote=task.approval?.votes[person as 'lucio'|'mateus'];return {name,approved:vote?.decision==='approved',admin:false,label:profileName(name)+' · '+(vote?.decision==='approved'?'Aprovado':vote?.decision==='adjust'?'Solicitou ajustes':'Aguardando aprovação')}});
}
export function ApprovalHeader({task,labels}:{task:Task,labels?:LabelConfig}){
 return <div className="task-approval-header" aria-label="Revisão da arte">{approvalHeaderMembers(task,labels).map(member=><span key={member.name} className={'approval-avatar '+(member.approved?'verified':'pending')} title={member.label} aria-label={member.label}><ProfileAvatar name={member.name}/>{member.approved&&<BadgeCheck size={15} className="approval-check"/>}{member.admin&&<small>ADM</small>}</span>)}</div>;
}
