import {canEditQuotes,isPurchase,quotesFor,selectedQuote,quoteApproved,MAX_QUOTE_FILES} from '../app/purchases';
import {canAttachArt} from '../app/art-flow';
import type {Task,Attachment} from '../app/model';
import {canManageTask,canSeeTask,mergeScopedTasks,names,type Actor} from '../app/permissions';
import {companyOf} from '../app/workflow';
import {automaticCover} from '../app/media';
import {readStatusConfig} from '../app/status-config';
import {recordActivity} from '../app/activity';

// Link the confirmed upload on the server, even when its dialog has been closed.
export async function attachCentralArtwork(actor:Actor&{db:D1Database,user:{email:string,displayName:string}},id:string,company:string,attachment:Attachment,quoteId?:string){
 for(let attempt=0;attempt<4;attempt++){
  const row=await actor.db.prepare('SELECT data,revision,status_config FROM marketing_board WHERE id=1').first<{data:string,revision:number,status_config:string}>();
  const tasks=JSON.parse(row?.data||'[]') as Task[],task=tasks.find(t=>t.id===id);
  if(!task||!canManageTask(task,actor))throw Error('O arquivo chegou ao Drive, mas o cartão foi removido ou seu acesso mudou. Confira antes de reenviar.');
  if(quoteId===undefined&&!canAttachArt(task,actor))throw Error('A etapa mudou durante o envio. Lúcio e Mateus não podem inserir artes nesta etapa. O arquivo permanece no Drive.');
  if(companyOf(task)?.id!==company)throw Error('A empresa do cartão mudou durante o envio. O arquivo permanece na pasta original do Drive.');
  let candidate:Task;
  if(quoteId!==undefined){
   if(!isPurchase(task)||!canEditQuotes(actor)||!task.purchase)throw Error('Seu acesso ao orçamento mudou durante o envio.');
   const quotes=quotesFor(task),quote=quotes.find(q=>q.id===quoteId);
   if(!quote)throw Error('O orçamento foi removido durante o envio.');
   if(attachment.purpose==='invoice'&&(!quoteApproved(task)||selectedQuote(task)?.id!==quoteId))throw Error('A NF só pode ser anexada ao orçamento aprovado.');
   if(quote.attachments?.some(a=>a.drive?.fileId===attachment.drive?.fileId))return {tasks:tasks.filter(t=>canSeeTask(t,actor)),revision:row!.revision};
   if((quote.attachments?.length||0)>=MAX_QUOTE_FILES)throw Error('Este orçamento atingiu o limite de anexos.');
   candidate={...task,purchase:{...task.purchase,selectedQuoteId:selectedQuote(task)?.id,quotes:quotes.map(q=>q.id===quoteId?{...q,attachments:[...q.attachments||[],attachment]}:q)}};
  }else{
   if(task.attachments.some(a=>a.drive?.fileId===attachment.drive?.fileId))return {tasks:tasks.filter(t=>canSeeTask(t,actor)),revision:row!.revision};
   const attachments=[...task.attachments,attachment];candidate={...task,attachments,coverUrl:automaticCover(attachments)};
  }
  const config=readStatusConfig(row!.status_config),merged=mergeScopedTasks(tasks,tasks.map(t=>t.id===id?candidate:t),actor,new Date().toISOString(),config);
  const next=merged.map(t=>t.id===id?recordActivity(task,t,names[actor.persona]||actor.user.displayName):t);
  if(next.length>3000||JSON.stringify(next).length>4000000)throw Error('O arquivo chegou ao Drive, mas o quadro atingiu o limite de dados. Confira antes de reenviar.');
  const saved=await actor.db.prepare('UPDATE marketing_board SET data=?,revision=revision+1 WHERE id=1 AND revision=?').bind(JSON.stringify(next),row!.revision).run();
  if(saved.meta.changes)return {tasks:next.filter(t=>canSeeTask(t,actor)),revision:row!.revision+1};
 }
 throw Error('O arquivo chegou ao Drive, mas o quadro está recebendo outras alterações. Confira os anexos antes de reenviar.');
}
