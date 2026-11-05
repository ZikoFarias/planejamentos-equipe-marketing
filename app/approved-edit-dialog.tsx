'use client';
import {useEffect,useRef,useId} from 'react';
import type {Task} from './model';
export function approvedEdits(previous:Task|undefined,next:Task){
 if(previous?.status!=='aprovado ✅')return false;
 const fields=['title','description','attachments','coverUrl','start','due','dueTime','priority','subtasks','checklist'] as const;
 if(fields.some(key=>JSON.stringify(previous[key])!==JSON.stringify(next[key])))return true;
 return (['tags','assignees'] as const).some(key=>JSON.stringify([...previous[key]].sort())!==JSON.stringify([...next[key]].sort()));
}
export function ApprovedEditDialog({onAnswer}:{onAnswer:(yes:boolean)=>void}){const ref=useRef<HTMLDialogElement>(null),id=useId();useEffect(()=>{ref.current?.showModal();return()=>ref.current?.close()},[]);return <dialog ref={ref} className="incomplete-card-dialog approved-edit-dialog" role="alertdialog" aria-labelledby={id} onCancel={e=>{e.preventDefault();e.stopPropagation();onAnswer(false)}}><h2 id={id}>Esta arte já foi aprovada</h2><p>Salvar as edições e enviar para Ajustar?</p><small>Se escolher Não, as edições serão descartadas.</small><div className="incomplete-card-actions"><button type="button" className="primary" onClick={()=>onAnswer(true)}>Sim, ajustar</button><button type="button" autoFocus onClick={()=>onAnswer(false)}>Não, manter</button></div></dialog>}
