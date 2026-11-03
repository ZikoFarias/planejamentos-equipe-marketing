'use client';
import {useRef} from 'react';
import {Paperclip,Check} from 'lucide-react';
import type {Task,Attachment} from './model';
import {AttachmentPreview} from './attachment-preview';
import {AttachmentOptions} from './attachment-options';
import type {ArtworkKind} from './drive-config';
function AttachmentTile(props:{attachment:Attachment,index:number,task:Task,company:string,writable:boolean,busy:boolean,onBusy:(busy:boolean)=>void,onUpdate:(update:(task:Task)=>Task)=>void}){const a=props.attachment;return <div className="attachment-tile attachment-photo"><AttachmentPreview attachment={a}/>{a.artworkKind==='final'&&<span className="attachment-final-label"><Check size={12}/>Arte final</span>}<AttachmentOptions {...props}/><div className="attachment-caption" title={a.name}>{a.name}</div></div>}

export function TaskAttachments({task,company,writable,busy,onBusy,onUpdate,onAdd,onDropFiles}:{task:Task,company:string,writable:boolean,busy:boolean,onBusy:(busy:boolean)=>void,onUpdate:(update:(task:Task)=>Task)=>void,activeKind?:ArtworkKind,onKindChange?:(kind:ArtworkKind)=>void,onAdd:(kind:ArtworkKind)=>void,onDropFiles:(files:File[],kind:ArtworkKind)=>void}){
 const fileInput=useRef<HTMLInputElement>(null);
 return <section className="detail-section task-attachments" onDragOver={e=>{if(e.dataTransfer.types.includes('Files')){e.preventDefault();e.dataTransfer.dropEffect=writable&&!busy?'copy':'none'}}} onDrop={e=>{if(!e.dataTransfer.files.length)return;e.preventDefault();e.stopPropagation();if(writable&&!busy)onDropFiles(Array.from(e.dataTransfer.files),'reference')}}><div className="attachments-heading"><h3>Arquivos <small>{task.attachments.length}</small></h3></div>
 <input ref={fileInput} type="file" multiple hidden disabled={!writable||busy} aria-label="Adicionar arquivos ao cartão" onChange={e=>{const files=Array.from(e.target.files||[]);e.target.value='';if(files.length)onDropFiles(files,'reference')}}/>{writable&&<button type="button" className="attachment-dropbar" disabled={busy} onClick={()=>fileInput.current?.click()}>Arraste os arquivos para cá ou <span>procure nos arquivos</span></button>}
 {!task.attachments.length?<div className="attachment-empty"><Paperclip size={22}/><p>Nenhum arquivo adicionado.</p></div>:<div className="attachment-grid">{task.attachments.map((a,index)=><AttachmentTile key={a.url+'-'+index} attachment={a} index={index} task={task} company={company} writable={writable} busy={busy} onBusy={onBusy} onUpdate={onUpdate}/>)}</div>}
 </section>;
}
