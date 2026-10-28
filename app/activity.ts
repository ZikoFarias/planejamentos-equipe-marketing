import type {Task} from './model';
export function recordActivity(previous:Task|undefined,next:Task,by:string,at=new Date().toISOString()):Task{
 const events:Task['history']=[],add=(text:string,attachments?:Task['attachments'])=>events.push({text,by,at,...(attachments?{attachments}:{})});
 if(!previous)add('Criou o cartão');
 else {
  if(previous.status!==next.status)add(`Alterou o status de ${previous.status} para ${next.status}`);
  if(previous.purchase?.stage!==next.purchase?.stage&&next.purchase)add(`Compra: ${next.purchase.stage}`);
  if(previous.purchase?.requiresArt!==next.purchase?.requiresArt&&next.purchase)add(next.purchase.requiresArt?'Solicitou criação de arte antes da compra':'Compra sem criação de arte');
  const fields:[keyof Task,string][]=[['title','título'],['description','descrição'],['assignees','responsáveis'],['tags','etiquetas'],['priority','prioridade'],['due','data de entrega'],['start','data inicial'],['purchase','dados da compra'],['coverUrl','capa'],['checklist','checklist']];
  for(const [field,label] of fields)if(JSON.stringify(previous[field])!==JSON.stringify(next[field]))add(`Atualizou ${label}`);
 }
 const added=next.attachments.filter(a=>!previous?.attachments.some(old=>old.url===a.url));
 for(const a of added)add(`Adicionou ${a.artworkKind==='final'?'arte final':'referência'}: ${a.name}`,[a]);
 for(const a of previous?.attachments||[])if(!next.attachments.some(item=>item.url===a.url))add(`Removeu o arquivo ${a.name}`);
 return {...next,history:[...events,...next.history.filter(h=>!['Tarefa atualizada','Tarefa criada'].includes(h.text)||previous?.history.some(old=>JSON.stringify(old)===JSON.stringify(h)))]};
}
