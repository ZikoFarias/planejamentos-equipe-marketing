'use client';
import {useEffect,useRef} from 'react';
import type {PointerEvent as ReactPointerEvent,MouseEvent as ReactMouseEvent} from 'react';
import {useCardDragVisual} from './card-drag-visual';
export function useCardPointerDrag(callbacks:{onStart:(id:string,height:number)=>void,onHover:(status:string)=>void,onEnd:()=>void,onDrop:(id:string,status:string,before?:string)=>void}){
 const visual=useCardDragVisual(),latest=useRef(callbacks);latest.current=callbacks;
 const cleanup=useRef<(()=>void)|null>(null),suppressClick=useRef(false),clickTimer=useRef<ReturnType<typeof setTimeout>|null>(null);
 function start(event:ReactPointerEvent<HTMLElement>,id:string){
  if(event.button!==0||!event.isPrimary)return;const target=event.target as HTMLElement;
  if(target.closest('input,textarea,select,a,[role=button],.profile-avatar')||target.closest('button:not(.card-open)'))return;
  cleanup.current?.();const card=event.currentTarget,origin={x:event.clientX,y:event.clientY},pointer=event.pointerId;let active=false,hover='';
  const locate=(x:number,y:number)=>{const el=document.elementFromPoint(x,y),column=el?.closest<HTMLElement>('.kanban [data-status]'),before=el?.closest<HTMLElement>('.task[data-task-id]');return{status:column?.dataset.status||'',before:before?.dataset.taskId}};
  const move=(e:PointerEvent)=>{if(e.pointerId!==pointer)return;if(!active&&Math.hypot(e.clientX-origin.x,e.clientY-origin.y)<6)return;if(!active){active=true;visual.begin(card,origin.x,origin.y);card.setPointerCapture(pointer);latest.current.onStart(id,card.getBoundingClientRect().height);suppressClick.current=true}e.preventDefault();visual.follow(e.clientX,e.clientY);const destination=locate(e.clientX,e.clientY);if(destination.status!==hover){hover=destination.status;latest.current.onHover(hover)}const board=card.closest('.kanban');if(board){const bounds=board.getBoundingClientRect();if(e.clientX>bounds.right-48)board.scrollBy(22,0);else if(e.clientX<bounds.left+48)board.scrollBy(-22,0);const body=document.elementFromPoint(e.clientX,e.clientY)?.closest('.column-body');if(body){const box=body.getBoundingClientRect();if(e.clientY>box.bottom-40)body.scrollBy(0,16);else if(e.clientY<box.top+40)body.scrollBy(0,-16)}}};
  const remove=()=>{document.removeEventListener('pointermove',move);document.removeEventListener('pointerup',finish);document.removeEventListener('pointercancel',cancel);document.removeEventListener('keydown',escape);window.removeEventListener('blur',cancel);visual.end();if(card.hasPointerCapture(pointer))card.releasePointerCapture(pointer);cleanup.current=null};
  const done=()=>{remove();if(active){latest.current.onEnd();if(clickTimer.current)clearTimeout(clickTimer.current);clickTimer.current=setTimeout(()=>{suppressClick.current=false},200)}};
  const finish=(e:PointerEvent)=>{if(e.pointerId!==pointer)return;const destination=locate(e.clientX,e.clientY);done();if(active&&destination.status)latest.current.onDrop(id,destination.status,destination.before)};
  const cancel=()=>done();const escape=(e:KeyboardEvent)=>{if(e.key==='Escape'){e.preventDefault();done()}};
  cleanup.current=remove;document.addEventListener('pointermove',move,{passive:false});document.addEventListener('pointerup',finish);document.addEventListener('pointercancel',cancel);document.addEventListener('keydown',escape);window.addEventListener('blur',cancel);
 }
 function captureClick(event:ReactMouseEvent){if(suppressClick.current){event.preventDefault();event.stopPropagation();suppressClick.current=false}}
 useEffect(()=>()=>{cleanup.current?.();if(clickTimer.current)clearTimeout(clickTimer.current)},[]);
 return{start,captureClick};
}
