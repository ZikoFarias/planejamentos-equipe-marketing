'use client';
import {useEffect,useRef,useState} from 'react';
import type {PersonalNotification} from './personal-notifications';
type State={items:PersonalNotification[],unread:number,next:number|null};
const empty:State={items:[],unread:0,next:null};
export function usePersonalNotifications(email:string,enabled:boolean,onError:(message:string)=>void){
 const [owner,setOwner]=useState(email),[data,setData]=useState<State>(empty),[panelOpen,setPanelOpen]=useState(false),[bubble,setBubble]=useState<PersonalNotification|null>(null),[loading,setLoading]=useState(false),[moreBusy,setMoreBusy]=useState(false),[error,setError]=useState('');
 const currentEmail=useRef(email),errorHandler=useRef(onError),panel=useRef(panelOpen),shown=useRef(new Set<number>()),seenWrites=useRef(new Set<number>()),version=useRef(0),refreshRef=useRef<()=>Promise<void>>(async()=>{});
 currentEmail.current=email;errorHandler.current=onError;panel.current=panelOpen;
 useEffect(()=>{
  setOwner(email);setData(empty);setBubble(null);setError('');setPanelOpen(false);shown.current.clear();seenWrites.current.clear();
  if(!enabled||!email)return;
  let alive=true,running=false;const controller=new AbortController();setLoading(true);
  const refresh=async()=>{
   if(!alive||running||document.visibilityState==='hidden')return;running=true;const stamp=version.current;
   try{
    const response=await fetch('/api/notifications',{cache:'no-store',signal:controller.signal});const value=await response.json() as State&{error?:string};if(!response.ok)throw Error(value.error||'Não foi possível carregar as notificações.');
    if(!alive||stamp!==version.current)return;
    setError('');setData(current=>{const items=panel.current?[...value.items,...current.items.filter(item=>!value.items.some((next:PersonalNotification)=>next.id===item.id))].sort((a,b)=>b.id-a.id):value.items;const next={items,unread:value.unread,next:panel.current&&current.items.length>50?current.next:value.next};return JSON.stringify(current)===JSON.stringify(next)?current:next});
    if(!panel.current){const fresh=(value.items as PersonalNotification[]).find(item=>!item.seenAt&&!shown.current.has(item.id));if(fresh){for(const item of value.items)if(!item.seenAt)shown.current.add(item.id);setBubble(fresh)}}
   }catch(e){if(alive&&!controller.signal.aborted)setError(e instanceof Error?e.message:'Notificações indisponíveis.')}
   finally{running=false;if(alive)setLoading(false)}
  };
  refreshRef.current=refresh;void refresh();
  const timer=setInterval(()=>{void refresh()},5000),wake=()=>{void refresh()};
  window.addEventListener('focus',wake);document.addEventListener('visibilitychange',wake);
  return()=>{alive=false;controller.abort();clearInterval(timer);window.removeEventListener('focus',wake);document.removeEventListener('visibilitychange',wake)};
 },[email,enabled]);
 async function mark(action:'seen'|'read'|'read-all',ids:number[]=[]){
  if(action!=='read-all'&&!ids.length)return;const owner=email;version.current++;
  try{
   const response=await fetch('/api/notifications',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({action,ids:ids.slice(0,50)})}),value=await response.json() as {unread:number,error?:string};
   if(!response.ok)throw Error(value.error||'Não foi possível atualizar as notificações.');if(owner!==currentEmail.current)return;
   const at=new Date().toISOString(),selected=new Set(ids);
   setData(current=>({...current,unread:action==='seen'?current.unread:value.unread,items:current.items.map(item=>action==='read-all'||selected.has(item.id)?{...item,seenAt:item.seenAt||at,readAt:action==='seen'?item.readAt:item.readAt||at}:item)}));
  }catch(e){errorHandler.current(e instanceof Error?e.message:'Não foi possível atualizar as notificações.');throw e}
  finally{version.current++}
 }
 function dismissBubble(){
  setBubble(null);const ids=data.items.filter(item=>!item.seenAt).slice(0,50).map(item=>item.id);for(const id of ids)shown.current.add(id);
  void mark('seen',ids).catch(()=>{});
 }
 const dismissRef=useRef(dismissBubble);dismissRef.current=dismissBubble;
 useEffect(()=>{if(!bubble)return;let timer:ReturnType<typeof setTimeout>|undefined;const visible=()=>{if(timer)clearTimeout(timer);if(document.visibilityState!=='hidden')timer=setTimeout(()=>dismissRef.current(),8000)};visible();document.addEventListener('visibilitychange',visible);return()=>{if(timer)clearTimeout(timer);document.removeEventListener('visibilitychange',visible)}},[bubble?.id]);
 useEffect(()=>{
  if(!panelOpen)return;setBubble(null);
  const ids=data.items.filter(item=>!item.seenAt&&!seenWrites.current.has(item.id)).slice(0,50).map(item=>item.id);
  if(!ids.length)return;for(const id of ids){seenWrites.current.add(id);shown.current.add(id)}
  void mark('seen',ids).catch(()=>{for(const id of ids)seenWrites.current.delete(id)});
 },[panelOpen,data.items]);
 async function loadMore(){
  if(!data.next||moreBusy)return;const owner=email;setMoreBusy(true);
  try{
   const response=await fetch('/api/notifications?before='+data.next,{cache:'no-store'}),value=await response.json() as State&{error?:string};if(!response.ok)throw Error(value.error);if(owner!==currentEmail.current)return;
   setData(current=>({...current,items:[...current.items,...value.items.filter((item:PersonalNotification)=>!current.items.some(old=>old.id===item.id))],next:value.next,unread:value.unread}));
  }catch(e){errorHandler.current(e instanceof Error?e.message:'Não foi possível carregar o histórico.')}finally{setMoreBusy(false)}
 }
 const visible=enabled&&owner===email;
 return {...(visible?data:empty),panelOpen:visible&&panelOpen,bubble:visible?bubble:null,loading,moreBusy,error,openPanel:()=>{setPanelOpen(true);setBubble(null);void refreshRef.current()},closePanel:()=>setPanelOpen(false),dismissBubble,loadMore,markAll:async()=>{await mark('read-all');setBubble(null)},read:async(id:number)=>{await mark('read',[id]);setBubble(null)},refresh:()=>refreshRef.current()};
}
