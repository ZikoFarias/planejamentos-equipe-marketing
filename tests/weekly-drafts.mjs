import assert from 'node:assert/strict';
import {weeklyPlan} from '../app/weekly-plan.ts';
import {isWeeklyDraft} from '../app/weekly-drafts.ts';
import {inArea,canManageTask} from '../app/permissions.ts';
import {recordActivity} from '../app/activity.ts';
import {personalEvents,dailySummary} from '../app/personal-notifications.ts';
for(const {task} of weeklyPlan([],'2026-11-09','all')){
 const raw={...task,history:[{text:'Tarefa semanal criada manualmente pelo painel de Lançamentos',by:'Mateus',at:'2026-11-04T12:00:00Z'}]};
 assert(isWeeklyDraft(raw));assert(inArea(raw,'aprovacoes'));assert(inArea(raw,'geral'));
 for(const area of ['farias','luiz','compras','laura'])assert(!inArea(raw,area));
 assert(canManageTask(raw,{role:'editor',persona:raw.status.endsWith('luiz')?'luiz':'farias'}));
 assert.deepEqual(personalEvents(null,raw),[]);assert.equal(dailySummary(raw.status.endsWith('luiz')?'luiz':'farias',[raw],'2026-11-04').targets.length,0);
 assert(isWeeklyDraft({...raw}),'opening without saving keeps the draft hidden');
 for(const patch of [{description:'Briefing completo'},{due:'2026-12-01'},{attachments:[{name:'ref.png',url:'https://example.com/ref.png'}]},{comments:[{text:'Preparar esta arte',by:'Lucio',at:'now'}]},{checklist:[{id:'1',title:'Revisar',done:false}]},{title:'Campanha'}]){
 const edited=recordActivity(raw,{...raw,...patch},'Lucio');assert(!isWeeklyDraft(edited));assert(inArea(edited,raw.status.endsWith('luiz')?'luiz':'farias'));assert(personalEvents(raw,edited).some(e=>e.kind==='assigned'));
 }
 const restored=recordActivity(raw,{...raw,description:'Briefing'},'Lucio');assert(!isWeeklyDraft({...restored,description:raw.description}),'an edited card stays released even if its text is restored');
 assert(!isWeeklyDraft({...raw,id:'manual'}));
}
console.log('PASS: weekly placeholders hidden until actual changes, calendar predicate, permissions, notifications and existing batches.');