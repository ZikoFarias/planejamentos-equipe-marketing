'use client';
import {useEffect,useRef,useState,type ReactNode} from 'react';
import {createPortal} from 'react-dom';
export function NotificationStack({active,children,floating}:{active:boolean,children:ReactNode,floating?:ReactNode}){
 const [host,setHost]=useState<HTMLElement|null>(null),layer=useRef<HTMLDivElement>(null),dialogs=useRef<HTMLDialogElement[]>([]);
 useEffect(()=>{
  function update(preferred?:HTMLDialogElement){
   const open=Array.from(document.querySelectorAll<HTMLDialogElement>('dialog[open]'));
   dialogs.current=dialogs.current.filter(dialog=>open.includes(dialog));
   for(const dialog of open)if(!dialogs.current.includes(dialog))dialogs.current.push(dialog);
   if(preferred?.open){dialogs.current=dialogs.current.filter(dialog=>dialog!==preferred);dialogs.current.push(preferred)}
   setHost(dialogs.current.at(-1)||document.body);
  }
  function front(){
   const el=layer.current;if(!el||!el.children.length)return;
   try{el.hidePopover?.();el.showPopover?.()}catch{}
  }
  function toggle(event:Event){
   if(event.target===layer.current)return;
   const target=event.target;
   if(target instanceof HTMLDialogElement)update(target.open?target:undefined);
   else if(target instanceof HTMLElement&&target.hasAttribute('popover')&&(event as ToggleEvent).newState==='open')front();
  }
  const observer=new MutationObserver(records=>{if(records.some(record=>record.type==='attributes'&&record.target instanceof HTMLDialogElement||record.type==='childList'&&[...record.addedNodes,...record.removedNodes].some(node=>node instanceof Element&&(node.matches('dialog')||!!node.querySelector('dialog')))))update()});
  observer.observe(document.body,{subtree:true,childList:true,attributes:true,attributeFilter:['open']});
  document.addEventListener('toggle',toggle,true);update();
  return()=>{observer.disconnect();document.removeEventListener('toggle',toggle,true)};
 },[]);
 useEffect(()=>{
  const el=layer.current;if(!el)return;
  if(!active){el.hidePopover?.();return}
  if(typeof el.showPopover==='function'){try{el.showPopover()}catch{}}
  else el.setAttribute('data-fallback','true');
 },[host,active]);
 if(!host||!active)return null;
 return createPortal(<div ref={layer} popover="manual" className="notification-stack" aria-label="Notificações" onClick={e=>e.stopPropagation()}><div className="notification-corner">{children}</div>{floating}</div>,host);
}
