'use client';
import {useEffect,useRef} from 'react';
export function useCardDragVisual(){
 const ghost=useRef<HTMLElement|null>(null),offset=useRef({x:0,y:0}),landingCleanup=useRef<(()=>void)|null>(null),animations=useRef(new Set<Animation>());
 function end(){const cleanup=landingCleanup.current;landingCleanup.current=null;cleanup?.();for(const animation of animations.current)animation.cancel();animations.current.clear();ghost.current?.remove();ghost.current=null}
 function begin(card:HTMLElement,x:number,y:number){end();const box=card.getBoundingClientRect(),clone=card.cloneNode(true) as HTMLElement;clone.classList.remove('dragging');clone.classList.add('card-drag-preview');clone.removeAttribute('data-task-id');clone.removeAttribute('id');clone.setAttribute('aria-hidden','true');clone.inert=true;clone.querySelectorAll('[popover],.drag-handle').forEach(el=>el.remove());clone.querySelectorAll('[id]').forEach(el=>el.removeAttribute('id'));const style=getComputedStyle(card);clone.style.setProperty('--status',style.getPropertyValue('--status'));clone.style.setProperty('--status-ink',style.getPropertyValue('--status-ink'));clone.style.width=box.width+'px';clone.style.left=box.left+'px';clone.style.top=box.top+'px';document.body.appendChild(clone);ghost.current=clone;offset.current={x:x-box.left,y:y-box.top};return clone}
 function follow(x:number,y:number){const clone=ghost.current;if(clone){clone.style.left=x-offset.current.x+'px';clone.style.top=y-offset.current.y+'px'}}
 function releaseTo(target:{left:number,top:number}):Promise<void>{
  const clone=ghost.current;if(!clone)return Promise.resolve();const dx=target.left-parseFloat(clone.style.left),dy=target.top-parseFloat(clone.style.top);
  const finish=()=>{if(ghost.current===clone){clone.style.left=target.left+'px';clone.style.top=target.top+'px';clone.style.transform='none'}};
  if(window.matchMedia('(prefers-reduced-motion: reduce)').matches||typeof clone.animate!=='function'){finish();return Promise.resolve()}
  try{const animation=clone.animate([{transform:clone.style.transform||'rotate(-10deg) scale(1.025)'},{transform:'translate('+dx+'px,'+dy+'px) rotate(0deg) scale(1)'}],{duration:320,easing:'cubic-bezier(.2,.8,.2,1)',fill:'forwards'});animations.current.add(animation);return animation.finished.then(()=>{finish();animations.current.delete(animation);animation.cancel()},()=>{animations.current.delete(animation)})}catch{finish();return Promise.resolve()}
 }
 function land(id:string,flight:Promise<void>){const clone=ghost.current;if(!clone)return;requestAnimationFrame(()=>requestAnimationFrame(()=>{if(ghost.current!==clone)return;const card=Array.from(document.querySelectorAll<HTMLElement>('.task[data-task-id]')).find(card=>card.dataset.taskId===id),visibility=card?.style.visibility;if(card){card.style.visibility='hidden';landingCleanup.current=()=>{card.style.visibility=visibility||''}}
  flight.then(async()=>{if(ghost.current!==clone)return;if(card){const target=card.getBoundingClientRect();if(Math.abs(target.left-parseFloat(clone.style.left))>2||Math.abs(target.top-parseFloat(clone.style.top))>2)await releaseTo(target)}if(ghost.current===clone)end()})
 }))}
 useEffect(()=>()=>{const cleanup=landingCleanup.current;landingCleanup.current=null;cleanup?.();for(const animation of animations.current)animation.cancel();animations.current.clear();ghost.current?.remove()},[]);
 return {begin,follow,end,releaseTo,land};
}
