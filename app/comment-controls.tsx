'use client';
import {useEffect,useState} from 'react';
import {reactionEmojis} from './comment-actions';
import {ChevronDown,Reply,SmilePlus,Trash2,Pencil} from 'lucide-react';
import type {Task} from './model';
type Comment=Task['comments'][number];
export function CommentControls({comment,email,onAction,onReply}:{comment:Comment;email:string;onAction:(id:string,action:'edit'|'react'|'delete',value:string)=>Promise<void>;onReply?:()=>void}){
 const [now,setNow]=useState(Date.now),[editing,setEditing]=useState(false),[text,setText]=useState(comment.text),[busy,setBusy]=useState(false),[error,setError]=useState('');
 const editable=comment.by===email&&now-Date.parse(comment.at)<60000;
 useEffect(()=>{if(!editable)return;const timer=setInterval(()=>setNow(Date.now()),1000);return()=>clearInterval(timer)},[editable]);
 async function send(action:'edit'|'react'|'delete',value:string){setBusy(true);setError('');try{await onAction(comment.id!,action,value);setEditing(false)}catch(e){setError((e as Error).message)}finally{setBusy(false)}}
 return <div className="comment-controls">
  {comment.editedAt&&<small>Editado</small>}
  <details className="comment-action-menu"><summary aria-label="Opções da mensagem"><ChevronDown size={16}/></summary><div>
   {onReply&&<button type="button" onClick={e=>{e.currentTarget.closest('details')!.open=false;onReply()}}><Reply size={15}/>Responder</button>}
   <button type="button" onClick={e=>{e.currentTarget.closest('details')!.open=false;e.currentTarget.closest('.comment-controls')?.querySelector<HTMLDetailsElement>('.comment-reactions > details')?.setAttribute('open','')}}><SmilePlus size={15}/>Reagir</button>
   {editable&&!editing&&<button type="button" onClick={e=>{e.currentTarget.closest('details')!.open=false;setText(comment.text);setEditing(true)}}><Pencil size={15}/>Editar</button>}
   {comment.by===email&&<button type="button" disabled={busy} onClick={()=>void send('delete','')}><Trash2 size={15}/>Apagar</button>}
  </div></details>
  {editing&&<div><textarea aria-label="Editar comentário" value={text} disabled={busy||!editable} onChange={e=>setText(e.target.value)}/><button type="button" disabled={busy||!editable} onClick={()=>void send('edit',text)}>Salvar</button><button type="button" onClick={()=>setEditing(false)}>Cancelar</button>{!editable&&<small>O prazo de edição terminou.</small>}</div>}
  <div className="comment-reactions">{Object.entries(comment.reactions||{}).map(([emoji,people])=><button type="button" className="comment-reaction-chip" key={emoji} disabled={busy} aria-label={emoji+' · '+people.length+' reação(ões)'} aria-pressed={people.includes(email)} onClick={()=>void send('react',emoji)}>{emoji}{people.length>1&&<small>{people.length}</small>}</button>)}<details><summary aria-label="Reagir ao comentário" title="Reagir"><SmilePlus size={15}/></summary><div>{reactionEmojis.slice(0,6).map(emoji=><button type="button" key={emoji} disabled={busy} aria-label={'Reagir com '+emoji} onClick={event=>{event.currentTarget.closest('details')?.removeAttribute('open');void send('react',emoji)}}>{emoji}</button>)}<details className="comment-more-reactions"><summary aria-label="Mais reações">+</summary><div>{reactionEmojis.slice(6).map(emoji=><button type="button" key={emoji} disabled={busy} aria-label={'Reagir com '+emoji} onClick={event=>{event.currentTarget.closest('.comment-reactions > details')?.removeAttribute('open');void send('react',emoji)}}>{emoji}</button>)}</div></details></div></details></div>
  {error&&<small role="alert">{error}</small>}
 </div>;
}
