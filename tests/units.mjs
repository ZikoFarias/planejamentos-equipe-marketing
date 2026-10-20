import assert from 'node:assert/strict';
import {companies,companyId,companyOf,setCompany,approvalFor} from '../app/workflow.ts';
const task={id:'unit',title:'Teste',status:'aprovação materiais',tags:['materiais','campanha'],assignees:['Farias']};
assert.equal(companies.length,9);assert(!companies.some(c=>['materiais','postos'].includes(c.id)));
for(const [tag,status] of [['MATERIAIS-PS','aprovação materiais'],['MATERIAIS-SMO','aprovação materiais'],['POSTO-PS','aprovação postos'],['POSTO-RV','aprovação postos'],['POSTO-BRR','aprovação postos']]){const id=companyId(tag);assert(id);const updated=setCompany(task,id);assert.equal(approvalFor(updated),status);assert.equal(updated.status,status);assert.equal(companyOf(updated).label,tag);assert.deepEqual(updated.tags,[id,'campanha']);assert.deepEqual(updated.assignees,['Farias']);}
assert.equal(companyOf(task).id,'materiais');assert(companyOf(task).label.includes('UNIDADE NÃO DEFINIDA'));assert.equal(companyOf({...task,tags:['postos']}).id,'postos');
assert.equal(approvalFor(task),'aprovação materiais');assert.throws(()=>approvalFor({...task,tags:['posto-ps','posto-rv']}),/apenas uma/);
console.log('PASS: cinco unidades, roteamento por família, troca remove etiqueta antiga, responsável preservado, legado sem unidade presumida e bloqueio de duas empresas.');
