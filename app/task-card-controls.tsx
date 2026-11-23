'use client';
import {useEffect,useLayoutEffect,useRef,useState,type ReactNode,type RefObject} from 'react';
import {CalendarDays,Check,FileText,Users,X} from 'lucide-react';
import {ProfileAvatar,profileName} from './profile-avatar';
import type {Task} from './model';
import {canShowSpellingPanel} from './spelling-panel';
import {spellingFlagged} from './spelling';
function useCardPopover(open:boolean,setOpen:(value:boolean)=>void,anchor:RefObject<HTMLDivElement|null>,menu:RefObject<HTMLDivElement|null>){
 useLayoutEffect(()=>{const panel=menu.current;if(!open||!panel)return;
  function place(){const box=anchor.current?.getBoundingClientRect();if(!box||!panel)return;panel.style.left=Math.max(8,Math.min(box.left,window.innerWidth-panel.offsetWidth-8))+'px';panel.style.top=Math.max(8,Math.min(box.bottom+7,window.innerHeight-panel.offsetHeight-8))+'px'}
  panel.showPopover?.();place();const observer=typeof ResizeObserver==='undefined'?null:new ResizeObserver(place);observer?.observe(panel);window.addEventListener('resize',place);document.addEventListener('scroll',place,true);
  return()=>{observer?.disconnect();panel.hidePopover?.();window.removeEventListener('resize',place);document.removeEventListener('scroll',place,true)};
 },[open,anchor,menu]);
 useEffect(()=>{if(!open)return;const outside=(event:PointerEvent)=>{if(!anchor.current?.contains(event.target as Node))setOpen(false)};document.addEventListener('pointerdown',outside);return()=>document.removeEventListener('pointerdown',outside)},[open,anchor,setOpen]);
}
type MemberOption={value:string,name:string,selected:boolean,locked?:boolean};
export function TaskMembersPicker({options,writable,busy,onToggle}:{options:MemberOption[],writable:boolean,busy:boolean,onToggle:(id:string,selected:boolean)=>void}){
 const [open,setOpen]=useState(false),root=useRef<HTMLDivElement>(null),menu=useRef<HTMLDivElement>(null),trigger=useRef<HTMLButtonElement>(null),selected=options.filter(o=>o.selected);
 useCardPopover(open,setOpen,root,menu);
 const people=(list:MemberOption[])=>list.map(option=><button type="button" role="option" aria-selected={option.selected} disabled={!writable||busy||option.locked} key={option.value} onClick={()=>onToggle(option.value,!option.selected)}><ProfileAvatar name={option.name} interactive={false}/><span>{profileName(option.name)}</span>{option.selected&&<Check size={15}/>}</button>);
 return <div className="task-members-picker" ref={root} onKeyDown={e=>{if(e.key==='Escape'&&open){e.preventDefault();e.stopPropagation();setOpen(false);trigger.current?.focus()}}}>
 <button ref={trigger} type="button" className="task-members-trigger" aria-label={writable?'Editar membros':'Ver membros'} aria-haspopup="listbox" aria-expanded={open} disabled={busy} onClick={()=>setOpen(!open)} title={selected.map(o=>profileName(o.name)).join(', ')||'Membros'}><span className="task-members-avatars">{selected.length?selected.map(o=><ProfileAvatar key={o.value} name={o.name} interactive={false}/>):<Users size={19}/>}</span></button>
 {open&&<div ref={menu} popover="manual" className="task-members-menu"><div className="task-members-menu-top"><span className="task-members-avatars">{selected.map(o=><ProfileAvatar key={o.value} name={o.name} interactive={false}/>)}</span><button type="button" aria-label="Fechar membros" onClick={()=>{setOpen(false);trigger.current?.focus()}}><X size={17}/></button></div><div role="listbox" aria-multiselectable="true" aria-label="Membros do cartão">{selected.length>0&&<><small>Responsáveis</small>{people(selected)}</>}{options.some(o=>!o.selected)&&<><small>Pessoas</small>{people(options.filter(o=>!o.selected))}</>}</div></div>}
 </div>;
}
export function compactTaskDate(value:string|undefined,placeholder:string){const match=value?.match(/^(\d{4})-(\d{2})-(\d{2})$/);return match?match[3]+'/'+match[2]:value||placeholder}
export function CompactTaskDates({task,disabled,late,onClick}:{task:Task,disabled:boolean,late:boolean,onClick:()=>void}){return <button type="button" className="task-dates-compact" disabled={disabled} aria-label="Editar datas" title={'Início: '+(task.start||'não definido')+' · Entrega: '+(task.due||'não definida')+(task.dueTime?' às '+task.dueTime:'')} onClick={onClick}><CalendarDays size={13}/><span>{compactTaskDate(task.start,'Início')}</span><span aria-hidden="true">→</span><span className={late?'compact-due is-overdue':'compact-due'}><CalendarDays size={13}/><strong>{compactTaskDate(task.due,'Entrega')}</strong>{task.dueTime&&<small>{task.dueTime}</small>}</span></button>}
export function CoverSpellingMenu({task,children}:{task:Task,children:ReactNode}){
 const [open,setOpen]=useState(false),root=useRef<HTMLDivElement>(null),menu=useRef<HTMLDivElement>(null);useCardPopover(open,setOpen,root,menu);
 if(!canShowSpellingPanel(task))return null;
 return <div className="cover-spelling-control" ref={root} onKeyDown={e=>{if(e.key==='Escape'&&open){e.preventDefault();e.stopPropagation();setOpen(false)}}}><button type="button" className={'cover-spelling-trigger'+(spellingFlagged(task)?' flagged':'')} aria-label="Abrir revisão automática" aria-expanded={open} onClick={()=>setOpen(!open)}><FileText size={15}/>Revisão automática{spellingFlagged(task)&&<span className="review-alert-dot" aria-label="Há alertas"/>}</button>{open&&<div ref={menu} popover="manual" className="cover-spelling-menu"><button type="button" className="cover-spelling-close" aria-label="Fechar revisão automática" onClick={()=>setOpen(false)}><X size={17}/></button>{children}</div>}</div>;
}
