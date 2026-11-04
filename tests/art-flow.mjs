import assert from 'node:assert/strict';
import {blank} from '../app/model';
import {mergeScopedTasks,canCreateTask,canManageTask} from '../app/permissions';
import {canAttachArt} from '../app/art-flow';
import {castApprovalVote} from '../app/approval';
import {emptyStatusConfig} from '../app/status-config';
const farias={role:'editor',persona:'farias'},lucio={role:'editor',persona:'lucio',email:'lucio@test',name:'Lucio'},mateus={role:'editor',persona:'mateus',email:'mateus@test',name:'Mateus'};
const task={...blank(),title:'ARTE TESTE',tags:['fibroplast'],assignees:['Farias']};
const move=(t,status,actor=farias)=>mergeScopedTasks([t],[{...t,status}],actor)[0];
for(const persona of ['farias','luiz','lucio','mateus'])for(const status of ['a fazer farias','a fazer luiz'])assert.equal(mergeScopedTasks([],[{...task,status}],{role:'editor',persona})[0].status,status);
assert.equal(move(task,'aprovação fibroplast').status,'aprovação fibroplast');assert.throws(()=>move(task,'aprovado ✅'),/votos/);assert.throws(()=>move(task,'concluidos e postados'),/aprovação/);assert.throws(()=>move(task,'em andamento farias',lucio),/iniciar/);
const progress=move(task,'em andamento farias');assert.throws(()=>move(progress,'aprovado ✅'),/votos/);const review=move(progress,'aprovação fibroplast');
for(const actor of [lucio,mateus]){assert(!canAttachArt(progress,actor));assert(!canAttachArt(review,actor));assert(canAttachArt(task,actor));assert.throws(()=>mergeScopedTasks([review],[{...review,attachments:[{name:'arte.png',url:'https://example.com/a.png',artworkKind:'final'}]}],actor),/revisam/)}
const one=castApprovalVote(review,lucio,'approved',emptyStatusConfig);assert.equal(one.status,review.status);assert.throws(()=>move(one,'aprovado ✅'),/votos/);
const two=castApprovalVote(one,mateus,'approved',emptyStatusConfig);assert.equal(two.status,'aprovado ✅');assert.equal(move(two,'concluidos e postados').status,'concluidos e postados');assert.equal(move(two,'ajustar ⚠️',farias).status,'ajustar ⚠️');assert.equal(move(two,'ajustar ⚠️',lucio).status,'ajustar ⚠️');
const negative=castApprovalVote(review,mateus,'adjust',emptyStatusConfig);assert.equal(negative.status,'ajustar ⚠️');assert.equal(move(negative,'aprovação fibroplast').status,'aprovação fibroplast');assert.equal(move(negative,'em andamento farias').status,'em andamento farias');
const standby=move(task,'stand-by ⛔',lucio);assert.equal(standby.workflowResume,task.status);assert.throws(()=>move(standby,'concluidos e postados',lucio),/Retome/);assert.throws(()=>move(standby,'em andamento farias'),/Retome/);assert.equal(move(standby,task.status).status,task.status);
const approvedStandby=move(two,'stand-by ⛔');assert.equal(move(approvedStandby,'concluidos e postados').status,'concluidos e postados');
assert.equal(move(task,'aprovação fibroplast',{role:'administrador',persona:'farias'}).status,'aprovação fibroplast');const administrative=move(task,'aprovado ✅',{role:'administrador',persona:'farias'});assert(administrative.approval.administrative);assert.deepEqual(administrative.approval.votes,{});
console.log('PASS: strict artwork stages, all four create, designer starts, both votes required, reviewer attachment restriction, negative adjustment loop, no admin bypass and safe standby resume.');

const editedApproved=mergeScopedTasks([two],[{...two,description:'NOVA ARTE'}],farias)[0];assert.equal(editedApproved.status,'ajustar ⚠️');assert.deepEqual(editedApproved.approval.votes,{});

for(const persona of ['farias','luiz'])for(const status of ['a fazer farias','a fazer luiz']){const actor={role:'editor',persona},created={...task,id:'new-'+persona+status,status,assignees:[status.endsWith('luiz')?'Luiz':'Farias']};assert(canCreateTask(created,actor));assert.equal(mergeScopedTasks([],[created],actor)[0].status,status);if(!status.endsWith(persona))assert(!canManageTask(created,actor),'Creating in another designer column does not grant ongoing access');const purchase={...created,tags:['fibroplast','COMPRA'],purchase:{requiresArt:true,stage:'comprar'}};assert(canCreateTask(purchase,actor));assert.equal(mergeScopedTasks([],[purchase],actor)[0].status,status)}
assert(!canCreateTask(task,{role:'visualizador',persona:'farias'}));assert(!canCreateTask({...task,status:'em andamento farias'},farias));

// A full-board save includes read-only tasks exactly as GET presents them.
const other={spelling:{fingerprint:'[]',state:'clean',message:'OK',issues:[],checkedAt:'2026-11-03T00:00:00Z'},...task,id:'readonly-other',status:'a fazer luiz',assignees:['Luiz']};
const reordered=Object.fromEntries(Object.entries(other).reverse());const fresh={...task,id:'new-designer',title:'PERFIL WHATSAPP'};
assert.equal(mergeScopedTasks([other],[reordered,fresh],farias).length,2);assert.deepEqual(mergeScopedTasks([other],[reordered,fresh],farias)[0],other);
assert.throws(()=>mergeScopedTasks([other],[{...reordered,title:'ALTERAÇÃO PROIBIDA'},fresh],farias),/apenas o responsável/);
assert.throws(()=>mergeScopedTasks([other],[{...reordered,assignees:['Farias']},fresh],farias),/apenas o responsável/);
const presented={...other,assignees:['Luiz','Lucio Alves Xavier','Mateus']};assert.equal(mergeScopedTasks([other],[presented,fresh],farias).length,2);

for(const persona of ['farias','luiz','lucio','mateus']){assert.equal(move(administrative,'concluidos e postados',{role:'editor',persona}).status,'concluidos e postados');assert.equal(move(two,'concluidos e postados',{role:'editor',persona}).status,'concluidos e postados')}

for(const persona of ['farias','luiz']){
 const actor={role:'editor',persona},company=persona==='farias'?'fibroplast':'posto-ps',approval=persona==='farias'?'aprovação fibroplast':'aprovação postos';
 const own={...task,id:'direct-'+persona,status:'a fazer '+persona,tags:[company],assignees:[persona==='farias'?'Farias':'Luiz']};
 const direct=move(own,approval,actor);assert.equal(direct.status,approval);assert.equal(direct.approval.round,1);assert.equal(direct.caption.status,'todo');
 for(const source of [own,direct,move(own,'em andamento '+persona,actor)]){
  const adjusted=move(source,'ajustar ⚠️',actor);assert.equal(adjusted.status,'ajustar ⚠️');assert.deepEqual(adjusted.approval.votes,{});
 }
 const voted={...direct,approval:{round:1,votes:{lucio:{decision:'approved',by:'lucio@test',at:'2026-11-04T12:00:00Z'}}}};
 const returned=move(voted,'ajustar ⚠️',actor);assert.deepEqual(returned.approval.votes,{});assert.equal(returned.approval.round,2);assert.equal(move(returned,approval,actor).status,approval);
 assert.throws(()=>move(direct,'aprovado ✅',actor),/votos/);
 assert.throws(()=>castApprovalVote(direct,{...actor,email:persona+'@test',name:persona},'approved',emptyStatusConfig),/Apenas/);
}

const adminActor={role:'administrador',persona:'farias'};
for(const source of ['a fazer farias','a fazer luiz','em andamento farias','em andamento luiz','aprovação fibroplast','ajustar ⚠️','aprovado ✅','stand-by ⛔','concluidos e postados']){
 const base={...task,status:source,approval:{round:1,votes:{},administrative:true}};
 for(const target of ['a fazer farias','a fazer luiz','em andamento farias','em andamento luiz','aprovação fibroplast','ajustar ⚠️','aprovado ✅','stand-by ⛔','concluidos e postados'])assert.equal(move(base,target,adminActor).status,target,'ADM movement '+source+' -> '+target);
}
