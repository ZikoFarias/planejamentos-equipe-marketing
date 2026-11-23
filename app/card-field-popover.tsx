'use client';
import {useEffect,useLayoutEffect,useRef,type ReactNode} from 'react';
export function CardFieldPopover({field,anchor,onClose,children}:{field:string,anchor:HTMLElement|null,onClose:()=>void,children:ReactNode}){
 const ref=useRef<HTMLDivElement>(null),close=useRef(onClose);close.current=onClose;
 useLayoutEffect(()=>{
  const panel=ref.current;if(!panel)return;let box=anchor?.getBoundingClientRect();
  function place(){if(!panel)return;if(anchor?.isConnected)box=anchor.getBoundingClientRect();const width=panel.offsetWidth,height=panel.offsetHeight,left=box?.left??16;let top=(box?.bottom??16)+6;if(top+height>window.innerHeight-8&&box)top=box.top-height-6;panel.style.left=Math.max(8,Math.min(left,window.innerWidth-width-8))+'px';panel.style.top=Math.max(8,Math.min(top,window.innerHeight-height-8))+'px'}
  panel.showPopover?.();place();panel.querySelector<HTMLElement>('button:not(:disabled),input:not(:disabled),select:not(:disabled)')?.focus();
  const observer=typeof ResizeObserver==='undefined'?null:new ResizeObserver(place);observer?.observe(panel);window.addEventListener('resize',place);document.addEventListener('scroll',place,true);
  return()=>{observer?.disconnect();panel.hidePopover?.();window.removeEventListener('resize',place);document.removeEventListener('scroll',place,true);if(anchor?.isConnected)anchor.focus()};
 },[anchor,field]);
 useEffect(()=>{const outside=(event:PointerEvent)=>{const target=event.target as Node;if(!ref.current?.contains(target)&&!anchor?.contains(target))close.current()};document.addEventListener('pointerdown',outside);return()=>document.removeEventListener('pointerdown',outside)},[anchor]);
 return <div ref={ref} popover="manual" role="dialog" aria-modal="false" aria-label={'Editar '+({tags:'etiquetas',dates:'datas',status:'status',priority:'prioridade'}[field]||field)} className={'card-editor card-field-popover card-editor-'+field} onKeyDown={e=>{if(e.key==='Escape'){e.preventDefault();e.stopPropagation();close.current()}}}>{children}</div>;
}
