'use client';
import {useEffect,useState} from 'react';
import {reactionEmojis} from './comment-actions';
import type {Task} from './model';
type Comment=Task['comments'][number];
export function CommentControls({comment,email,onAction}:{comment:Comment;email:string;onAction:(id:string,action:'edit'|'react',value:string)=>Promise<void>}){
 const [now,setNow]=useState(Date.now),[editing,setEditing]=useState(false),[text,setText]=useState(comment.text),[busy,setBusy]=useState(false),[error,setError]=useState('');
 const editable=comment.by===email&&now-Date.parse(comment.at)<60000;
 useEffect(()=>{if(!editable)return;const timer=setInterval(()=>setNow(Date.now()),1000);return()=>clearInterval(timer)},[editable]);
 async function send(action:'edit'|'react',value:string){setBusy(true);setError('');try{await onAction(comment.id!,action,value);setEditing(false)}catch(e){setError((e as Error).message)}finally{setBusy(false)}}
 return <div className="comment-controls">
  {comment.editedAt&&<small>Editado</small>}
  {editable&&!editing&&<button type="button" onClick={()=>{setText(comment.text);setEditing(true)}}>Editar</button>}
  {editing&&<div><textarea aria-label="Editar comentário" value={text} disabled={busy||!editable} onChange={e=>setText(e.target.value)}/><button type="button" disabled={busy||!editable} onClick={()=>void send('edit',text)}>Salvar</button><button type="button" onClick={()=>setEditing(false)}>Cancelar</button>{!editable&&<small>O prazo de edição terminou.</small>}</div>}
  <div className="comment-reactions">{Object.entries(comment.reactions||{}).map(([emoji,people])=><button type="button" key={emoji} disabled={busy} aria-pressed={people.includes(email)} onClick={()=>void send('react',emoji)}>{emoji} {people.length}</button>)}<details><summary aria-label="Reagir ao comentário" title="Reagir">☺</summary><div>{reactionEmojis.map(emoji=><button type="button" key={emoji} disabled={busy} aria-label={'Reagir com '+emoji} onClick={()=>void send('react',emoji)}>{emoji}</button>)}</div></details></div>
  {error&&<small role="alert">{error}</small>}
 </div>;
}
