import type {Task,QuoteOption} from './model';
export const purchaseColumns=[['comprar','#579dff','Comprar'],['em andamento','#ffc2a9','Em andamento'],['orçamento','#a78bfa','Orçamento'],['aprovado','#00d99a','Aprovado'],['pagamento','#ffc53d','Pagamento'],['aguardando chegada','#61c8ed','Aguardando chegada'],['stand-by','#ff7373','Stand-by'],['concluído','#008844','Concluído']];
export const isPurchase=(t:Task)=>t.tags.some(tag=>['COMPRA','COMPRAR'].includes(tag.trim().toLocaleUpperCase('pt-BR')));
export const purchaseReady=(t:Task)=>isPurchase(t)&&(t.purchase?.requiresArt===false||(['aprovado ✅','stand-by ⛔','concluidos e postados'].includes(t.status)&&(t.approval?.votes.lucio?.decision==='approved'||t.approval?.administrative===true)));
export const quotesFor=(t:Task):QuoteOption[]=>t.purchase?.quotes??(t.purchase?.quote?[{...t.purchase.quote,id:'legacy',link:''}]:[]);
export const selectedQuote=(t:Task)=>quotesFor(t).find(q=>q.id===(t.purchase?.selectedQuoteId||quotesFor(t)[0]?.id));
export const quoteSnapshot=(t:Task)=>JSON.stringify({quotes:quotesFor(t),selected:t.purchase?.selectedQuoteId||quotesFor(t)[0]?.id||'',title:t.title.trim().toLocaleUpperCase('pt-BR'),description:t.description,tags:t.tags});
export const quoteValid=(t:Task)=>{const q=selectedQuote(t);return !!q&&!!(q.place.trim()||/^https?:\/\//.test(q.link))&&Number.isFinite(q.unitPrice)&&q.unitPrice>0&&Number.isFinite(q.quantity)&&q.quantity>0};
export const quoteApproved=(t:Task)=>quoteValid(t)&&(t.purchase?.quoteApproval?.snapshot===quoteSnapshot(t)||(!t.purchase?.quotes&&t.purchase?.quoteApproval?.snapshot===JSON.stringify({quote:t.purchase?.quote||null,title:t.title.trim().toLocaleUpperCase('pt-BR'),description:t.description,tags:t.tags})));
export const money=(amount:number)=>amount.toLocaleString('pt-BR',{style:'currency',currency:'BRL'});
export function normalizePurchase(t:Task,previous?:Task):Task{
 if(!isPurchase(t))return {...t,purchase:undefined};
 if(t.purchase&&(typeof t.purchase.requiresArt!=='boolean'||!purchaseColumns.some(([id])=>id===t.purchase!.stage)))throw Error('Etapa de compra inválida.');
 if(t.purchase?.quote){const q=t.purchase.quote;if(typeof q.place!=='string'||q.place.length>300||!Number.isFinite(q.unitPrice)||q.unitPrice<0||q.unitPrice>1e9||!Number.isFinite(q.quantity)||q.quantity<0||q.quantity>1e9)throw Error('Informe local, valor e quantidade válidos.');}
 if(t.purchase?.quotes!==undefined){const rows=t.purchase.quotes;if(!Array.isArray(rows)||rows.length>30||new Set(rows.map(q=>q?.id)).size!==rows.length||rows.some(q=>!q||typeof q.id!=='string'||!q.id||q.id.length>100||typeof q.place!=='string'||q.place.length>300||typeof q.link!=='string'||q.link.length>2000||(q.link&&!/^https?:\/\//.test(q.link))||!Number.isFinite(q.unitPrice)||q.unitPrice<0||q.unitPrice>1e9||!Number.isFinite(q.quantity)||q.quantity<0||q.quantity>1e9))throw Error('Revise os orçamentos: use links http/https, valores e quantidades válidos (até 30 opções).');
 if(t.purchase.selectedQuoteId&&!rows.some(q=>q.id===t.purchase!.selectedQuoteId))throw Error('Selecione um dos orçamentos cadastrados.');}
 if(JSON.stringify(previous?.purchase?.quoteApproval)!==JSON.stringify(t.purchase?.quoteApproval))throw Error('A aprovação do orçamento deve ser registrada por Lucio.');
 const next={...t,status:t.status,purchase:t.purchase||{requiresArt:true,stage:'comprar'},assignees:[...t.assignees.filter(n=>n.toLowerCase()!=='farias'),'Farias']};
 if(previous&&purchaseReady(previous)&&!purchaseReady(next))next.purchase={...next.purchase,stage:'comprar'};
 if(!purchaseReady(next)&&next.purchase.stage!=='comprar')throw Error('A arte de compra precisa ser aprovada por Lucio antes de avançar.');
 const quoteChanged=!!previous&&quoteSnapshot(previous)!==quoteSnapshot(next),enteringQuote=next.purchase.stage==='orçamento'&&previous?.purchase?.stage!=='orçamento';
 if(quoteChanged||enteringQuote){next.purchase={...next.purchase,quoteApproval:undefined};if(['aprovado','pagamento','aguardando chegada','concluído'].includes(next.purchase.stage))next.purchase.stage='orçamento';}
 if(['aprovado','pagamento','aguardando chegada','concluído'].includes(next.purchase.stage)&&!quoteApproved(next))throw Error('Encaminhe o orçamento para aprovação de Lucio antes de avançar.');
 if(previous?.purchase?.requiresArt&&!next.purchase.requiresArt&&previous.status!=='aprovado ✅')throw Error('A compra já foi encaminhada para criação de arte. Conclua a aprovação antes de comprar.');
 if(next.purchase.requiresArt&&previous&&purchaseReady(previous)&&purchaseReady(next)){
  if(next.purchase.stage==='stand-by'){next.status='stand-by ⛔';next.workflowResume=previous.workflowResume||previous.status;}
  else if(next.purchase.stage==='concluído'){next.status='concluidos e postados';next.workflowResume=undefined;}
  else if(['stand-by','concluído'].includes(previous.purchase?.stage||'')&&['stand-by ⛔','concluidos e postados'].includes(next.status)){next.status='aprovado ✅';next.workflowResume=undefined;}
 }
 return next;
}
export function approveQuote(task:Task,actor:{role:string,persona:string,email:string,name:string},now=new Date().toISOString()):Task{
 if(actor.role!=='administrador'&&!(actor.role==='editor'&&actor.persona==='lucio'))throw Error('Apenas Lucio ou um administrador por Lucio pode aprovar o orçamento.');
 if(!purchaseReady(task)||task.purchase?.stage!=='orçamento'||!quoteValid(task))throw Error('Informe local, valor e quantidade e encaminhe para Orçamento antes de aprovar.');
 const q=selectedQuote(task)!;
 return {...task,purchase:{...task.purchase,stage:'aprovado',quoteApproval:{by:actor.email,at:now,snapshot:quoteSnapshot(task)}},history:[{by:actor.name,at:now,text:`${actor.name} aprovou o orçamento${actor.role==='administrador'?' por Lucio':''}: ${q.place||q.link} · ${q.quantity} × ${money(q.unitPrice)} = ${money(q.quantity*q.unitPrice)}`},...task.history]};
}
