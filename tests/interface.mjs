import assert from 'node:assert/strict';
import {automaticCover,previewKind,mediaType,coverFor,MAX_FILE_SIZE,PART_SIZE} from '../app/media.ts';
assert.equal(MAX_FILE_SIZE,100*1024*1024);assert.equal(PART_SIZE,8*1024*1024);assert.equal(previewKind({name:'foto.jpg'}),'image');assert.equal(previewKind({name:'video.mp4'}),'video');assert.equal(previewKind({name:'briefing.pdf'}),'pdf');assert.equal(previewKind({name:'projeto.psd'}),'file');assert.equal(previewKind({name:'vetor.svg',type:'image/svg+xml'}),'file');
const a={name:'capa.jpg',url:'/api/files/id'},b={name:'outra.png',url:'/api/files/id2'};assert.equal(coverFor({attachments:[a,b],coverUrl:b.url}),b);assert.equal(coverFor({attachments:[a,b]}),undefined);assert.equal(coverFor({attachments:[a],coverUrl:b.url}),undefined);
console.log('PASS: Limite 100 MB, prévias por formato e seleção da imagem de capa.');

const reference={name:'ref.png',url:'ref',artworkKind:'reference'},final={name:'final.png',url:'final',artworkKind:'final'};assert.equal(automaticCover([reference]),'ref');assert.equal(automaticCover([reference,final]),'final');assert.equal(automaticCover([final,reference]),'final');assert.equal(automaticCover([{name:'doc.pdf',url:'pdf'}]),undefined);
