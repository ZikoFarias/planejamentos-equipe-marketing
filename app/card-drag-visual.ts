'use client';
import {useEffect,useRef} from 'react';
export function useCardDragVisual(){
 const ghost=useRef<HTMLElement|null>(null),offset=useRef({x:0,y:0});
 function end(){ghost.current?.remove();ghost.current=null}
 function begin(card:HTMLElement,x:number,y:number){end();const box=card.getBoundingClientRect(),clone=card.cloneNode(true) as HTMLElement;clone.classList.remove('dragging');clone.classList.add('card-drag-preview');clone.removeAttribute('data-task-id');clone.removeAttribute('id');clone.setAttribute('aria-hidden','true');clone.inert=true;clone.querySelectorAll('[popover],.drag-handle').forEach(el=>el.remove());clone.querySelectorAll('[id]').forEach(el=>el.removeAttribute('id'));const style=getComputedStyle(card);clone.style.setProperty('--status',style.getPropertyValue('--status'));clone.style.setProperty('--status-ink',style.getPropertyValue('--status-ink'));clone.style.width=box.width+'px';clone.style.left=box.left+'px';clone.style.top=box.top+'px';document.body.appendChild(clone);ghost.current=clone;offset.current={x:x-box.left,y:y-box.top};return clone}
 function follow(x:number,y:number){const clone=ghost.current;if(clone){clone.style.left=x-offset.current.x+'px';clone.style.top=y-offset.current.y+'px'}}
 useEffect(()=>()=>{ghost.current?.remove()},[]);
 return {begin,follow,end};
}
export function settleCard(id:string){requestAnimationFrame(()=>requestAnimationFrame(()=>{const card=Array.from(document.querySelectorAll<HTMLElement>('.task[data-task-id]')).find(card=>card.dataset.taskId===id);if(!card||window.matchMedia('(prefers-reduced-motion: reduce)').matches)return;card.animate([{transform:'rotate(2deg) scale(1.025)'},{transform:'rotate(-.6deg) scale(1.005)',offset:.65},{transform:'rotate(0deg) scale(1)'}],{duration:230,easing:'ease-out'})}))}
