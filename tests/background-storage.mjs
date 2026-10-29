import assert from 'node:assert/strict';
import {storeCentralBackground} from '../server/drive-central-storage';
import {protectCentralToken} from '../server/drive-central-auth';
const key=btoa('b'.repeat(32)),cipher=await protectCentralToken('refresh',key),original=globalThis.fetch;let registered=[],created=false,written=0;
const env={GOOGLE_DRIVE_CLIENT_ID:'client',GOOGLE_DRIVE_CLIENT_SECRET:'secret',GOOGLE_DRIVE_ENCRYPTION_KEY:key,DB:{prepare(){return {async first(){return {email:'marketinglukegroup@gmail.com',encrypted_refresh:cipher}},bind(...args){return {async run(){registered.push(args)}}}}}}};
try{globalThis.fetch=async()=>Response.json({access_token:'private-token'});
const transport=async(url,init)=>{assert.equal(init.headers.Authorization,'Bearer private-token');if(url.startsWith('https://www.googleapis.com/drive/v3/files?')&&init.method==='POST'){const body=JSON.parse(init.body);assert.equal(body.name,'Fundos do quadro');created=true;return Response.json({id:'background_folder_123'})}if(url.startsWith('https://www.googleapis.com/drive/v3/files?'))return Response.json({files:[]});if(url.includes('generateIds'))return Response.json({ids:['background_image_123']});if(url.includes('uploadType=resumable'))return new Response('',{headers:{Location:'https://www.googleapis.com/upload/background'}});if(url.endsWith('/upload/background')){for await(const chunk of init.body)written+=chunk.length;return Response.json({id:'background_image_123',size:3,parents:['background_folder_123']})}return Response.json({id:'background_folder_123',name:'Fundos do quadro',mimeType:'application/vnd.google-apps.folder',capabilities:{canAddChildren:true}})};
const input=()=>({env,name:'fundo.png',type:'image/png',size:3,body:new Blob(['abc']).stream(),owner:'farias@example.test'});
const result=await storeCentralBackground(input(),transport);assert(created);assert.equal(written,3);assert.equal(result.url,'/api/background/background_image_123');assert.equal(registered[0][2],'_background');assert.equal(registered[0][1],'farias@example.test');assert(!JSON.stringify(result).includes('private-token'));
await assert.rejects(()=>storeCentralBackground({...input(),type:'image/svg+xml'},transport));await assert.rejects(()=>storeCentralBackground({...input(),size:21*1024*1024},transport));
await assert.rejects(()=>storeCentralBackground({...input(),profile:true,size:11*1024*1024},transport));
let profileAccepted=false;await assert.rejects(()=>storeCentralBackground({...input(),profile:true,size:10*1024*1024},async()=>{profileAccepted=true;throw Error('Boundary reached transport')}),/Boundary reached transport/);assert(profileAccepted,'A 10 MB profile reaches the authorized Drive transport');
console.log('PASS: personal backgrounds use central Drive, confirmed folder and bytes, per-owner registry, image and size limits, no R2 and no browser tokens.');
}finally{globalThis.fetch=original}

