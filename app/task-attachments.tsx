'use client';
import {X} from 'lucide-react';
import type {Task} from './model';
import {AttachmentPreview} from './attachment-preview';
import {SaveToDrive} from './save-to-drive';
import {ColorSelect} from './color-select';
import {artworkLabels,type ArtworkKind} from './drive-config';
import {previewKind,sizeLabel} from './media';

export function TaskAttachments({task,company,writable,busy,onBusy,onUpdate}:{task:Task,company:string,writable:boolean,busy:boolean,onBusy:(busy:boolean)=>void,onUpdate:(update:(task:Task)=>Task)=>void}){
  const groups=[{kind:'reference',label:'Referências'},{kind:'final',label:'Artes finalizadas'},{kind:'',label:'Sem classificação'}];
  return <section className="detail-section"><h3>Anexos <small>{task.attachments.length}</small></h3>
    <p className="muted">Arquivos de até 100 MB. Escolha uma imagem como capa do cartão.</p>
    {groups.map(group=>{const items=task.attachments.map((a,i)=>({a,i})).filter(({a})=>(a.artworkKind||'')===group.kind);if(!items.length)return null;
      return <section className="attachment-category" key={group.kind} aria-label={group.label}><h4>{group.label} <small>{items.length}</small></h4><div className="attachment-grid">{items.map(({a,i})=><div className="attachment-tile" key={a.url+'-'+i}>
        <AttachmentPreview attachment={a}/><div className="attachment-caption">
          <a href={(/^https?:\/\//.test(a.url)||/^\/api\/files\/[a-f0-9-]{36}$/.test(a.url))?a.url:'#'} target="_blank" rel="noreferrer">{a.name}</a><small>{sizeLabel(a.size)}</small>
          {a.backup&&<div className="backup-warning" role="status"><strong>{a.backup.status==='pending'?'Backup em andamento':'Backup não confirmado'}</strong>{a.backup.message&&<small>{a.backup.message}</small>}</div>}
          {a.drive&&!a.backup&&<small className="backup-confirmed">Backup confirmado no Drive</small>}
          {writable&&<ColorSelect label={'Classificação de '+a.name} value={a.artworkKind||''} disabled={busy} onChange={value=>onUpdate(t=>({...t,attachments:t.attachments.map((item,j)=>j===i?{...item,artworkKind:(value||undefined) as ArtworkKind|undefined}:item)}))} options={[{value:'',label:'Sem classificação',color:'#9faebd'},...Object.entries(artworkLabels).map(([value,label])=>({value,label,color:'#579dff'}))]}/>}
          {a.drive&&/^[a-zA-Z0-9_-]{10,200}$/.test(a.drive.fileId)&&<a href={'https://drive.google.com/file/d/'+a.drive.fileId+'/view'} target="_blank" rel="noreferrer">Abrir cópia no Drive</a>}
        </div>
        {writable&&<SaveToDrive attachment={a} company={company} disabled={busy} onBusy={onBusy} onSaved={attachment=>onUpdate(t=>({...t,attachments:t.attachments.map((item,j)=>j===i?attachment:item)}))}/>}
        <div className="attachment-actions">{previewKind(a)==='image'&&<button disabled={!writable||busy} aria-pressed={task.coverUrl===a.url} onClick={()=>onUpdate(t=>({...t,coverUrl:t.coverUrl===a.url?undefined:a.url}))}>{task.coverUrl===a.url?'✓ Capa do cartão':'Usar como capa'}</button>}
          {writable&&<button className="icon danger" disabled={busy} aria-label={'Remover anexo '+a.name} onClick={()=>onUpdate(t=>({...t,attachments:t.attachments.filter((_,j)=>j!==i),coverUrl:t.coverUrl===a.url?undefined:t.coverUrl}))}><X size={14}/></button>}
        </div></div>)}</div></section>
    })}
  </section>
}
