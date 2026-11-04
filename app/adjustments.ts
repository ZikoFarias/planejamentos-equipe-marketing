import type {Task} from './model';
import {canManageTask,type Actor} from './permissions';
import {canWriteCaption,canRequestCaption,captionAfterArt} from './captions';
import {approvalFor} from './workflow';
import {configuredStatus,statusDefinitions,type StatusConfig} from './status-config';
export function canCancelAdjustment(task:Task,actor:Actor){if(task.status==='ajustar legenda')return canWriteCaption(actor)||canRequestCaption(actor);return task.status==='ajustar ⚠️'&&canManageTask(task,actor)}
export function cancelTaskAdjustment(task:Task,actor:Actor,config:StatusConfig,captionText?:unknown):Task{
 if(!['ajustar ⚠️','ajustar legenda'].includes(task.status))throw Error('Este cartão não está em ajuste.');
 if(!canCancelAdjustment(task,actor))throw Error('Seu perfil não pode cancelar este ajuste.');
 const status=configuredStatus(approvalFor(task),config);if(!status.startsWith('aprovação ')||!statusDefinitions(config).some(item=>item.id===status))throw Error('Ative a coluna de aprovação desta empresa antes de cancelar o ajuste.');
 const next:Task={...task,status,workflowResume:undefined,approval:{round:(task.approval?.round||0)+1,votes:{}}};
 if(task.status==='ajustar legenda'){if(captionText!==undefined&&(!canWriteCaption(actor)||typeof captionText!=='string'||captionText.length>10000))throw Error('Legenda inválida para este perfil.');next.caption={text:typeof captionText==='string'?captionText:task.caption?.text||'',status:'review',version:(task.caption?.version||0)+1};return next}
 return captionAfterArt(task,next);
}
