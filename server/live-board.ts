import {parseLiveActivity,type LiveEvent} from '../app/live-board-events';

type Peer = {id:string; email:string; name:string; expires:number; lastSent:number; editor:boolean};

export class LiveBoard {
 constructor(private state:DurableObjectState) {}

 fetch(request:Request):Response {
  if(request.method==='POST'){
   this.broadcast({kind:'board-changed'});
   return new Response(null,{status:204});
  }
  if(request.headers.get('Upgrade')?.toLowerCase()!=='websocket')return new Response(null,{status:426});
  const email=request.headers.get('X-Team-Email'),name=request.headers.get('X-Team-Name');
  if(!email||!name)return new Response(null,{status:403});
  const {0:client,1:server}=new WebSocketPair();
  this.state.acceptWebSocket(server);
  server.serializeAttachment({id:crypto.randomUUID(),email,name:decodeURIComponent(name),expires:Date.now()+6*60_000,lastSent:0,editor:request.headers.get('X-Team-Role')!=='visualizador'} satisfies Peer);
  return new Response(null,{status:101,webSocket:client});
 }

 webSocketMessage(socket:WebSocket,raw:string|ArrayBuffer){
  const peer=socket.deserializeAttachment() as Peer;
  const now=Date.now();
  if(now>=peer.expires){socket.close(1008,'Sessão expirada');return;}
  const activity=parseLiveActivity(raw);
  if(!peer.editor||!activity)return;
  if(activity.kind!=='idle'&&now-peer.lastSent<45)return;
  peer.lastSent=now;
  socket.serializeAttachment(peer);
  this.broadcast({...activity,sender:peer.id,name:peer.name},peer.email);
 }

 webSocketClose(socket:WebSocket,code:number){socket.close(code===1006?1000:code);}

 private broadcast(event:LiveEvent,exceptEmail?:string){
  const payload=JSON.stringify(event),now=Date.now();
  for(const socket of this.state.getWebSockets()){
   const peer=socket.deserializeAttachment() as Peer;
   if(now>=peer.expires){socket.close(1008,'Sessão expirada');continue;}
   if(peer.email!==exceptEmail&&socket.readyState===WebSocket.OPEN){
    try{socket.send(payload);}catch{socket.close(1011,'Conexão interrompida');}
   }
  }
 }
}
