import assert from 'node:assert/strict';
import {linkedTaskId,taskLink,loginDestination} from '../app/task-link';
const id='8786fd5b-5df1-414d-89ec-5b7599a285f3';
assert.equal(taskLink('https://board.test',id),'https://board.test/?card='+id);
assert.equal(linkedTaskId('?card='+id),id);assert.equal(loginDestination('?card='+id),'/?card='+id);
for(const query of ['','?card=https://evil.test','?card=../../admin','?card=<script>','?card='+('a'.repeat(101))]){assert.equal(linkedTaskId(query),'');assert.equal(loginDestination(query),'/')}
console.log('PASS: direct card links survive login, unknown query ignored and external/path/script destinations rejected.');
