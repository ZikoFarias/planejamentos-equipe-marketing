'use client';
import {useEffect,useId,useRef,useState} from 'react';
import {MoreVertical,Plus,Paperclip,Check,Download,ExternalLink,Trash2} from 'lucide-react';
import type {Task,Attachment} from './model';
import {AttachmentPreview} from './attachment-preview';
import {SaveToDrive} from './save-to-drive';
import type {ArtworkKind} from './drive-config';
import {automaticCover,coverFor,previewKind,sizeLabel} from './media';
function AttachmentTile({attachment:a,index,task,company,writable,busy,onBusy,onUpdate}:{attachment:Attachment,index:number,task:Task,company:string,writable:boolean,busy:boolean,onBusy:(busy:boolean)=>void,onUpdate:(update:(task:Task)=>Task)=>void}){
 const menu=useRef<HTMLDivElement>(null),trigger=useRef<HTMLButtonElement>(null),id=useId(),[expanded,setExpanded]=useState(false);
 function place(){const panel=menu.current,button=trigger.current;if(!panel||!button)return;const box=button.getBoundingClientRect(),width=Math.min(270,window.innerWidth-24),height=panel.offsetHeight;panel.style.width=width+'px';panel.style.left=Math.max(12,Math.min(box.right-width,window.innerWidth-width-12))+'px';panel.style.top=Math.max(12,box.bottom+height+8>window.innerHeight?box.top-height-6:box.bottom+6)+'px'}
 function close(){menu.current?.hidePopover?.();setExpanded(false)}
 useEffect(()=>{if(!expanded)return;window.addEventListener('resize',place);document.addEventListener('scroll',place,true);return()=>{window.removeEventListener('resize',place);document.removeEventListener('scroll',place,true)}},[expanded]);
 const openUrl=a.drive?.fileId?'/api/drive/central/media?id='+encodeURIComponent(a.drive.fileId):(/^https?:\/\//.test(a.url)||/^\/api\/files\/[a-f0-9-]{36}$/.test(a.url))?a.url:'#';
 return <div className="attachment-tile attachment-photo"><AttachmentPreview attachment={a}/>{a.artworkKind==='final'&&<span className="attachment-final-label"><Check size={12}/>Arte final</span>}<button ref={trigger} type="button" className="attachment-options-trigger" aria-label={'Opções de '+a.name} aria-controls={id} aria-expanded={expanded} onClick={()=>{if(expanded)close();else{menu.current?.showPopover?.();setExpanded(true);place()}}}><MoreVertical size={18}/></button>
 <div ref={menu} id={id} popover="auto" className="attachment-options" aria-label={'Informações e ações de '+a.name} onToggle={e=>{const open=(e.nativeEvent as ToggleEvent).newState==='open';setExpanded(open);if(open)place()}}>
  <strong className="attachment-file-name">{a.name}</strong><small>{sizeLabel(a.size)}</small>
  {a.backup?<p className="attachment-backup-status">{a.backup.status==='pending'?'Backup em andamento':'Backup não confirmado'}{a.backup.message?' · '+a.backup.message:''}</p>:a.drive?<small>Arquivo confirmado no Drive</small>:null}
  <a href={openUrl} target="_blank" rel="noreferrer"><ExternalLink size={14}/>Abrir arquivo</a>
  <a href={a.drive?.fileId?'/api/drive/central/media?id='+encodeURIComponent(a.drive.fileId)+'&download=1':openUrl} download={a.name}><Download size={14}/>Baixar arquivo</a>
  {a.drive&&/^[a-zA-Z0-9_-]{10,200}$/.test(a.drive.fileId)&&<a href={'https://drive.google.com/file/d/'+a.drive.fileId+'/view'} target="_blank" rel="noreferrer"><ExternalLink size={14}/>Abrir no Drive</a>}
  {writable&&<><button type="button" disabled={busy} aria-pressed={a.artworkKind==='final'} onClick={()=>{onUpdate(t=>{const attachments=t.attachments.map((item,i)=>i===index?{...item,artworkKind:(a.artworkKind==='final'?'reference':'final') as ArtworkKind}:item);return {...t,attachments,coverUrl:automaticCover(attachments)}});close()}}><Check size={14}/>{a.artworkKind==='final'?'Usar como referência':'Marcar como arte final'}</button>
  {previewKind(a)==='image'&&<button type="button" disabled={busy} aria-pressed={coverFor(task)?.url===a.url} onClick={()=>{onUpdate(t=>({...t,coverUrl:a.url}));close()}}>{coverFor(task)?.url===a.url?'Capa do cartão':'Usar como capa'}</button>}
  <SaveToDrive attachment={a} company={company} disabled={busy} onBusy={onBusy} onSaved={attachment=>onUpdate(t=>({...t,attachments:t.attachments.map((item,i)=>i===index?attachment:item)}))}/>
  <button type="button" className="danger" disabled={busy} onClick={()=>{onUpdate(t=>{const attachments=t.attachments.filter((_,i)=>i!==index);return {...t,attachments,coverUrl:automaticCover(attachments)}});close()}}><Trash2 size={14}/>Remover do cartão</button></>}
 </div></div>;
}
export function TaskAttachments({task,company,writable,busy,onBusy,onUpdate,onAdd,onDropFiles}:{task:Task,company:string,writable:boolean,busy:boolean,onBusy:(busy:boolean)=>void,onUpdate:(update:(task:Task)=>Task)=>void,activeKind?:ArtworkKind,onKindChange?:(kind:ArtworkKind)=>void,onAdd:(kind:ArtworkKind)=>void,onDropFiles:(files:File[],kind:ArtworkKind)=>void}){
 return <section className="detail-section task-attachments" onDragOver={e=>{if(e.dataTransfer.types.includes('Files')){e.preventDefault();e.dataTransfer.dropEffect=writable&&!busy?'copy':'none'}}} onDrop={e=>{if(!e.dataTransfer.files.length)return;e.preventDefault();e.stopPropagation();if(writable&&!busy)onDropFiles(Array.from(e.dataTransfer.files),'reference')}}><div className="attachments-heading"><h3>Arquivos <small>{task.attachments.length}</small></h3>{writable&&<button type="button" disabled={busy} onClick={()=>onAdd('reference')}><Plus size={15}/>Adicionar arquivos</button>}</div>
 {!task.attachments.length?<div className="attachment-empty"><Paperclip size={22}/><p>Arraste arquivos para cá ou clique em Adicionar arquivos.</p></div>:<div className="attachment-grid">{task.attachments.map((a,index)=><AttachmentTile key={a.url+'-'+index} attachment={a} index={index} task={task} company={company} writable={writable} busy={busy} onBusy={onBusy} onUpdate={onUpdate}/>)}</div>}
 </section>;
}
