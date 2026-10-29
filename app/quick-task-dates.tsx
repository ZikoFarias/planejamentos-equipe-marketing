'use client';
import {useEffect,useRef} from 'react';
import {X} from 'lucide-react';
import type {Task} from './model';
import {TaskDates} from './task-dates';
export function QuickTaskDates({task,busy,error,onSave,onClose}:{task:Task,busy:boolean,error:string,onSave:(start:string,due:string,time:string)=>Promise<void>,onClose:()=>void}){
 const dialog=useRef<HTMLDialogElement>(null);useEffect(()=>{dialog.current?.showModal()},[]);
 return <dialog ref={dialog} className="quick-date-dialog" aria-label={'Editar datas de '+task.title} onCancel={e=>{e.preventDefault();if(!busy)onClose()}}><div className="quick-date-heading"><strong>Datas do cartão</strong><button className="icon" aria-label="Fechar datas" disabled={busy} onClick={onClose}><X size={18}/></button></div><p>{task.title}</p><fieldset disabled={busy}><TaskDates start={task.start} due={task.due} time={task.dueTime||''} onSave={(start,due,time)=>{void onSave(start,due,time)}} onClose={()=>{}}/></fieldset>{busy&&<p role="status">Salvando datas…</p>}{error&&<p role="alert" className="late">{error}</p>}</dialog>
}
