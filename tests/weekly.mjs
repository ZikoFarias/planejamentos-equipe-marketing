import assert from 'node:assert/strict';
import {weeklyPlan,canLaunchWeekly,validDate} from '../app/weekly-plan.ts';
import {compareLabels,companies} from '../app/workflow.ts';
import {normalizeHex} from '../app/color-values.ts';
const all=weeklyPlan([],'2026-10-20','all');assert.equal(all.length,25);assert.deepEqual(Array.from({length:7},(_,i)=>all.filter(p=>p.day===i).length),[3,4,5,1,7,3,2]);
for(const p of all){assert.equal(p.task.title,'DESIGN PARA REDE-SOCIAIS');assert.equal(p.task.due,p.task.start);assert(p.task.assignees.includes('Lucio Alves Xavier'));assert(p.task.assignees.includes('Mateus'));assert.equal(p.task.status,p.task.assignees[0]==='Luiz'?'a fazer luiz':'a fazer farias')}
assert.equal(weeklyPlan(all.map(p=>({...p.task,status:'concluidos e postados'})),'2026-10-20','all').filter(p=>!p.existing).length,0);
const manual={...all[0].task,id:'manual'};assert(weeklyPlan([manual],'2026-10-20','0')[0].existing);assert.equal(weeklyPlan([],'2026-10-20','3').length,1);
assert(!canLaunchWeekly('visualizador','mateus'));assert(!canLaunchWeekly('editor','luiz'));assert(canLaunchWeekly('editor','lucio'));assert(canLaunchWeekly('editor','mateus'));assert(canLaunchWeekly('administrador',''));
assert(validDate('2028-02-29'));assert(!validDate('2026-02-29'));assert.equal(normalizeHex('abc'),'#aabbcc');assert.equal(normalizeHex('#A0B1C2'),'#a0b1c2');assert.equal(normalizeHex('invalid'),'');assert.deepEqual([...companies.map(c=>c.id)].sort(compareLabels),['luke group','fibroplast','posto-ps','posto-rv','posto-brr','ervateira','materiais-ps','materiais-smo','concreto']);
console.log('PASS: grade manual de 25, ambas unidades, responsáveis, dias, deduplicação em qualquer status, ordem das etiquetas, cores HEX e permissões.');
