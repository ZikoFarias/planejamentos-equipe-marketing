import assert from 'node:assert/strict';
import {canSeeTask,inArea,areaStatuses,mergeScopedTasks,assignStatusOwner,luizStatuses,fariasStatuses,sharedStatuses,reviewStatuses} from '../app/permissions.ts';
const task=(id,status,assignees=[])=>({id,title:id,status,assignees,tags:[],description:'',priority:'normal',start:'',due:'',subtasks:[],checklist:[],attachments:[],history:[],comments:[]});
const luiz={role:'editor',persona:'luiz'},farias={role:'editor',persona:'farias'},mateus={role:'editor',persona:'mateus'},lucio={role:'editor',persona:'lucio'};
for(const s of luizStatuses){assert(canSeeTask(task('l',s),luiz));assert(!canSeeTask(task('l',s),farias));}
for(const s of fariasStatuses){assert(canSeeTask(task('f',s),farias));assert(!canSeeTask(task('f',s),luiz));}
for(const s of sharedStatuses){assert(canSeeTask(task('l',s,['Luiz']),luiz));assert(!canSeeTask(task('l',s,['Luiz']),farias));assert(!canSeeTask(task('f',s,['Farias']),luiz));assert(canSeeTask(task('both',s,['Farias','Luiz']),luiz));assert(canSeeTask(task('both',s,['Farias','Luiz']),farias));assert(canSeeTask(task('both',s,['Farias']),mateus));assert(canSeeTask(task('both',s,['Luiz']),lucio));}
for(const s of reviewStatuses){assert(canSeeTask(task('r',s),mateus));assert(canSeeTask(task('r',s),lucio));}
assert(!canSeeTask(task('progress','em andamento luiz',['Luiz']),mateus));
const hidden=task('f','a fazer farias',['Farias']),mine=task('l','a fazer luiz',['Luiz']);
let saved=mergeScopedTasks([hidden,mine],[{...mine,title:'Edição de Luiz'}],luiz);assert.deepEqual(saved.find(t=>t.id==='f'),hidden);
assert.throws(()=>mergeScopedTasks([hidden,mine],[hidden],luiz));assert.throws(()=>mergeScopedTasks([mine],[{...mine,status:'aprovação fibroplast'}],luiz));
assert.throws(()=>mergeScopedTasks([mine],[{...mine,status:'aprovado ✅',assignees:[]}],luiz));
assert.throws(()=>mergeScopedTasks([mine],[mine],{role:'visualizador',persona:'luiz'}));assert.throws(()=>mergeScopedTasks([mine],[mine],{role:'editor',persona:''}));
const launch=mergeScopedTasks([], [task('new','a fazer luiz')],mateus)[0];assert.deepEqual(launch.assignees,['Luiz']);assert(canSeeTask(launch,luiz));
for(const status of ['aprovado ✅','stand-by ⛔','concluidos e postados']){const moved=mergeScopedTasks([launch],[{...launch,status}],lucio)[0];assert.equal(moved.status,status);assert(canSeeTask(moved,luiz));assert(!canSeeTask(moved,farias));}
assert.equal(areaStatuses('luiz').length,10);assert.equal(areaStatuses('farias').length,9);assert.equal(areaStatuses('aprovacoes').length,12);
console.log('PASS: áreas, todas as colunas, 4 etapas compartilhadas, múltiplos responsáveis, lançamentos, aprovações, postagens, isolamento e preservação de tarefas ocultas.');
