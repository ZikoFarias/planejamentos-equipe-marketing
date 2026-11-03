'use client';
import type {ReactNode} from 'react';
import {createPortal} from 'react-dom';
import {useEffect,useRef} from 'react';
import {X} from 'lucide-react';
import type {Attachment} from './model';
import {AttachmentContent} from './attachment-preview';
export function ImageViewer({attachment,onClose,actions}:{attachment:Attachment,onClose:()=>void,actions?:ReactNode}){const ref=useRef<HTMLDialogElement>(null);useEffect(()=>{const previous=document.activeElement as HTMLElement;ref.current?.showModal();return()=>{ref.current?.close();previous?.focus()}},[]);return createPortal(<dialog ref={ref} className="image-viewer" aria-label={'Imagem em tela cheia: '+attachment.name} onClick={e=>{e.stopPropagation();if(e.target===e.currentTarget)onClose()}} onPointerDown={e=>e.stopPropagation()} onCancel={e=>{e.preventDefault();e.stopPropagation();onClose()}}><div className="image-viewer-top"><span>{attachment.name}</span><div className="image-viewer-actions">{actions}<button type="button" className="icon" aria-label="Fechar imagem" onClick={onClose} autoFocus><X size={24}/></button></div></div><div className="image-viewer-content"><AttachmentContent attachment={attachment}/></div></dialog>,document.body)}
