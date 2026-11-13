'use client';
import {useEffect,useRef,useState} from 'react';
import type {Attachment} from './model';
import {previewUrl} from './media';
const cache=new Map<string,string>();
export function PdfThumbnail({attachment}:{attachment:Attachment}){
 const url=attachment.drive?.central?'/api/drive/central/media?id='+encodeURIComponent(attachment.drive.fileId):previewUrl(attachment),container=useRef<HTMLSpanElement>(null),[image,setImage]=useState(''),[failed,setFailed]=useState(false);
 useEffect(()=>{setImage('');setFailed(false);const controller=new AbortController();let started=false;async function load(){if(started)return;started=true;if(cache.has(url)){setImage(cache.get(url)!);return}try{const moduleUrl='/pdf-renderer.mjs';const {firstPdfPage}=await import(/* @vite-ignore */ moduleUrl);const data=await firstPdfPage(url,controller.signal);if(controller.signal.aborted)return;if(cache.size>=20)cache.delete(cache.keys().next().value!);cache.set(url,data);setImage(data)}catch{if(!controller.signal.aborted)setFailed(true)}}const observer=typeof IntersectionObserver==='undefined'?undefined:new IntersectionObserver(entries=>{if(entries.some(e=>e.isIntersecting)){observer?.disconnect();void load()}},{rootMargin:'100px'});if(observer&&container.current)observer.observe(container.current);else void load();return()=>{controller.abort();observer?.disconnect()}},[url]);
 return <span ref={container} className="pdf-tile-preview pdf-page-thumbnail">{image&&<img src={image} alt={'Primeira página de '+attachment.name}/>}<span className="pdf-thumbnail-type">PDF</span>{!image&&<span className="sr-only">{failed?'Prévia indisponível. Abra o PDF para visualizar.':'Carregando prévia…'}</span>}</span>
}
