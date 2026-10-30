'use client';
import {useEffect,useRef,useId} from 'react';
import type {Task} from './model';
import {companyOf,taggedCompanies} from './workflow';
export function missingCardFields(task:Pick<Task,'title'|'tags'>){
 const missing:string[]=[];
 if(!task.title.trim())missing.push('título');
 if(!companyOf(task as Task)||taggedCompanies(task as Task).length!==1)missing.push('etiqueta de empresa');
 return missing;
}
export function IncompleteCardDialog({missing,isNew,onContinue,onDiscard}:{missing:string[],isNew:boolean,onContinue:()=>void,onDiscard:()=>void}){
 const dialog=useRef<HTMLDialogElement>(null),title=useId(),description=useId();
 useEffect(()=>{const el=dialog.current;el?.showModal();return()=>{el?.close()}},[]);
 return <dialog ref={dialog} className="incomplete-card-dialog" role="alertdialog" aria-labelledby={title} aria-describedby={description} onCancel={e=>{e.preventDefault();e.stopPropagation();onContinue()}}>
  <h2 id={title}>Falta {missing.join(' e ')}</h2>
  <p id={description}>Adicione {missing.includes('título')?'um título':''}{missing.length>1?' e ':''}{missing.includes('etiqueta de empresa')?'uma etiqueta de empresa':''} para salvar este cartão.</p>
  <p>{isNew?'Deseja continuar preenchendo ou cancelar este cartão?':'Deseja continuar editando ou descartar as alterações?'}</p>
  <div className="incomplete-card-actions"><button type="button" autoFocus className="primary" onClick={onContinue}>Continuar preenchendo</button><button type="button" onClick={onDiscard}>{isNew?'Cancelar cartão':'Descartar alterações'}</button></div>
 </dialog>;
}
