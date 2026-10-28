import assert from 'node:assert/strict';
import {uploadDriveFile,readDriveImage,driveAttachment} from '../app/drive-client';
import {uploadDirectDriveBatch} from '../app/drive-upload';
import {validAttachmentMetadata} from '../app/attachment-validation';
const originalFetch=globalThis.fetch,folder={id:'folder_selected_123',name:'Referências'},id='file_generated_123',calls=[];
const file=new File([new Uint8Array([1,2,3])],'arte.png',{type:'image/png'}),signal=new AbortController().signal;
const json=(data,status=200,headers={})=>Response.json(data,{status,headers});
try{
 globalThis.fetch=async(url,init)=>{calls.push({url,init});assert(!url.startsWith('/api/files'),'Direct uploads never call paid/intermediate file storage');if(url.includes('generateIds'))return json({ids:[id]});if(url.includes('uploadType=resumable'))return json({},200,{Location:'https://www.googleapis.com/upload/drive/v3/files?upload_id=test'});if(url.includes('upload_id=')){assert.deepEqual([...new Uint8Array(await init.body.arrayBuffer())],[1,2,3]);return json({id})}assert.fail(url)};
 const a=await uploadDriveFile(file,'transient-token',folder,'final',()=>{},signal);assert(validAttachmentMetadata(a));assert(driveAttachment(a));assert.equal(a.url,a.drive.url);assert.equal(a.artworkKind,'final');assert.equal(a.size,3);assert.equal(calls.length,3);assert.deepEqual(JSON.parse(calls[1].init.body).parents,[folder.id]);assert(!('permissions' in JSON.parse(calls[1].init.body)));
 const controller=new AbortController();controller.abort();await assert.rejects(()=>uploadDriveFile(file,'token',folder,'reference',()=>{},controller.signal),{name:'AbortError'});
 await assert.rejects(()=>uploadDriveFile(new File([],'empty.png'),'token',folder,'reference',()=>{},signal),/entre 1 byte/);
 const options={token:'token',folder,kind:'reference',signal,onAttachment:()=>{},onProgress:()=>{}};const attached=[];
 const result=await uploadDirectDriveBatch([file,new File(['ok'],'good.png')],{...options,onAttachment:a=>attached.push(a)},async f=>{if(f.name==='arte.png')throw Error('Não confirmado. Confira a pasta.');return {...a,name:f.name}});assert.equal(result.uploaded,1);assert.equal(result.errors.length,1);assert.equal(attached.length,1);assert.equal(attached[0].name,'good.png');
 globalThis.fetch=async(url,init)=>{assert.equal(url,'https://www.googleapis.com/drive/v3/files/'+id+'?alt=media&supportsAllDrives=true');assert.equal(init.headers.Authorization,'Bearer transient-token');return new Response(new Uint8Array([1,2,3]),{headers:{'Content-Type':'image/png'}})};
 assert.equal((await readDriveImage(a,'transient-token',signal)).size,3);
 await assert.rejects(()=>readDriveImage({...a,url:'https://third-party.test/file'},'secret',signal),/inválido/);
 globalThis.fetch=async()=>new Response('<html>login</html>',{headers:{'Content-Type':'text/html'}});await assert.rejects(()=>readDriveImage(a,'token',signal),/indisponível/);
 console.log('PASS: direct Drive exact bytes, folder/classification, no R2 or sharing changes, cancellation, partial failures, private authenticated previews and arbitrary URL rejection.');
}finally{globalThis.fetch=originalFetch}
