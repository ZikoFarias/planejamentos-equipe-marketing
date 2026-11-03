import type {Task} from './model';
import type {Actor} from './permissions';
import {isPurchase} from './purchases';
import {externalMediaLabel} from './external-media-label';
import type {LabelConfig} from './labels';
export type Caption={text:string,status:'todo'|'review'|'adjust',version:number,submittedAt?:string,submittedBy?:string,resumeStatus?:string};
export const captionColumns=[['caption:todo','#d8a5bc','A fazer'],['caption:review','#e86ca6','Aprovação'],['caption:adjust','#ffc53d','Ajustar legenda'],['aprovado ✅','#00ff84','Aprovados'],['stand-by ⛔','#ff0000','Stand-by'],['concluidos e postados','#008844','Concluídos e postados']];
export function needsCaption(t:Task,labels:LabelConfig={}){return !isPurchase(t)&&!externalMediaLabel(t,labels)&&!!(t.caption||t.status.startsWith('aprovação ')||t.status==='ajustar legenda'||t.approval||t.status==='aprovado ✅'||t.status==='concluidos e postados')}
export const captionColumn=(t:Task)=>['aprovado ✅','stand-by ⛔','concluidos e postados'].includes(t.status)?t.status:'caption:'+(t.status==='ajustar legenda'?'adjust':t.caption?.status||'todo');
export const captionSent=(t:Task)=>t.caption?.status==='review'&&!!t.caption.submittedAt;
export const canWriteCaption=(actor:Actor)=>actor.role==='administrador'||actor.role==='editor'&&actor.persona==='laura';
export const canRequestCaption=(actor:Actor)=>actor.role==='administrador'||actor.role==='editor'&&['lucio','mateus'].includes(actor.persona);
export function changeCaption(t:Task,actor:Actor&{email:string},action:string,text:unknown,version:unknown,labels:LabelConfig={},now=new Date().toISOString()):Task{
 if(!needsCaption(t,labels))throw Error('Esta arte ainda não está na fila de legendas.');
 if(action==='request_adjust'){
  if(!canRequestCaption(actor))throw Error('Apenas Lúcio, Mateus ou o administrador podem solicitar ajuste de legenda.');
  const caption:Caption={text:t.caption?.text||'',status:'adjust',version:(t.caption?.version||0)+1,resumeStatus:t.status==='ajustar legenda'?t.caption?.resumeStatus:t.status};
  return {...t,status:'ajustar legenda',caption};
 }
 if(!canWriteCaption(actor))throw Error('Apenas Laura ou o administrador podem editar e enviar a legenda.');
 if(!['save','submit'].includes(action)||typeof text!=='string'||text.length>10000)throw Error('Informe uma legenda válida de até 10.000 caracteres.');
 if(version!==(t.caption?.version||0))throw Error('A legenda foi alterada em outra tela. Reabra o cartão antes de editar.');
 if(action==='submit'&&!text.trim())throw Error('Adicione a legenda antes de enviar para aprovação.');
 const changed=text!== (t.caption?.text||'');
 const caption:Caption={...t.caption,text,status:action==='submit'?'review':changed&&t.caption?.status==='review'?'todo':t.caption?.status||'todo',version:(t.caption?.version||0)+1};
 if(changed){delete caption.submittedAt;delete caption.submittedBy}
 if(action==='submit'){caption.submittedAt=now;caption.submittedBy=actor.email}
 const status=action==='submit'&&t.status==='ajustar legenda'?(t.caption?.resumeStatus||'ajustar ⚠️'):t.status;
 if(action==='submit')delete caption.resumeStatus;
 return {...t,status,caption};
}

export function captionAfterArt(previous:Task|undefined,next:Task):Task{if(!needsCaption(next)||!next.status.startsWith('aprovação '))return next;const entering=!previous?.status.startsWith('aprovação ')||previous?.approval?.round!==next.approval?.round;if(!entering)return next;return {...next,caption:{text:previous?.caption?.text||'',status:'todo',version:(previous?.caption?.version||0)+1}}}
