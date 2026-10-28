'use client';
import {DrivePreview} from './drive-preview';
import {driveAttachment} from './drive-client';
import {useEffect,useState} from 'react';
import type {Attachment} from './model';
import {previewKind,previewUrl,sizeLabel} from './media';
export function AttachmentPreview({attachment,compact=false}:{attachment:Attachment,compact?:boolean}){const [failed,setFailed]=useState(false);useEffect(()=>setFailed(false),[attachment.url]);const kind=previewKind(attachment),url=previewUrl(attachment);if(driveAttachment(attachment))return <DrivePreview attachment={attachment} compact={compact}/>;if(!url||failed||kind==='file')return <div className="file-placeholder"><span>{attachment.name.split('.').at(-1)?.toUpperCase()||'ARQUIVO'}</span><small>{kind==='file'?'Baixe para visualizar':'Prévia indisponível'} {sizeLabel(attachment.size)}</small></div>;if(kind==='image')return <img className={compact?'cover-image':'attachment-image'} loading="lazy" src={url} alt={attachment.name} onError={()=>setFailed(true)}/>;if(kind==='video')return <video className="attachment-video" controls preload="metadata" src={url} onError={()=>setFailed(true)}/>;return <iframe className="attachment-pdf" src={url} title={'Prévia de '+attachment.name}/>}
