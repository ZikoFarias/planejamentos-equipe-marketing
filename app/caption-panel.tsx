'use client';
import {lucioOnly} from './reviewer-policy';
import type {LabelConfig} from './labels';
import {ThumbsUp} from 'lucide-react';
import type {Task} from './model';
import {captionSent,canWriteCaption,canRequestCaption} from './captions';
import type {Actor} from './permissions';
export function CaptionMark({task}:{task:Task}){return captionSent(task)?<span className="caption-mark" title="Legenda enviada para aprovação" aria-label="Legenda enviada para aprovação"><ThumbsUp size={15}/></span>:null}
export function CaptionPanel({task,actor,text,onText,onAction,busy}:{task:Task,actor:Actor,text:string,onText:(value:string)=>void,onAction:(action:'save'|'submit'|'request_adjust')=>void,busy:boolean}){
 const writable=canWriteCaption(actor);
 return <section className="detail-section caption-panel"><div className="caption-heading"><h3>Legenda para redes sociais</h3><CaptionMark task={task}/></div>{writable?<textarea aria-label="Legenda para redes sociais" maxLength={10000} rows={6} value={text} disabled={busy} onChange={e=>onText(e.target.value)} placeholder="Escreva a legenda desta arte…"/>:<p className="caption-text">{task.caption?.text||'Laura ainda não adicionou a legenda.'}</p>}<div className="caption-actions">{writable&&<><button disabled={busy||text===(task.caption?.text||'')} onClick={()=>onAction('save')}>Salvar legenda</button><button className="primary" disabled={busy||!text.trim()} onClick={()=>onAction('submit')}>Enviar legenda para aprovação</button></>}{canRequestCaption(actor)&&<button disabled={busy||task.status==='ajustar legenda'} onClick={()=>onAction('request_adjust')}>Solicitar ajuste de legenda</button>}</div></section>;
}

export function CardApprovalMarks({task,labels}:{task:Task,labels?:LabelConfig}){
 const reviewers=(['lucio','mateus'] as const).filter(person=>(!lucioOnly(task,labels)||person==='lucio')&&task.approval?.votes[person]?.decision==='approved');
 if(!reviewers.length&&!captionSent(task))return null;
 return <div className="card-approval-votes" aria-label="Aprovações e legenda recebidas">{reviewers.map(person=><span key={person} title={'Aprovado por '+(person==='lucio'?'Lúcio':'Mateus')} aria-label={'Aprovado por '+(person==='lucio'?'Lúcio':'Mateus')}><ThumbsUp size={15} fill={person==='lucio'?'currentColor':'none'}/></span>)}<CaptionMark task={task}/></div>;
}
