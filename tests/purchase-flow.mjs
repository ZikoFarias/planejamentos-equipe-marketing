import assert from 'node:assert/strict';
import {blank} from '../app/model.ts';
import {mergeScopedTasks,inArea,canManageTask} from '../app/permissions.ts';
import {approveQuote,purchaseReady,purchaseColumns} from '../app/purchases.ts';
const farias={role:'editor',persona:'farias'},lucio={role:'editor',persona:'lucio',email:'lucio@test.local',name:'Lúcio'},mateus={role:'editor',persona:'mateus'},admin={role:'administrador',persona:'farias'},now='2026-10-30T17:00:00Z';
const base={...blank(),title:'Compra sem orçamento',tags:['fibroplast','COMPRA'],assignees:['Farias'],purchase:{requiresArt:false,stage:'comprar'}};
const move=(task,stage,actor=farias)=>mergeScopedTasks([task],[{...task,purchase:{...task.purchase,stage}}],actor,now)[0];
let task=base;
assert.throws(()=>move(task,'orçamento'),/ordem/);
task=move(task,'em andamento');assert.throws(()=>move(task,'orçamento',lucio),/responsável/);task=move(task,'orçamento');
assert.throws(()=>move(task,'aprovado'),/Lúcio/);
assert.throws(()=>move(task,'pagamento'),/ordem/);
assert.throws(()=>approveQuote(task,{...lucio,persona:'farias'}),/Apenas Lucio/);
task=approveQuote(task,lucio,now);assert.equal(task.purchase.stage,'aprovado');assert.equal(task.purchase.selectedQuoteId,undefined);
task=move(task,'pagamento');task=move(task,'aguardando chegada');task=move(task,'concluído');
for(const [stage]of purchaseColumns){const jumped=move(base,stage,admin);assert.equal(jumped.purchase.stage,stage);}
for(const [stage]of purchaseColumns){const current={...base,purchase:{...base.purchase,stage}};for(const actor of [farias,lucio]){const parked=move(current,'stand-by',actor);assert.equal(parked.purchase.stage,'stand-by');if(stage!=='stand-by')assert.equal(move(parked,stage,actor).purchase.stage,stage);}}
const parkedStart=move(base,'stand-by');const forgedResume=mergeScopedTasks([parkedStart],[{...parkedStart,purchase:{...parkedStart.purchase,resumeStage:'pagamento'}}],farias,now)[0];assert.equal(forgedResume.purchase.resumeStage,'comprar');assert.throws(()=>move(forgedResume,'pagamento'),/ordem/);
const option={id:'a',place:'Loja',link:'',unitPrice:10,quantity:2},withQuotes={...base,purchase:{...base.purchase,stage:'orçamento',quotes:[option]}};
assert.throws(()=>mergeScopedTasks([withQuotes],[{...withQuotes,purchase:{...withQuotes.purchase,selectedQuoteId:'a'}}],farias,now),/selecionar/);
const chosen=mergeScopedTasks([withQuotes],[{...withQuotes,purchase:{...withQuotes.purchase,selectedQuoteId:'a'}}],lucio,now)[0];assert.equal(chosen.purchase.selectedQuoteId,'a');assert.equal(chosen.purchase.stage,'orçamento');
const notChosen=approveQuote(withQuotes,lucio,now);assert.equal(notChosen.purchase.stage,'aprovado');assert.equal(notChosen.purchase.selectedQuoteId,undefined);
const unfinished={...base,status:'a fazer luiz',assignees:['Luiz','Farias','Lucio Alves Xavier'],purchase:{requiresArt:true,stage:'comprar'}};assert.equal(canManageTask(unfinished,farias),true);const parkedBeforeArt=mergeScopedTasks([unfinished],[{...unfinished,status:'stand-by ⛔'}],farias,now)[0];assert.equal(parkedBeforeArt.status,'stand-by ⛔');assert.equal(purchaseReady(parkedBeforeArt),false);
const mirror={...base,status:'aprovado ✅',approval:{round:1,votes:{lucio:{decision:'approved',by:lucio.email,at:now}}},purchase:{requiresArt:true,stage:'orçamento'}};
const parked=move(mirror,'stand-by',lucio);assert.equal(parked.status,'stand-by ⛔');assert.ok(inArea(parked,'compras'));
assert.throws(()=>move(mirror,'stand-by',mateus));
const fromOriginal=mergeScopedTasks([mirror],[{...mirror,status:'stand-by ⛔'}],lucio,now)[0];assert.equal(fromOriginal.purchase.stage,'stand-by');
for(const [stage]of purchaseColumns)assert.equal(move(mirror,stage,admin).purchase.stage,stage);
console.log('PASS: Farias follows each stage; Lucio confirms only from budget via approval endpoint; selection and quotes optional; administrator skips any stage; standby allowed for Lucio/Farias; original and mirror remain synchronized.');
