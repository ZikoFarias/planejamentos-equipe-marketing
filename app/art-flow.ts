import type {Task} from './model';
import type {Actor} from './permissions';
import {lucioOnly} from './reviewer-policy';
import type {LabelConfig} from './labels';
import {isPurchase} from './purchases';
export function canAttachArt(task:Task,actor:Actor){return actor.role==='administrador'||!(['lucio','mateus'].includes(actor.persona)&&(task.status.startsWith('em andamento ')||task.status.startsWith('aprovação ')))}
export function guardArtFlow(previous:Task|undefined,next:Task,actor:Actor,labels:LabelConfig={}):Task{
 // Purchases retain their separate budget workflow and Lucio-only approval.
 if(actor.role==='administrador')return {...next,workflowResume:next.status==='stand-by ⛔'?previous?.status:undefined};
 if(next.status==='ajustar ⚠️'&&previous?.status!==next.status&&!['lucio','mateus'].includes(actor.persona))throw Error('Apenas Lúcio e Mateus podem encaminhar para Ajustar.');
 if(isPurchase(next))return next;
 const before=previous?.status,after=next.status;
 if(after==='ajustar ⚠️'&&before!==after&&!['lucio','mateus'].includes(actor.persona))throw Error('Apenas Lúcio e Mateus podem encaminhar para Ajustar.');
 if(previous&&!canAttachArt(previous,actor)&&JSON.stringify(previous.attachments)!==JSON.stringify(next.attachments))throw Error('Lúcio e Mateus apenas revisam nesta etapa; não podem inserir ou alterar artes.');
 if(!previous){if(!['a fazer farias','a fazer luiz'].includes(after))throw Error('Crie o cartão em A Fazer Farias ou A Fazer Luiz.');return {...next,workflowResume:undefined};}
 if(before===after){const {workflowResume:ignored,...rest}=next;return previous.workflowResume?{...rest,workflowResume:previous.workflowResume}:rest;}
 if(after==='stand-by ⛔')return {...next,workflowResume:before};
 let source=before;
 if(before==='stand-by ⛔'){
  const resume=previous.workflowResume;
  if(after===resume)return {...next,workflowResume:undefined};
  if(resume==='aprovado ✅'&&after==='concluidos e postados')source=resume;
  else throw Error('Retome o cartão na etapa em que estava antes do Stand-by.');
 }
 if(after==='aprovado ✅')throw Error('Apenas os votos obrigatórios na revisão podem enviar o cartão para Aprovado.');
 if(after==='concluidos e postados'){
  if(source!=='aprovado ✅'||previous.approval?.votes.lucio?.decision!=='approved'||(!lucioOnly(next,labels)&&previous.approval?.votes.mateus?.decision!=='approved'))throw Error(lucioOnly(next,labels)?'Concluir exige aprovação de Lúcio na rodada atual.':'Concluir exige aprovação de Lúcio e Mateus na rodada atual.');
  return {...next,workflowResume:undefined};
 }
 if(source==='aprovado ✅'||source==='concluidos e postados'){
  if(after==='ajustar ⚠️')return {...next,workflowResume:undefined};
  throw Error('Para revisar uma arte aprovada, envie primeiro para Ajustar.');
 }
 if(source?.startsWith('a fazer ')&&after===source.replace('a fazer ','em andamento ')){
  if(!['farias','luiz'].includes(actor.persona))throw Error('Farias ou Luiz devem iniciar a execução da arte.');
  return {...next,workflowResume:undefined};
 }
 if(source?.startsWith('em andamento ')&&after.startsWith('aprovação ')){
  if(!['farias','luiz'].includes(actor.persona))throw Error('Farias ou Luiz devem encaminhar a arte executada para revisão.');
  return {...next,workflowResume:undefined};
 }
 if(source?.startsWith('aprovação ')&&after==='ajustar ⚠️')return {...next,workflowResume:undefined};
 if(source==='ajustar ⚠️'&&(after.startsWith('em andamento ')||after.startsWith('aprovação '))){
  if(!['farias','luiz'].includes(actor.persona))throw Error('Farias ou Luiz devem iniciar os ajustes.');
  return {...next,workflowResume:undefined};
 }
 if(source?.startsWith('aprovação ')&&after.startsWith('aprovação '))return {...next,workflowResume:undefined};
 throw Error('Nenhuma etapa pode ser pulada: A Fazer → Em Andamento → Aprovação → Aprovado → Concluído. Stand-by é a única exceção.');
}
