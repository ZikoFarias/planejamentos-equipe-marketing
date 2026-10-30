import assert from 'node:assert/strict';
import {blank} from '../app/model.ts';
import {normalizePurchase,purchaseReady,approveQuote} from '../app/purchases.ts';
import {assignStatusOwner,inArea,canManageTask,mergeScopedTasks} from '../app/permissions.ts';
import {castApprovalVote} from '../app/approval.ts';
import {emptyStatusConfig} from '../app/status-config.ts';
const farias={role:'editor',persona:'farias'},lucio={role:'editor',persona:'lucio',email:'lucio@test.local',name:'Lucio'};
for(const designer of ['luiz','farias']){
 const actor={role:'editor',persona:designer},now='2026-10-30T15:00:00Z';
 let task=mergeScopedTasks([],[{...blank('a fazer '+designer),title:'Comprar banner',tags:['fibroplast','COMPRA']}],actor,now)[0];
 const id=task.id;assert.equal(task.status,'a fazer '+designer);assert.equal(task.purchase.requiresArt,true);
 assert.ok(canManageTask(task,actor));assert.ok(inArea(task,designer));assert.equal(inArea(task,'compras'),false);
 task=mergeScopedTasks([task],[{...task,status:'em andamento '+designer}],actor,now)[0];
 task=mergeScopedTasks([task],[{...task,status:'aprovação fibroplast'}],actor,now)[0];
 assert.equal(purchaseReady(task),false);
 task=castApprovalVote(task,lucio,'approved',emptyStatusConfig,now);
 assert.equal(task.status,'aprovado ✅');assert.ok(inArea(task,designer));assert.ok(inArea(task,'aprovacoes'));assert.ok(inArea(task,'compras'));
 const change=(stage)=>{const next=mergeScopedTasks([task],[{...task,purchase:{...task.purchase,stage}}],farias,now);assert.equal(next.length,1);assert.equal(next[0].id,id);task=next[0];};
 change('stand-by');assert.equal(task.status,'stand-by ⛔');assert.ok(inArea(task,'compras'));assert.ok(inArea(task,designer));
 change('em andamento');assert.equal(task.status,'aprovado ✅');
 assert.throws(()=>change('concluído'),/orçamento/);
 task=mergeScopedTasks([task],[{...task,purchase:{...task.purchase,quotes:[{id:'quote',place:'Loja',link:'',quantity:2,unitPrice:10}],selectedQuoteId:'quote',stage:'orçamento'}}],farias,now)[0];
 task=approveQuote(task,lucio,now);change('pagamento');change('aguardando chegada');change('concluído');
 assert.equal(task.status,'concluidos e postados');assert.equal(task.postedAt,now);assert.ok(inArea(task,'compras'));assert.ok(inArea(task,designer));assert.ok(inArea(task,'aprovacoes'));
 const edited=mergeScopedTasks([task],[{...task,description:'Alterar arte'}],farias,now)[0];
 assert.equal(edited.status,'aprovação fibroplast');assert.equal(purchaseReady(edited),false);assert.equal(edited.purchase.stage,'comprar');
}
console.log('PASS: both designers keep original cards; purchase mirror appears only after Lucio approval; one ID stays synchronized; standby/completion update original; quote approval still required; artwork changes reset approval and hide mirror.');
