import assert from 'node:assert/strict';
import {blank} from '../app/model';
import {mergeScopedTasks,inArea} from '../app/permissions';
import {purchaseReady} from '../app/purchases';
for(const persona of ['farias','luiz','lucio','mateus'])for(const tag of ['COMPRA','COMPRAR','COMPRAS']){
 const original={...blank('a fazer '+(persona==='luiz'?'luiz':'farias')),title:'COMPRA DIRETA',tags:['fibroplast',tag]};
 const direct=mergeScopedTasks([],[original],{role:'editor',persona})[0];
 assert.equal(direct.purchase.requiresArt,false);assert.equal(direct.purchase.stage,'comprar');assert(purchaseReady(direct));assert(inArea(direct,'compras'));assert(!inArea(direct,'farias'));assert(!inArea(direct,'luiz'));assert(!inArea(direct,'aprovacoes'));
}
const actor={role:'editor',persona:'luiz'},original={...blank('a fazer luiz'),title:'CARD EXISTENTE',description:'Preservar descrição',tags:['fibroplast'],assignees:['Luiz']};
const routed=mergeScopedTasks([original],[{...original,tags:[...original.tags,'COMPRA']}],actor)[0];assert.equal(routed.description,original.description);assert(inArea(routed,'compras'));assert(!inArea(routed,'luiz'));
const legacy={...routed,purchase:{requiresArt:true,stage:'comprar'}};assert(purchaseReady(legacy));assert(!inArea(legacy,'luiz'));assert(!inArea(legacy,'farias'));
const artwork=mergeScopedTasks([],[{...original,tags:['fibroplast','COMPRA','MÍDIA EXTERNA']}],actor)[0];assert(artwork.purchase.requiresArt);assert(!purchaseReady(artwork));assert(inArea(artwork,'luiz'));assert(!inArea(artwork,'compras'));
const withoutMedia=mergeScopedTasks([artwork],[{...artwork,tags:['fibroplast','COMPRA']}],actor)[0];assert.equal(withoutMedia.purchase.requiresArt,false);assert(inArea(withoutMedia,'compras'));assert(!inArea(withoutMedia,'luiz'));
console.log('PASS: purchases without external media go directly to Compras for all creators, stay out of designer areas, existing cards can be handed off and combined tags keep art approval first.');
