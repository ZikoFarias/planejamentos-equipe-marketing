'use client';
import {useId,useRef} from 'react';
import {X,Plus,Paperclip} from 'lucide-react';
import type {Task} from './model';
import {AttachmentPreview} from './attachment-preview';
import {SaveToDrive} from './save-to-drive';
import {ColorSelect} from './color-select';
import {artworkLabels,type ArtworkKind} from './drive-config';
import {automaticCover,coverFor,previewKind,sizeLabel} from './media';

export function TaskAttachments({task,company,writable,busy,onBusy,onUpdate,activeKind,onKindChange,onAdd}:{task:Task,company:string,writable:boolean,busy:boolean,onBusy:(busy:boolean)=>void,onUpdate:(update:(task:Task)=>Task)=>void,activeKind:ArtworkKind,onKindChange:(kind:ArtworkKind)=>void,onAdd:(kind:ArtworkKind)=>void}){
  const id=useId(),tabs=useRef<HTMLDivElement>(null);
  const groups=[{kind:'reference' as const,label:'Anexos de referência'},{kind:'final' as const,label:'Anexos da arte'}];
  const itemsFor=(kind:ArtworkKind)=>task.attachments.map((a,i)=>({a,i})).filter(({a})=>kind==='reference'?a.artworkKind!=='final':a.artworkKind==='final');
  return <section className="detail-section task-attachments"><h3>Arquivos <small>{task.attachments.length}</small></h3>
    <p className="muted">Arquivos de até 100 MB. A arte final vira a capa automaticamente; enquanto não houver, usamos a referência.</p>
    <div className="attachment-tabs" role="tablist" aria-label="Tipos de arquivos" ref={tabs} onKeyDown={event=>{
      if(!['ArrowLeft','ArrowRight','Home','End'].includes(event.key))return;event.preventDefault();
      const next=event.key==='Home'?'reference':event.key==='End'?'final':activeKind==='reference'?'final':'reference';
      onKindChange(next);tabs.current?.querySelector<HTMLButtonElement>('[data-kind="'+next+'"]')?.focus();
    }}>{groups.map(group=><button key={group.kind} type="button" role="tab" data-kind={group.kind} id={id+'-tab-'+group.kind} aria-selected={activeKind===group.kind} aria-controls={id+'-panel-'+group.kind} tabIndex={activeKind===group.kind?0:-1} onClick={()=>onKindChange(group.kind)}>{group.label}<span>{itemsFor(group.kind).length}</span></button>)}</div>
    {groups.map(group=>{const items=itemsFor(group.kind);
      return <section className="attachment-category attachment-panel" key={group.kind} role="tabpanel" tabIndex={0} id={id+'-panel-'+group.kind} aria-labelledby={id+'-tab-'+group.kind} hidden={activeKind!==group.kind}>
      <div className="attachment-panel-heading"><span>{group.kind==='reference'?'Briefings, exemplos e inspirações':'Artes produzidas e arquivos finais'}</span>{writable&&<button type="button" className="attachment-add" disabled={busy} onClick={()=>onAdd(group.kind)}><Plus size={15}/>{group.kind==='reference'?'Adicionar referência':'Adicionar arte'}</button>}</div>
      {group.kind==='reference'&&items.some(({a})=>!a.artworkKind)&&<p className="legacy-attachment-note">Os arquivos antigos sem classificação estão aqui. Você pode definir o tipo de cada um.</p>}
      {!items.length&&<div className="attachment-empty"><Paperclip size={22}/><strong>{group.kind==='reference'?'Nenhuma referência adicionada':'Nenhuma arte adicionada'}</strong><p>{group.kind==='reference'?'Reúna aqui os arquivos que orientam a criação.':'Adicione aqui a arte produzida para esta tarefa.'}</p></div>}
      <div className="attachment-grid">{items.map(({a,i})=><div className="attachment-tile" key={a.url+'-'+i}>
        <AttachmentPreview attachment={a}/><div className="attachment-caption">
          <a href={(/^https?:\/\//.test(a.url)||/^\/api\/files\/[a-f0-9-]{36}$/.test(a.url))?a.url:'#'} target="_blank" rel="noreferrer">{a.name}</a><small>{sizeLabel(a.size)}</small>
          {a.backup&&<div className="backup-warning" role="status"><strong>{a.backup.status==='pending'?'Backup em andamento':'Backup não confirmado'}</strong>{a.backup.message&&<small>{a.backup.message}</small>}</div>}
          {a.drive&&!a.backup&&<small className="backup-confirmed">Arquivo confirmado no Drive</small>}
          {!a.artworkKind&&<small>Sem classificação</small>}
          {writable&&<ColorSelect label={'Classificação de '+a.name} value={a.artworkKind||''} disabled={busy} onChange={value=>{onUpdate(t=>{const attachments=t.attachments.map((item,j)=>j===i?{...item,artworkKind:(value||undefined) as ArtworkKind|undefined}:item);return {...t,attachments,coverUrl:automaticCover(attachments)}});if(value)onKindChange(value as ArtworkKind)}} options={[{value:'',label:'Sem classificação',color:'#9faebd'},...Object.entries(artworkLabels).map(([value,label])=>({value,label,color:'#579dff'}))]}/>}
          {a.drive&&/^[a-zA-Z0-9_-]{10,200}$/.test(a.drive.fileId)&&<a href={'https://drive.google.com/file/d/'+a.drive.fileId+'/view'} target="_blank" rel="noreferrer">Abrir no Drive</a>}
        </div>
        {writable&&<SaveToDrive attachment={a} company={company} disabled={busy} onBusy={onBusy} onSaved={attachment=>onUpdate(t=>({...t,attachments:t.attachments.map((item,j)=>j===i?attachment:item)}))}/>}
        <div className="attachment-actions">{previewKind(a)==='image'&&<button disabled={!writable||busy} aria-pressed={coverFor(task)?.url===a.url} onClick={()=>onUpdate(t=>({...t,coverUrl:t.coverUrl===a.url?undefined:a.url}))}>{coverFor(task)?.url===a.url?'✓ Capa do cartão':'Usar como capa'}</button>}
          {writable&&<button className="icon danger" disabled={busy} aria-label={'Remover anexo '+a.name} onClick={()=>onUpdate(t=>{const attachments=t.attachments.filter((_,j)=>j!==i);return {...t,attachments,coverUrl:t.coverUrl===a.url?automaticCover(attachments):t.coverUrl}})}><X size={14}/></button>}
        </div></div>)}</div></section>
    })}
  </section>
}
