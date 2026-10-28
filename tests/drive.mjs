import assert from 'node:assert/strict';
import {validAttachmentMetadata} from '../app/attachment-validation.ts';
import {exportAttachment,localAttachment,validId,driveError,chooseDriveFolder,authorizeDrive,getDriveToken} from '../app/drive-client.ts';
import {driveConfig,driveFolders} from '../app/drive-config.ts';

const originalFetch=globalThis.fetch;
const originalWindow=globalThis.window;
const attachment={name:'arte.png',url:'/api/files/12345678-1234-1234-1234-123456789abc',type:'image/png'};
const folder={id:'folder_selected_123',name:'ARTES FINALIZADAS'},fileId='generated_file_123';
const response=(body,status=200,headers={})=>new Response(JSON.stringify(body),{status,headers:{'Content-Type':'application/json',...headers}});
assert.equal(driveConfig.enabled,false,'Hosted Sites must not enable the external OAuth integration');
assert.equal(Object.keys(driveFolders).length,9);
assert(localAttachment(attachment));assert(!localAttachment({...attachment,url:'https://third-party.test/file.png'}));
assert(!localAttachment({...attachment,url:'//third-party.test/api/files/12345678-1234-1234-1234-123456789abc'}));
assert(!validId('../private'));assert(validId(fileId));
assert.match(driveError(401),/expirou/);assert.match(driveError(403),/permissão/);assert.match(driveError(429),/Aguarde/);
assert(validAttachmentMetadata(attachment));assert(!validAttachmentMetadata(null));assert(!validAttachmentMetadata({...attachment,artworkKind:'arbitrary'}));assert(!validAttachmentMetadata({...attachment,drive:{fileId:'../x'}}));
let calls=[];
function mockUpload({lost=false,uploadStatus=200}={}){
  calls=[];
  globalThis.fetch=async(url,init={})=>{
    calls.push({url,init});
    if(url===attachment.url)return new Response(new Uint8Array([1,2,3]),{headers:{'Content-Type':'image/png'}});
    assert.equal(init.headers.Authorization,'Bearer transient-token');
    assert(!url.includes(driveConfig.apiKey),'The browser API key is not used as Drive authorization');
    if(url.includes('generateIds'))return response({ids:[fileId]});
    if(url.includes('uploadType=resumable'))return response({},200,{Location:'https://www.googleapis.com/upload/drive/v3/files?upload_id=session'});
    if(url.includes('upload_id=')){if(lost)throw Error('connection lost');return response({id:fileId,size:3,parents:[folder.id]},uploadStatus)}
    if(url.includes('/files/'+fileId))return response({id:fileId,size:'3',parents:[folder.id]});
    assert.fail('Unexpected request '+url);
  };
}
try{
  globalThis.fetch=async()=>assert.fail('Invalid inputs must not make network requests');
  let pickerCallback,selection={action:'cancel'},parent,disposed=0;
  class DocsView{setIncludeFolders(){return this}setSelectFolderEnabled(){return this}setParent(id){parent=id;return this}}
  class PickerBuilder{
    addView(){return this}setOAuthToken(){return this}setDeveloperKey(){return this}setAppId(){return this}setOrigin(){return this}setLocale(){return this}setTitle(){return this}
    setCallback(callback){pickerCallback=callback;return this}
    build(){return {setVisible(){queueMicrotask(()=>pickerCallback(selection))},dispose(){disposed++}}}
  }
  globalThis.window={dispatchEvent(){},location:{origin:'https://zikofarias.github.io'},google:{picker:{DocsView,PickerBuilder,ViewId:{FOLDERS:'folders'},Action:{CANCEL:'cancel',PICKED:'picked'}}}};
  assert.equal(await chooseDriveFolder('token','fibroplast','reference'),null);
  assert.equal(parent,undefined,'Do not trap the picker inside an empty destination folder');
  selection={action:'picked',docs:[{id:'chosen_folder_first',name:'Primeira',mimeType:'application/vnd.google-apps.folder'}]};
  assert.equal((await chooseDriveFolder('token','fibroplast','final')).id,'chosen_folder_first');
  assert.equal(parent,undefined);
  selection={action:'picked',docs:[{id:'chosen_folder_second',name:'Outra',mimeType:'application/vnd.google-apps.folder'}]};
  assert.equal((await chooseDriveFolder('token','concreto','reference')).id,'chosen_folder_second');
  assert.equal(disposed,3,'Release the picker after cancellation and every selection');
  const now=Date.now;
  globalThis.window.google.accounts={oauth2:{hasGrantedAllScopes:()=>true,initTokenClient(config){assert.equal(config.scope,'https://www.googleapis.com/auth/drive');return {requestAccessToken(){config.callback({access_token:'transient-token',expires_in:3600})}}}}};
  await authorizeDrive();assert.equal(getDriveToken(),'transient-token');
  try{Date.now=()=>now()+3600000;assert.equal(getDriveToken(),'','Expired tokens cannot start automatic backups')}finally{Date.now=now}
  await authorizeDrive();assert.equal(getDriveToken(),'transient-token');
  await assert.rejects(()=>exportAttachment({...attachment,url:'https://example.test/x'},'token',folder,'reference',()=>{}),/Links externos/);
  await assert.rejects(()=>exportAttachment(attachment,'token',{id:'../x'},'reference',()=>{}),/Pasta inválida/);
  mockUpload();const progress=[];
  const saved=await exportAttachment(attachment,'transient-token',folder,'final',text=>progress.push(text));
  assert(validAttachmentMetadata({...attachment,artworkKind:'final',drive:saved}));assert.equal(saved.fileId,fileId);assert.equal(saved.folderId,folder.id);assert.equal(calls.length,4);
  const metadata=JSON.parse(calls[2].init.body);
  assert.deepEqual(metadata.parents,[folder.id]);assert.equal(metadata.appProperties.artworkKind,'final');
  assert.equal(metadata.id,fileId);assert(!('permissions' in metadata));
  assert.deepEqual([...new Uint8Array(await calls[3].init.body.arrayBuffer())],[1,2,3]);
  assert.equal(calls[3].init.method,'PUT');assert.equal(progress.at(-1),'Enviando ao Drive…');
  mockUpload({lost:true});const recovered=await exportAttachment(attachment,'transient-token',folder,'reference',()=>{});
  assert.equal(recovered.fileId,fileId);assert.equal(calls.filter(c=>c.init.method==='POST').length,1);
  assert.equal(calls.filter(c=>c.init.method==='PUT').length,1,'Never replay an uncertain write automatically');
  globalThis.fetch=async()=>new Response('Acesso recusado',{status:403});
  await assert.rejects(()=>exportAttachment(attachment,'token',folder,'reference',()=>{}),/acesso ao cartão/);
  globalThis.fetch=async()=>new Response('<html>Entrar</html>',{headers:{'Content-Type':'text/html'}});
  await assert.rejects(()=>exportAttachment(attachment,'token',folder,'reference',()=>{}),/sessão do site expirou/);
  globalThis.fetch=async url=>url===attachment.url?new Response(new Uint8Array([1])):new Response('<html>login</html>');
  await assert.rejects(()=>exportAttachment(attachment,'token',folder,'reference',()=>{}),/resposta inválida/);
  globalThis.fetch=async url=>url===attachment.url?new Response(new Uint8Array([1])):response({},401);
  await assert.rejects(()=>exportAttachment(attachment,'transient-token',folder,'reference',()=>{}),/expirou/);assert.equal(getDriveToken(),'','A revoked token requires explicit reconnection');
  mockUpload();const baseFetch=globalThis.fetch;
  globalThis.fetch=async(url,init)=>url.includes('uploadType=resumable')?response({},403):baseFetch(url,init);
  await assert.rejects(()=>exportAttachment(attachment,'transient-token',folder,'reference',()=>{}),/Google recusou/);
  mockUpload();const base=globalThis.fetch;
  globalThis.fetch=async(url,init)=>url.includes('upload_id=')?Promise.reject(Error('network')):url.includes('/files/'+fileId)?response({},404):base(url,init);
  await assert.rejects(()=>exportAttachment(attachment,'transient-token',folder,'final',()=>{}),/Confira a pasta/);
  assert.equal(calls.filter(c=>c.init.method==='POST').length,1);
  console.log('PASS: Drive input boundaries, 9 company suggestions, explicit destination and classification, exact bytes, limited transient authorization, lost response reconciliation, denied access, HTML response and uncertain upload without automatic replay.');
}finally{globalThis.fetch=originalFetch;if(originalWindow===undefined)delete globalThis.window;else globalThis.window=originalWindow}
