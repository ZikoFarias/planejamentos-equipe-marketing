'use client';
import {useEffect,useRef,useState} from 'react';
import {createPortal} from 'react-dom';
import {ArrowLeft,Download,FileText,LoaderCircle,Share2,X} from 'lucide-react';
import type {Attachment} from './model';
import {mediaType,previewKind} from './media';
export function isAppleMobile(nav:Pick<Navigator,'userAgent'|'platform'|'maxTouchPoints'>){return /iPhone|iPad|iPod/i.test(nav.userAgent)||nav.platform==='MacIntel'&&nav.maxTouchPoints>1}
export function attachmentDownloadUrl(a:Attachment){return a.drive?.fileId?'/api/drive/central/media?id='+encodeURIComponent(a.drive.fileId)+'&download=1':/^https?:\/\//.test(a.url)||/^\/api\/files\/[a-f0-9-]{36}$/.test(a.url)?a.url:''}
export async function prepareAttachmentDownload(a:Attachment,signal:AbortSignal,fetcher:typeof fetch=fetch){
 const url=attachmentDownloadUrl(a);if(!url)throw Error('Este arquivo não está disponível para baixar.');
 const response=await fetcher(url,{signal,credentials:'same-origin',cache:'no-store'});if(!response.ok)throw Error('Não foi possível preparar o arquivo. Tente novamente.');
 const blob=await response.blob();if(!blob.size)throw Error('O arquivo está vazio. Tente novamente.');
 return new File([blob],a.name,{type:blob.type&&blob.type!=='application/octet-stream'?blob.type:mediaType(a)});
}
function IosDownloadDialog({attachment:a,onClose}:{attachment:Attachment,onClose:()=>void}){
 const dialog=useRef<HTMLDialogElement>(null),[file,setFile]=useState<File|null>(null),[url,setUrl]=useState(''),[error,setError]=useState(''),[retry,setRetry]=useState(0),[sharing,setSharing]=useState(false);
 useEffect(()=>{const before=document.activeElement as HTMLElement;dialog.current?.showModal();return()=>{dialog.current?.close();before?.focus()}},[]);
 useEffect(()=>{let alive=true;const controller=new AbortController();setFile(null);setError('');prepareAttachmentDownload(a,controller.signal).then(file=>{if(alive)setFile(file)}).catch(error=>{if(alive&&!controller.signal.aborted)setError(error instanceof Error?error.message:'Não foi possível preparar o arquivo.')});return()=>{alive=false;controller.abort()}},[a.url,a.drive?.fileId,a.name,retry]);
 useEffect(()=>{if(!file){setUrl('');return}const objectUrl=URL.createObjectURL(file);setUrl(objectUrl);return()=>URL.revokeObjectURL(objectUrl)},[file]);
 let canShare=false;try{canShare=!!file&&typeof navigator.share==='function'&&!!navigator.canShare?.({files:[file]})}catch{}
 async function save(){if(!file||sharing)return;setSharing(true);setError('');try{await navigator.share({files:[file],title:a.name});onClose()}catch(error){if(!(error instanceof Error&&error.name==='AbortError'))setError('Não foi possível abrir o menu de salvar. Tente novamente.')}finally{setSharing(false)}}
 const image=previewKind(a)==='image';
 return createPortal(<dialog ref={dialog} className="ios-download-dialog" aria-label="Baixar arquivo" onCancel={e=>{e.preventDefault();e.stopPropagation();onClose()}} onPointerDown={e=>e.stopPropagation()} onClick={e=>{e.stopPropagation();if(e.target===e.currentTarget)onClose()}}>
 <header className="ios-download-header"><button type="button" onClick={onClose} autoFocus><ArrowLeft size={18}/>Voltar</button><button type="button" aria-label="Fechar download" onClick={onClose}><X size={21}/></button></header>
 <div className="ios-download-body"><strong>{a.name}</strong>{!file&&!error&&<p role="status"><LoaderCircle className="ios-download-spinner" size={22}/>Preparando arquivo…</p>}
 {url&&(image?<img src={url} alt={a.name}/>:<div className="ios-download-file"><FileText size={48}/><span>Arquivo pronto para salvar</span></div>)}
 {file&&canShare&&<p>No menu do iPhone, escolha “Salvar Imagem” ou “Salvar em Arquivos”.</p>}
 {file&&!canShare&&<p>{image?'Toque e segure a imagem acima e escolha a opção de salvar.':'Este navegador não oferece o menu de salvar para este formato. O arquivo continua disponível no cartão.'}</p>}
 {error&&<p role="alert">{error}</p>}
 </div><footer className="ios-download-footer">{file&&canShare&&<button type="button" disabled={sharing} onClick={()=>void save()}><Share2 size={18}/>{sharing?'Abrindo menu…':'Salvar ou compartilhar'}</button>}{!file&&error&&<button type="button" onClick={()=>setRetry(n=>n+1)}>Tentar novamente</button>}<button type="button" className="secondary" onClick={onClose}>Voltar</button></footer>
 </dialog>,document.body);
}
export function AttachmentDownload({attachment,onStart}:{attachment:Attachment,onStart?:()=>void}){
 const [open,setOpen]=useState(false);
 return <><a className="attachment-download-button" href={attachmentDownloadUrl(attachment)||undefined} download={attachment.name} onClick={e=>{if(isAppleMobile(navigator)){e.preventDefault();e.stopPropagation();setOpen(true);onStart?.()}}}><Download size={14}/>Baixar arquivo</a>{open&&<IosDownloadDialog attachment={attachment} onClose={()=>setOpen(false)}/>}</>;
}
