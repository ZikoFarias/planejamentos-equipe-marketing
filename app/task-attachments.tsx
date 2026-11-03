'use client';
import {useEffect,useId,useRef,useState} from 'react';
import {MoreVertical,Plus,Paperclip,Check,Download,ExternalLink,Trash2} from 'lucide-react';
import type {Task,Attachment} from './model';
import {AttachmentPreview} from './attachment-preview';
import {AttachmentOptions} from './attachment-options';
import type {ArtworkKind} from './drive-config';
import {automaticCover,coverFor,previewKind,sizeLabel} from './media';
function AttachmentTile(props:{attachment:Attachment,index:number,task:Task,company:string,writable:boolean,busy:boolean,onBusy:(busy:boolean)=>void,onUpdate:(update:(task:Task)=>Task)=>void}){const a=props.attachment;return <div className="attachment-tile attachment-photo"><AttachmentPreview attachment={a}/>{a.artworkKind==='final'&&<span className="attachment-final-label"><Check size={12}/>Arte final</span>}<AttachmentOptions {...props}/></div>}

export function TaskAttachments({task,company,writable,busy,onBusy,onUpdate,onAdd,onDropFiles}:{task:Task,company:string,writable:boolean,busy:boolean,onBusy:(busy:boolean)=>void,onUpdate:(update:(task:Task)=>Task)=>void,activeKind?:ArtworkKind,onKindChange?:(kind:ArtworkKind)=>void,onAdd:(kind:ArtworkKind)=>void,onDropFiles:(files:File[],kind:ArtworkKind)=>void}){
 return <section className="detail-section task-attachments" onDragOver={e=>{if(e.dataTransfer.types.includes('Files')){e.preventDefault();e.dataTransfer.dropEffect=writable&&!busy?'copy':'none'}}} onDrop={e=>{if(!e.dataTransfer.files.length)return;e.preventDefault();e.stopPropagation();if(writable&&!busy)onDropFiles(Array.from(e.dataTransfer.files),'reference')}}><div className="attachments-heading"><h3>Arquivos <small>{task.attachments.length}</small></h3>{writable&&<button type="button" disabled={busy} onClick={()=>onAdd('reference')}><Plus size={15}/>Adicionar arquivos</button>}</div>
 {!task.attachments.length?<div className="attachment-empty"><Paperclip size={22}/><p>Arraste arquivos para cá ou clique em Adicionar arquivos.</p></div>:<div className="attachment-grid">{task.attachments.map((a,index)=><AttachmentTile key={a.url+'-'+index} attachment={a} index={index} task={task} company={company} writable={writable} busy={busy} onBusy={onBusy} onUpdate={onUpdate}/>)}</div>}
 </section>;
}
