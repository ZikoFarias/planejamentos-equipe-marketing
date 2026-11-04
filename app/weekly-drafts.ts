import type {Task} from './model';

// Saved content and creation history also cover existing weekly batches.
export function isWeeklyDraft(task:Partial<Task>):boolean{
 if(!/^weekly-\d{4}-\d{2}-\d{2}-.+$/.test(task.id||''))return false;
 const date=task.id!.slice(7,17),company=task.id!.slice(18);
 return task.title==='DESIGN PARA REDE-SOCIAIS'
  &&task.description==='Arte semanal para Instagram.'
  &&['a fazer farias','a fazer luiz'].includes(task.status||'')
  &&task.start===date&&task.due===date&&!task.dueTime
  &&task.priority==='normal'
  &&task.tags?.length===1&&task.tags[0]===company
  &&!task.attachments?.length&&!task.comments?.length&&!task.checklist?.length&&!task.subtasks?.length
  &&!task.coverUrl&&!task.caption&&!task.purchase&&!task.postedAt
  &&!!task.history?.length
  &&task.history.every(event=>event.text==='Tarefa semanal criada manualmente pelo painel de Lançamentos');
}
