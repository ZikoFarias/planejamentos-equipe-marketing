'use client';
import {useEffect,useState} from 'react';
import type {Attachment} from './model';
import {getDriveToken,readDriveImage} from './drive-client';
import {previewKind} from './media';
export function DrivePreview({attachment,compact=false}:{attachment:Attachment,compact?:boolean}){
 const [url,setUrl]=useState(''),[error,setError]=useState(''),[version,setVersion]=useState(0),[requested,setRequested]=useState(false);
 const image=previewKind(attachment)==='image',large=(attachment.size||0)>10*1024*1024;
 useEffect(()=>{const refresh=()=>setVersion(v=>v+1);window.addEventListener('marketing-drive-auth',refresh);return()=>window.removeEventListener('marketing-drive-auth',refresh)},[]);
 useEffect(()=>{setUrl('');setError('');if(!image||large&&!requested)return;const token=getDriveToken();if(!token)return;const controller=new AbortController();let objectUrl='';
  readDriveImage(attachment,token,controller.signal).then(blob=>{if(!controller.signal.aborted){objectUrl=URL.createObjectURL(blob);setUrl(objectUrl)}}).catch(e=>{if(!controller.signal.aborted)setError(e.message)});
  return()=>{controller.abort();if(objectUrl)URL.revokeObjectURL(objectUrl)};
 },[attachment.url,version,requested]);
 if(image&&url)return <img className={compact?'cover-image':'attachment-image'} src={url} alt={attachment.name}/>;
 if(!compact&&!image&&attachment.drive)return <iframe loading="lazy" className="attachment-pdf" title={'Prévia de '+attachment.name} src={'https://drive.google.com/file/d/'+attachment.drive.fileId+'/preview'} allow="fullscreen"/>;
 return <div className="file-placeholder"><strong>{image?'Imagem no Drive':'Arquivo no Drive'}</strong><small>{error||(!getDriveToken()?'Conecte o Drive no topo para ver a imagem.':large&&!requested?'Imagem maior que 10 MB.':image?'Carregando imagem…':'Abra o anexo para visualizar.')}</small>{!compact&&image&&large&&!requested&&<button onClick={event=>{event.stopPropagation();setRequested(true)}}>Carregar imagem</button>}{!compact&&error&&<button onClick={event=>{event.stopPropagation();setVersion(v=>v+1)}}>Tentar novamente</button>}</div>;
}
