'use client';
import {createPortal} from 'react-dom';
import {useEffect,useRef,useState} from 'react';
import {X,ChevronLeft,ChevronRight} from 'lucide-react';
import type {Attachment} from './model';
import {AttachmentContent} from './attachment-preview';
import {useImageActions} from './attachment-options';
export function ImageViewer({attachment,onClose}:{attachment:Attachment,onClose:()=>void}){
 const ref=useRef<HTMLDialogElement>(null),[selected,setSelected]=useState(attachment.url),gallery=useImageActions(attachment).images;
 const current=gallery.find(a=>a.url===selected)||gallery.find(a=>a.url===attachment.url)||gallery[0]||attachment,index=gallery.findIndex(a=>a.url===current.url),actions=useImageActions(current).options;
 function move(direction:number){if(gallery.length>1)setSelected(gallery[(index+direction+gallery.length)%gallery.length].url)}
 useEffect(()=>{const previous=document.activeElement as HTMLElement;ref.current?.showModal();return()=>{ref.current?.close();previous?.focus()}},[]);
 return createPortal(<dialog ref={ref} className="image-viewer" aria-label={'Imagem em tela cheia: '+current.name} onClick={e=>{e.stopPropagation();if(e.target===e.currentTarget)onClose()}} onPointerDown={e=>e.stopPropagation()} onKeyDown={e=>{if((e.target as HTMLElement).closest('input,textarea,select,[contenteditable=true],.attachment-options'))return;if(e.key==='ArrowLeft'||e.key==='ArrowRight'){e.preventDefault();e.stopPropagation();move(e.key==='ArrowLeft'?-1:1)}}} onCancel={e=>{e.preventDefault();e.stopPropagation();onClose()}}>
 <div className="image-viewer-top"><div className="image-viewer-caption"><span>{current.name}</span>{gallery.length>1&&<small aria-live="polite" aria-label={'Imagem '+(index+1)+' de '+gallery.length}>{index+1} / {gallery.length}</small>}</div><div className="image-viewer-actions">{actions}<button type="button" className="icon" aria-label="Fechar imagem" onClick={onClose} autoFocus><X size={24}/></button></div></div>
 <div className="image-viewer-content">{gallery.length>1&&<button type="button" className="image-viewer-prev" aria-label="Imagem anterior" onClick={()=>move(-1)}><ChevronLeft size={28}/></button>}<AttachmentContent key={current.url} attachment={current}/>{gallery.length>1&&<button type="button" className="image-viewer-next" aria-label="Próxima imagem" onClick={()=>move(1)}><ChevronRight size={28}/></button>}</div>
 </dialog>,document.body);
}
