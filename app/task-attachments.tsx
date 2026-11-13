'use client';
import {useRef,useState} from 'react';
import {Paperclip,Check} from 'lucide-react';
import type {Task,Attachment} from './model';
import {previewKind} from './media';
import {AttachmentPreview} from './attachment-preview';
import {CardBorderGlow} from './card-border-glow';
import {AttachmentOptions} from './attachment-options';
import type {ArtworkKind} from './drive-config';
function AttachmentTile(props:{attachment:Attachment,index:number,task:Task,company:string,writable:boolean,busy:boolean,onBusy:(busy:boolean)=>void,onUpdate:(update:(task:Task)=>Task)=>void}){const a=props.attachment;return <div className={'attachment-tile attachment-photo '+(previewKind(a)==='pdf'?'pdf-attachment-tile':'')}><CardBorderGlow/><AttachmentPreview attachment={a}/>{a.artworkKind==='final'&&<span className="attachment-final-label"><Check size={12}/>Arte final</span>}<AttachmentOptions {...props}/><div className="attachment-caption" title={a.name}>{a.name}</div></div>}

export function TaskAttachments({task,company,writable,busy,onBusy,onUpdate,onAdd,onDropFiles}:{task:Task,company:string,writable:boolean,busy:boolean,onBusy:(busy:boolean)=>void,onUpdate:(update:(task:Task)=>Task)=>void,activeKind?:ArtworkKind,onKindChange?:(kind:ArtworkKind)=>void,onAdd:(kind:ArtworkKind)=>void,onDropFiles:(files:File[],kind:ArtworkKind)=>void}){
 const fileInput=useRef<HTMLInputElement>(null),[draggingFiles,setDraggingFiles]=useState(false),[dropMessage,setDropMessage]=useState('');
 function accept(files:File[]){if(!files.length)return;const accepted=files.slice(0,10);if(files.length>10)setDropMessage('Limite de 10 arquivos por envio; os primeiros 10 foram selecionados.');else setDropMessage('');onDropFiles(accepted,'reference')}
 return <section className="detail-section task-attachments" onDragEnter={e=>{if(writable&&!busy&&Array.from(e.dataTransfer.types).includes('Files')){e.preventDefault();setDraggingFiles(true)}}} onDragOver={e=>{if(Array.from(e.dataTransfer.types).includes('Files')){e.preventDefault();e.dataTransfer.dropEffect=writable&&!busy?'copy':'none';if(writable&&!busy)setDraggingFiles(true)}}} onDragLeave={e=>{if(!e.currentTarget.contains(e.relatedTarget as Node|null))setDraggingFiles(false)}} onDrop={e=>{if(!e.dataTransfer.files.length)return;e.preventDefault();e.stopPropagation();setDraggingFiles(false);if(writable&&!busy)accept(Array.from(e.dataTransfer.files))}}><div className="attachments-heading"><h3>Arquivos <small>{task.attachments.length}</small></h3></div>
 <input ref={fileInput} type="file" multiple hidden disabled={!writable||busy} aria-label="Adicionar arquivos ao cartão" onChange={e=>{const files=Array.from(e.target.files||[]);e.target.value='';accept(files)}}/>{writable&&<button type="button" className={'attachment-dropbar '+(draggingFiles?'drag-active':'')} disabled={busy} aria-live="polite" onClick={()=>fileInput.current?.click()}>{draggingFiles?'Solte para adicionar até 10 arquivos':'Arraste os arquivos para cá ou'}{!draggingFiles&&<> <span>procure nos arquivos</span></>}</button>}{dropMessage&&<small className="upload-drop-message" role="status">{dropMessage}</small>}
 {!task.attachments.length?<div className="attachment-empty"><Paperclip size={22}/><p>Nenhum arquivo adicionado.</p></div>:<div className="attachment-grid">{task.attachments.map((a,index)=><AttachmentTile key={a.url+'-'+index} attachment={a} index={index} task={task} company={company} writable={writable} busy={busy} onBusy={onBusy} onUpdate={onUpdate}/>)}</div>}
 </section>;
}
