import type {Actor} from './permissions';
import type {Task,QuoteOption} from './model';
export const purchaseColumns=[['comprar','#579dff','Comprar'],['em andamento','#ffc2a9','Em andamento'],['orçamento','#a78bfa','Orçamento'],['aprovado','#00d99a','Aprovado'],['pagamento','#ffc53d','Pagamento'],['aguardando chegada','#61c8ed','Aguardando chegada'],['stand-by','#ff7373','Stand-by'],['concluído','#008844','Concluído']];
export const isPurchase=(t:Task)=>t.tags.some(tag=>['COMPRA','COMPRAR'].includes(tag.trim().toLocaleUpperCase('pt-BR')));
export const purchaseReady=(t:Task)=>isPurchase(t)&&(t.purchase?.requiresArt===false||(['aprovado ✅','stand-by ⛔','concluidos e postados'].includes(t.status)&&(t.approval?.votes.lucio?.decision==='approved'||t.approval?.administrative===true)));
export const quotesFor=(t:Task):QuoteOption[]=>t.purchase?.quotes??(t.purchase?.quote?[{...t.purchase.quote,id:'legacy',link:''}]:[]);
export const selectedQuote=(t:Task)=>quotesFor(t).find(q=>q.id===(t.purchase?.selectedQuoteId||(!t.purchase?.quotes&&t.purchase?.quote?'legacy':undefined)));
export const quoteSnapshot=(t:Task)=>JSON.stringify({quotes:quotesFor(t),selected:t.purchase?.selectedQuoteId||(!t.purchase?.quotes&&t.purchase?.quote?'legacy':''),title:t.title.trim().toLocaleUpperCase('pt-BR'),description:t.description,tags:t.tags});
export const quoteValid=(t:Task)=>{const q=selectedQuote(t);return !!q&&!!(q.place.trim()||/^https?:\/\//.test(q.link))&&Number.isFinite(q.unitPrice)&&q.unitPrice>0&&Number.isFinite(q.quantity)&&q.quantity>0};
export const quoteApproved=(t:Task)=>quoteValid(t)&&(t.purchase?.quoteApproval?.snapshot===quoteSnapshot(t)||(!t.purchase?.quotes&&t.purchase?.quoteApproval?.snapshot===JSON.stringify({quote:t.purchase?.quote||null,title:t.title.trim().toLocaleUpperCase('pt-BR'),description:t.description,tags:t.tags})));
export const money=(amount:number)=>amount.toLocaleString('pt-BR',{style:'currency',currency:'BRL'});
export function normalizePurchase(t:Task,previous?:Task,admin=false):Task{
 if(!isPurchase(t))return {...t,purchase:undefined};
 if(t.purchase&&(typeof t.purchase.requiresArt!=='boolean'||!purchaseColumns.some(([id])=>id===t.purchase!.stage)))throw Error('Etapa de compra inválida.');
 if(t.purchase?.quote){const q=t.purchase.quote;if(typeof q.place!=='string'||q.place.length>300||!Number.isFinite(q.unitPrice)||q.unitPrice<0||q.unitPrice>1e9||!Number.isFinite(q.quantity)||q.quantity<0||q.quantity>1e9)throw Error('Informe local, valor e quantidade válidos.');}
 if(t.purchase?.quotes!==undefined){const rows=t.purchase.quotes;if(!Array.isArray(rows)||rows.length>30||new Set(rows.map(q=>q?.id)).size!==rows.length||rows.some(q=>!q||typeof q.id!=='string'||!q.id||q.id.length>100||typeof q.place!=='string'||q.place.length>300||typeof q.link!=='string'||q.link.length>2000||(q.link&&!/^https?:\/\//.test(q.link))||!Number.isFinite(q.unitPrice)||q.unitPrice<0||q.unitPrice>1e9||!Number.isFinite(q.quantity)||q.quantity<0||q.quantity>1e9))throw Error('Revise os orçamentos: use links http/https, valores e quantidades válidos (até 30 opções).');
 if(t.purchase.selectedQuoteId&&!rows.some(q=>q.id===t.purchase!.selectedQuoteId))throw Error('Selecione um dos orçamentos cadastrados.');}
 if(JSON.stringify(previous?.purchase?.quoteApproval)!==JSON.stringify(t.purchase?.quoteApproval))throw Error('A aprovação do orçamento deve ser registrada por Lucio.');
 const next={...t,status:t.status,purchase:t.purchase||{requiresArt:true,stage:'comprar'},assignees:[...t.assignees.filter(n=>n.toLowerCase()!=='farias'),'Farias']};
 if(previous&&purchaseReady(previous)&&!purchaseReady(next))next.purchase={...next.purchase,stage:'comprar'};
 if(!admin&&!purchaseReady(next)&&next.purchase.stage!=='comprar')throw Error('A arte de compra precisa ser aprovada por Lucio antes de avançar.');
 const quoteChanged=!!previous&&quoteSnapshot(previous)!==quoteSnapshot(next),enteringQuote=next.purchase.stage==='orçamento'&&previous?.purchase?.stage!=='orçamento';
 if(quoteChanged||enteringQuote)next.purchase={...next.purchase,quoteApproval:undefined};

 if(!admin&&previous?.purchase?.requiresArt&&!next.purchase.requiresArt&&previous.status!=='aprovado ✅')throw Error('A compra já foi encaminhada para criação de arte. Conclua a aprovação antes de comprar.');
 if(previous&&purchaseReady(previous)&&purchaseReady(next)){
  if(next.status!==previous.status&&next.status==='stand-by ⛔')next.purchase={...next.purchase,stage:'stand-by'};
  if(next.status!==previous.status&&next.status==='concluidos e postados')next.purchase={...next.purchase,stage:'concluído'};
  if(next.purchase.stage==='stand-by'&&previous.purchase?.stage!=='stand-by')next.purchase={...next.purchase,resumeStage:previous.purchase?.stage||'comprar'};
 }
 if(next.purchase.requiresArt&&previous&&purchaseReady(previous)&&purchaseReady(next)){
  if(next.purchase.stage==='stand-by'){next.status='stand-by ⛔';next.workflowResume=previous.workflowResume||previous.status;}
  else if(next.purchase.stage==='concluído'){next.status='concluidos e postados';next.workflowResume=undefined;}
  else if(['stand-by','concluído'].includes(previous.purchase?.stage||'')&&['stand-by ⛔','concluidos e postados'].includes(next.status)){next.status='aprovado ✅';next.workflowResume=undefined;}
 }
 if(next.purchase.stage==='stand-by'&&previous)next.purchase={...next.purchase,resumeStage:previous.purchase?.stage==='stand-by'?previous.purchase.resumeStage||'comprar':previous.purchase?.stage||'comprar'};
 else next.purchase={...next.purchase,resumeStage:undefined};
 return next;
}
export function approveQuote(task:Task,actor:{role:string,persona:string,email:string,name:string},now=new Date().toISOString()):Task{
 if(actor.role!=='administrador'&&!(actor.role==='editor'&&actor.persona==='lucio'))throw Error('Apenas Lucio ou um administrador por Lucio pode aprovar o orçamento.');
 if(!purchaseReady(task)||task.purchase?.stage!=='orçamento')throw Error('Encaminhe o cartão para Orçamento antes de Lúcio mover para Aprovado.');
 const q=selectedQuote(task);
 return {...task,purchase:{...task.purchase,stage:'aprovado',quoteApproval:quoteValid(task)?{by:actor.email,at:now,snapshot:quoteSnapshot(task)}:undefined},history:[{by:actor.name,at:now,text:actor.name+' moveu de Orçamento para Aprovado'+(q?' · '+(q.place||q.link)+' · '+q.quantity+' × '+money(q.unitPrice)+' = '+money(q.quantity*q.unitPrice):' · sem orçamento selecionado')},...task.history]};
}

export function guardPurchaseEdit(previous:Task|undefined,next:Task,actor:Actor){
 if(actor.role!=='administrador'&&next.purchase?.selectedQuoteId&&next.purchase.selectedQuoteId!==(previous?selectedQuote(previous)?.id:undefined)&&actor.persona!=='lucio')throw Error('Apenas Lúcio pode selecionar o orçamento.');
 if(!previous||!isPurchase(previous)||!isPurchase(next)||actor.role==='administrador'||actor.persona==='farias')return;
 if(JSON.stringify(previous.purchase)===JSON.stringify(next.purchase))return;
 const {stage:oldStage,selectedQuoteId:oldSelection,...oldFields}=previous.purchase||{};
 const {stage:newStage,selectedQuoteId:newSelection,...newFields}=next.purchase||{};
 if(actor.persona==='lucio'&&JSON.stringify(oldFields)===JSON.stringify(newFields))return;
 throw Error('Farias é responsável por editar e direcionar as compras. Lúcio pode selecionar o orçamento e confirmar a compra.');
}
export function guardPurchaseFlow(previous:Task|undefined,next:Task,actor:Actor):Task{
 if(!isPurchase(next)||actor.role==='administrador')return next;
 if(next.status==='stand-by ⛔'&&previous?.status!==next.status&&!['lucio','farias'].includes(actor.persona))throw Error('Apenas Lúcio e Farias podem enviar compras para Stand-by.');
 if(!purchaseReady(next))return next;
 const before=previous?.purchase?.stage||'comprar',after=next.purchase?.stage||'comprar';
 if(!previous){if(after!=='comprar')throw Error('Crie a compra em Comprar.');return next;}
 if(before===after)return next;
 if(after==='stand-by'){
  if(!['lucio','farias'].includes(actor.persona))throw Error('Apenas Lúcio e Farias podem enviar compras para Stand-by.');
  return next;
 }
 if(before==='stand-by'&&after===(previous.purchase?.resumeStage||'comprar')&&['lucio','farias'].includes(actor.persona))return next;
 if(after==='aprovado')throw Error('Lúcio confirma a compra arrastando de Orçamento para Aprovado.');
 const transitions:Record<string,string>={'comprar':'em andamento','em andamento':'orçamento','aprovado':'pagamento','pagamento':'aguardando chegada','aguardando chegada':'concluído'};
 if(actor.persona!=='farias')throw Error('Farias é responsável por movimentar esta etapa da compra.');
 if(transitions[before]!==after)throw Error('Siga a ordem: Comprar → Em andamento → Orçamento → Aprovado → Pagamento → Aguardando chegada → Concluído. Stand-by é a exceção.');
 return next;
}
