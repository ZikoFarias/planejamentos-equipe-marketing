import assert from 'node:assert/strict';
import {uploadWithProgress} from '../app/upload-transport';
import {uploadCentralBatch} from '../app/drive-central-client';
let request;
class FakeXHR{constructor(){request=this;this.upload={}}open(method,url){this.method=method;this.url=url}setRequestHeader(){}send(file){this.file=file}getResponseHeader(){return 'application/json'}abort(){this.onabort?.()}}
globalThis.XMLHttpRequest=FakeXHR;
const controller=new AbortController(),progress=[],file=new File(['abc'],'arte.png',{type:'image/png'});
const pending=uploadWithProgress('/api/upload',file,controller.signal,p=>progress.push(p));request.upload.onprogress({loaded:3});assert.deepEqual(progress,[100]);let finished=false;pending.then(()=>finished=true);await Promise.resolve();assert(!finished,'sending all bytes is not a Drive confirmation');request.status=200;request.responseText='{"ok":true}';request.onload();assert.equal((await pending).status,200);
const cancel=new AbortController(),aborted=uploadWithProgress('/api/upload',file,cancel.signal,()=>{});cancel.abort();await assert.rejects(aborted,{name:'AbortError'});
let actual;
const batch=uploadCentralBatch([file],{taskId:'task',kind:'final',signal:new AbortController().signal,onProgress:()=>{},onAttachment:(attachment,board)=>{actual={attachment,board}}},async url=>{assert(url.includes('attach=1'));return Response.json({name:file.name,url:'https://drive.google.com/file/d/upload_file_123/view',drive:{central:true},board:{tasks:[],revision:7}})});
assert.equal((await batch).uploaded,1);assert.equal(actual.board.revision,7);assert(!('board'in actual.attachment),'do not persist a complete board recursively in attachment metadata');
delete globalThis.XMLHttpRequest;
console.log('PASS: true browser byte progress, confirmation separated from 100%, cancellation, atomic linking enabled and board metadata kept out of attachments.');
