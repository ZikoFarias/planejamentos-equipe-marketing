import assert from 'node:assert/strict';
import {weekDates} from '../app/week.ts';
import {ink,validAppearance,labelStyle} from '../app/appearance.ts';
assert.deepEqual(weekDates('2026-10-25'),['2026-10-19','2026-10-20','2026-10-21','2026-10-22','2026-10-23','2026-10-24','2026-10-25']);
assert.equal(weekDates('2026-10-19',1)[0],'2026-10-26');assert.equal(weekDates('2026-01-01')[0],'2025-12-29');assert.equal(weekDates('2026-01-01',-1)[0],'2025-12-22');
assert.equal(ink('#ffea00'),'#071725');assert.equal(ink('#001489'),'#ffffff');assert.equal(labelStyle('materiais').background,'#f76808');
assert(validAppearance({background:'',colors:{'a fazer':'#123abc'}}));assert(!validAppearance({background:'javascript:evil',colors:{}}));
console.log('PASS: semanas de segunda a domingo, virada de ano, navegação semanal, contraste e cores das etiquetas.');
