import assert from 'node:assert/strict';
import {boundedPush,restoreEdit} from '../app/edit-history';
import {blank} from '../app/model';
const a={...blank('a fazer farias'),id:'a',title:'TESTE',assignees:['Farias']},b={...a,status:'em andamento farias'},unrelated={...blank(),id:'other'};
assert.equal(restoreEdit([b,unrelated],{before:[a],after:[b]})[0].status,a.status);assert.equal(restoreEdit([a],{before:[a],after:[b]},true)[0].status,b.status);
const concurrent={...b,description:'Outra pessoa comentou'};assert.equal(restoreEdit([concurrent],{before:[a],after:[b]})[0].description,concurrent.description);assert.throws(()=>restoreEdit([{...b,status:'ajustar ⚠️'}],{before:[a],after:[b]}),/Outra pessoa/);assert.throws(()=>restoreEdit([],{before:[a],after:[b]}),/removido/);
let undo=[];for(let i=0;i<15;i++)undo=boundedPush(undo,i);assert.equal(undo.length,10);assert.equal(undo[0],5);const currentApproval={...b,approval:{round:2,votes:{lucio:{decision:'approved',by:'lucio',at:'2026-10-28'}}}};assert.deepEqual(restoreEdit([currentApproval],{before:[a],after:[b]})[0].approval,currentApproval.approval);console.log('PASS: ten-action cap, movement undo/redo, unrelated concurrent edits retained, conflicting fields/deleted tasks rejected and approval votes preserved.');
