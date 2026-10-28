import assert from 'node:assert/strict';
import {canApplyBoardUpdate as accept} from '../app/board-sync';
assert(accept(4,5,true,false));assert(accept(5,5,true,false));assert(!accept(5,4,true,false));assert(!accept(5,6,false,false));assert(!accept(5,6,true,true));assert(!accept(5,NaN,true,false));assert(!accept(5,5.1,true,false));console.log('PASS: automatic synchronization accepts fresh revisions and rejects stale reads, edits and in-flight save races.');
