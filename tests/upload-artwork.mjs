import assert from 'node:assert/strict';
import {uploadArtworkBatch} from '../app/upload-artwork.ts';
import {validAttachmentMetadata} from '../app/attachment-validation.ts';

const files=[new File(['art-one'],'one.png',{type:'image/png'}),new File(['art-two'],'two.png',{type:'image/png'})];
const backup={token:'session-token',folder:{id:'folder_chosen_123',name:'ARTES FINALIZADAS'}};
const controller=new AbortController();
let events=[],updates=[];
const options={kind:'final',backup,signal:controller.signal,onAttachment:a=>{assert(validAttachmentMetadata(a));updates.push(a);events.push('state:'+a.name+':'+(a.drive?'confirmed':a.backup?.status||'local'))},onProgress:()=>{}};
const local=name=>({name,url:'/api/files/'+(name==='one.png'?'11111111':'22222222')+'-1234-1234-1234-123456789abc',type:'image/png'});
const transport={
  async upload(file){events.push('upload:'+file.name);return local(file.name)},
  async backup(a,token,folder,kind){assert.equal(token,backup.token);assert.equal(folder.id,backup.folder.id);assert.equal(kind,'final');assert.equal(a.artworkKind,'final');events.push('backup:'+a.name);return {fileId:'saved_file_'+a.name.replace('.','_'),folderId:folder.id,folderName:folder.name,url:'https://drive.google.com/file/d/saved_file_'+a.name.replace('.','_')+'/view',savedAt:'2026-10-21T12:00:00Z'}}
};
const completed=await uploadArtworkBatch(files,options,transport);
assert.deepEqual(completed,{uploaded:2,backedUp:2,failedBackups:0});
assert.deepEqual(events,['upload:one.png','state:one.png:pending','backup:one.png','state:one.png:confirmed','upload:two.png','state:two.png:pending','backup:two.png','state:two.png:confirmed']);
assert.equal(updates.at(-1).backup,undefined);
events=[];updates=[];
const partial=await uploadArtworkBatch(files,options,{...transport,backup:async(...args)=>{if(args[0].name==='one.png')throw Error('Drive unavailable');return transport.backup(...args)}});
assert.deepEqual(partial,{uploaded:2,backedUp:1,failedBackups:1});
const failed=updates.find(a=>a.backup?.status==='failed');assert.equal(failed.name,'one.png');assert.equal(failed.backup.message,'Drive unavailable');assert.equal(failed.drive,undefined);
assert(updates.some(a=>a.name==='two.png'&&a.drive),'Failure of one backup must not lose the next selected file');
updates=[];await assert.rejects(()=>uploadArtworkBatch(files,options,{...transport,upload:async()=>{throw Error('Local upload failed')},backup:async()=>assert.fail('Never backup a failed local upload')}),/Local upload failed/);assert.equal(updates.length,0);
const aborted=new AbortController();aborted.abort();
await assert.rejects(()=>uploadArtworkBatch(files,{...options,signal:aborted.signal},{upload:async()=>assert.fail('No writes after cancellation'),backup:transport.backup}),{name:'AbortError'});
await assert.rejects(()=>uploadArtworkBatch([new File([],'empty.png')],options,transport),/entre 1 byte/);
assert(!validAttachmentMetadata({...local('one.png'),backup:{status:'confirmed'}}),'Only a real Drive result may indicate success');
const noDrive=await uploadArtworkBatch(files,{...options,backup:undefined},{...transport,backup:async()=>assert.fail('No Google writes when external integration is disabled')});
assert.deepEqual(noDrive,{uploaded:2,backedUp:0,failedBackups:0});
console.log('PASS: immediate backup after each upload, pending then confirmed status, exact selected folder and artwork kind, partial failure preserves files and continues, local failure never copies, cancellation, empty files and disabled-hosting boundary.');
