import assert from 'node:assert/strict';
import {fitProfilePhoto,MAX_PROFILE_UPLOAD,compressProfilePhoto} from '../app/profile-photo-compression';
let calls=[];const small=await fitProfilePhoto(8000,4000,async(w,h,q)=>{calls.push([w,h,q]);return new Blob(['photo'])});assert.equal(small.size,5);assert.deepEqual(calls[0].slice(0,2),[1600,800]);
calls=[];await fitProfilePhoto(400,800,async(w,h,q)=>{calls.push([w,h,q]);return new Blob(['small'])});assert.deepEqual(calls[0].slice(0,2),[400,800]);
let count=0;const over=new Blob([new Uint8Array(MAX_PROFILE_UPLOAD+1)]);await fitProfilePhoto(2000,2000,async()=>++count<3?over:new Blob(['ok']));assert.equal(count,3);
await assert.rejects(()=>fitProfilePhoto(1600,1600,async()=>over),/10 MB/);await assert.rejects(()=>fitProfilePhoto(0,500,async()=>new Blob(['x'])),/dimensões/);
await assert.rejects(()=>compressProfilePhoto({size:101*1024*1024,type:'image/jpeg'}),/100 MB/);await assert.rejects(()=>compressProfilePhoto({size:200,type:'image/svg+xml'}),/PNG/);
console.log('PASS: proportional 1600px profile compression, no upscaling, iterative size bound, unsupported source and oversized input rejected.');
