'use client';
import {useEffect,useRef} from 'react';
import type {Task} from './model';
import {ProfileAvatar,profileName} from './profile-avatar';
import {AttachmentPreview} from './attachment-preview';
export function TaskActivity({task}:{task:Task}){
 const feed=useRef<HTMLDivElement>(null);useEffect(()=>{feed.current?.scrollTo({top:feed.current.scrollHeight})},[task.id,task.history.length,task.comments.length]);
 const legacyFiles=task.attachments.filter(a=>!task.history.some(h=>h.attachments?.some(item=>item.url===a.url)));
 const events=[...task.comments.map(c=>({...c,kind:'comment',attachments:undefined})),...task.history.map(h=>({...h,kind:'activity'}))].sort((a,b)=>Date.parse(a.at)-Date.parse(b.at));
 return <div ref={feed} className="activity-feed" aria-label="Linha do tempo do cartão">{events.length?events.map((event,i)=><article className={'activity-entry '+event.kind} key={event.at+'-'+i}><header><ProfileAvatar name={event.by}/><strong>{profileName(event.by)}</strong><time dateTime={event.at}>{new Date(event.at).toLocaleString('pt-BR')}</time></header><p>{event.text}</p>{event.attachments?.filter(a=>task.attachments.some(current=>current.url===a.url)).map(a=><div className="activity-file" key={a.url}><AttachmentPreview attachment={a}/><a href={a.url} target="_blank" rel="noreferrer">{a.name}</a></div>)}</article>):<p className="muted">As atividades aparecerão aqui ao salvar o cartão.</p>}{legacyFiles.map(a=><article className="activity-entry" key={'legacy-'+a.url}><p>Arquivo anterior · autoria não registrada</p><div className="activity-file"><AttachmentPreview attachment={a}/><a href={a.url} target="_blank" rel="noreferrer">{a.name}</a></div></article>)}</div>
}
