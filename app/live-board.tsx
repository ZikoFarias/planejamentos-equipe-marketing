'use client';

import {useEffect,useRef,useState,type RefObject} from 'react';
import {createPortal} from 'react-dom';
import type {Area} from './permissions';
import type {Task} from './model';
import {ProfileAvatar,profileName} from './profile-avatar';
import {AttachmentPreview} from './attachment-preview';
import {coverFor} from './media';
import {spellingFlagged} from './spelling';
import type {LiveActivity,LiveEvent} from './live-board-events';

type Presence = LiveActivity & {sender:string; name:string; seen:number};

export function useLiveBoard(enabled:boolean){
 const socket=useRef<WebSocket|null>(null);
 const [events]=useState(()=>new EventTarget());
 const drag=useRef<Extract<LiveActivity,{kind:'drag'}>|null>(null);
 const sending=useRef('');
 const lastDrag=useRef(0),lastTyping=useRef({id:'',time:0});

 function send(activity:LiveActivity){
  if(socket.current?.readyState===WebSocket.OPEN)socket.current.send(JSON.stringify(activity));
 }

 useEffect(()=>{
  if(!enabled)return;
  let stopped=false,retry=1000,reconnect:ReturnType<typeof setTimeout>|undefined,renew:ReturnType<typeof setTimeout>|undefined;
  function connect(){
   if(stopped)return;
   const url=new URL('/api/live-board',location.href);
   url.protocol=location.protocol==='https:'?'wss:':'ws:';
   const connection=new WebSocket(url);
   socket.current=connection;
   connection.onopen=()=>{
    retry=1000;
    renew=setTimeout(()=>connection.close(),5*60_000);
    window.dispatchEvent(new Event('marketing-live-change'));
   };
   connection.onmessage=message=>{
    const event=JSON.parse(message.data) as LiveEvent;
    if(event.kind==='board-changed')window.dispatchEvent(new Event('marketing-live-change'));
    else events.dispatchEvent(new CustomEvent('presence',{detail:event}));
   };
   connection.onclose=()=>{
    clearTimeout(renew);
    if(!stopped)reconnect=setTimeout(connect,retry);
    retry=Math.min(retry*2,30000);
   };
  }
  connect();
  const heartbeat=setInterval(()=>{
   if(drag.current)send(drag.current);
   if(sending.current)send({kind:'sending',taskId:sending.current});
  },2000);
  return()=>{
   stopped=true;
   clearTimeout(reconnect);
   clearTimeout(renew);
   clearInterval(heartbeat);
   socket.current?.close();
   socket.current=null;
  };
 },[enabled,events]);

 return {
  events,
  move(taskId:string,area:Area,x:number,y:number,bounds:DOMRect|undefined){
   if(!bounds?.width||!bounds.height)return;
   const clamp=(value:number)=>Math.max(0,Math.min(1,value));
   drag.current={kind:'drag',taskId,area,x:clamp((x-bounds.left)/bounds.width),y:clamp((y-bounds.top)/bounds.height)};
   const now=Date.now();
   if(now-lastDrag.current>=60){lastDrag.current=now;send(drag.current);}
  },
  stopDrag(taskId:string){drag.current=null;lastDrag.current=0;send({kind:'idle',taskId});},
  type(taskId:string,text:string){
   const now=Date.now();
   if(!text){lastTyping.current={id:'',time:0};send({kind:'idle',taskId});return;}
   if(lastTyping.current.id!==taskId||now-lastTyping.current.time>=1000){
    lastTyping.current={id:taskId,time:now};send({kind:'typing',taskId});
   }
  },
  startSending(taskId:string){sending.current=taskId;send({kind:'sending',taskId});},
  stopSending(taskId:string){sending.current='';send({kind:'idle',taskId});},
 };
}

function usePresence(events:EventTarget,scope:{area:Area}|{taskId:string}){
 const [peers,setPeers]=useState<Presence[]>([]);
 const area='area' in scope?scope.area:undefined;
 const taskId='taskId' in scope?scope.taskId:undefined;
 useEffect(()=>{
  function receive(message:Event){
   const event=(message as CustomEvent<Presence>).detail;
   if(event.kind==='idle'){
    setPeers(current=>current.some(peer=>peer.sender===event.sender&&peer.taskId===event.taskId)?current.filter(peer=>peer.sender!==event.sender||peer.taskId!==event.taskId):current);
    return;
   }
   if(event.kind==='drag'?event.area!==area:event.taskId!==taskId)return;
   setPeers(current=>[...current.filter(peer=>peer.sender!==event.sender),{...event,seen:Date.now()}]);
  }
  events.addEventListener('presence',receive);
  const timer=setInterval(()=>{
   const cutoff=Date.now()-4500;
   setPeers(current=>current.some(peer=>peer.seen<cutoff)?current.filter(peer=>peer.seen>=cutoff):current);
  },500);
  return()=>{events.removeEventListener('presence',receive);clearInterval(timer);};
 },[events,area,taskId]);
 return peers;
}

export function LiveCardDrags({events,area,board,tasks}:{events:EventTarget;area:Area;board:RefObject<HTMLDivElement|null>;tasks:Task[]}){
 const peers=usePresence(events,{area});
 if(!peers.length)return null;
 const bounds=board.current?.getBoundingClientRect();
 if(!bounds?.width||!bounds.height)return null;
 return createPortal(<div className="live-card-drags" aria-hidden="true" inert>
  {peers.map(peer=>{
   if(peer.kind!=='drag')return null;
   const task=tasks.find(item=>item.id===peer.taskId);
   if(!task)return null;
   const cover=coverFor(task);
   return <div className="live-card-drag" key={peer.sender} style={{left:bounds.left+peer.x*bounds.width,top:bounds.top+peer.y*bounds.height}}>
    <span><ProfileAvatar name={peer.name}/>{profileName(peer.name)}</span>
    {cover&&<div className={'live-card-cover'+(spellingFlagged(task)?' spelling-blurred':'')}><AttachmentPreview key={cover.url} attachment={cover} compact/></div>}
    <strong>{task.title}</strong>
   </div>;
  })}
 </div>,document.body);
}

export function LiveCommentActivity({events,taskId}:{events:EventTarget;taskId:string}){
 const peers=usePresence(events,{taskId});
 if(!peers.length)return null;
 return <div className="live-comment-activity" role="status">
  {peers.map(peer=><div key={peer.sender}>
   <ProfileAvatar name={peer.name}/>
   <span>{profileName(peer.name)} {peer.kind==='sending'?'está enviando um comentário':'está digitando'}</span>
   <span className="live-comment-dots" aria-hidden="true"><i/><i/><i/></span>
  </div>)}
 </div>;
}
