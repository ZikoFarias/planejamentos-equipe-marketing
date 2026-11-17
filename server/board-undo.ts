import type {Task} from '../app/model';
import type {Actor} from '../app/permissions';

type Row={revision:number;data:string;status_config:string|null};
type TeamActor=Actor&{user:{email:string;displayName:string}};
type Change={id:string;before?:Task;after?:Task};
type Patch={changes:Change[];beforeOrder?:string[];afterOrder?:string[];config?:[string|null,string|null]};
const equal=(a:unknown,b:unknown)=>JSON.stringify(a)===JSON.stringify(b);
const content=(task:Task|undefined)=>task&&{...task,history:[]};
const json=(body:unknown,status=200)=>Response.json(body,{status,headers:{'Cache-Control':'no-store'}});
export const undoableRoutes=new Set(['/api/board','/api/approval','/api/adjustments','/api/captions','/api/comments','/api/weekly','/api/statuses','/api/labels','/api/drive/central/upload']);
export function boardUndoSnapshot(db:D1Database){return db.prepare('SELECT data,revision,status_config FROM marketing_board WHERE id=1').first<Row>();}

export function boardPatch(before:Task[],after:Task[],beforeConfig:string|null,afterConfig:string|null):Patch{
 const old=new Map(before.map(t=>[t.id,t])),next=new Map(after.map(t=>[t.id,t]));
 const beforeOrder=[...old.keys()],afterOrder=[...next.keys()];
 const changes:Change[]=[];
 for(const id of new Set([...beforeOrder,...afterOrder])){
  const a=old.get(id),b=next.get(id);
  if(!equal(content(a),content(b)))changes.push({id,before:a,after:b});
 }
 return {changes,...(!equal(beforeOrder,afterOrder)?{beforeOrder,afterOrder}:{}),...(beforeConfig!==afterConfig?{config:[beforeConfig,afterConfig]}:{})};
}

export function applyBoardPatch(tasks:Task[],patch:Patch,redo:boolean){
 const fromOrder=redo?patch.beforeOrder:patch.afterOrder,toOrder=redo?patch.afterOrder:patch.beforeOrder;
 const current=new Map(tasks.map(t=>[t.id,t]));
 const actorChangedIds=new Set(patch.changes.map(change=>change.id));
 if(fromOrder&&toOrder){
  const fromIds=new Set(fromOrder),toIds=new Set(toOrder);
  const common=new Set(fromOrder.filter(id=>toIds.has(id)&&current.has(id)));
  if(!equal([...current.keys()].filter(id=>common.has(id)),fromOrder.filter(id=>common.has(id))))throw Error('Outra pessoa mudou a ordem dos cartões.');
  if(patch.changes.some(change=>!fromIds.has(change.id)&&current.has(change.id)))throw Error('Um cartão desta ação já está no quadro.');
 }
 for(const change of patch.changes){
  const from=redo?change.before:change.after,to=redo?change.after:change.before,task=current.get(change.id);
  if(!from||!to){
   if(!equal(content(task),content(from)))throw Error('Um cartão desta ação foi alterado depois.');
   if(to)current.set(change.id,to);else current.delete(change.id);
   continue;
  }
  if(!task)throw Error('Um cartão desta ação foi removido depois.');
  const updated={...task};
  for(const key of new Set([...Object.keys(from),...Object.keys(to)]) as Set<keyof Task>){
   if(key==='history'||equal(from[key],to[key]))continue;
   if(!equal(from[key],task[key]))throw Error('Outra pessoa já alterou um dos campos desta ação.');
   if(to[key]===undefined)delete updated[key];else Object.assign(updated,{[key]:to[key]});
  }
  current.set(change.id,updated);
 }
 if(!toOrder)return [...current.values()];
 const ordered=toOrder.filter(id=>current.has(id)),known=new Set(ordered);
 const result:Task[]=[];
 for(const previous of tasks){
  if(!current.has(previous.id))continue;
  if(known.has(previous.id)){
   const id=ordered.shift();if(id)result.push(current.get(id)!);
  }else if(!actorChangedIds.has(previous.id))result.push(current.get(previous.id)!);
 }
 return [...result,...ordered.map(id=>current.get(id)!)];
}

export async function rememberBoardAction(db:D1Database,before:Row,revision:number,email:string){
 if(revision!==before.revision+1)return;
 const after=await boardUndoSnapshot(db);
 if(after?.revision!==revision)return;
 const patch=boardPatch(JSON.parse(before.data),JSON.parse(after.data),before.status_config,after.status_config);
 if(!patch.changes.length&&!patch.beforeOrder&&!patch.config)return;
 const payload=JSON.stringify(patch);
 // Leave Drive files alone and retain a bounded, private history per account.
 if(new TextEncoder().encode(payload).length>500_000)return;
 await db.batch([
  db.prepare('INSERT OR IGNORE INTO marketing_board_undo(revision,email,patch) VALUES(?,?,?)').bind(revision,email,payload),
  db.prepare("DELETE FROM marketing_board_undo WHERE email=? AND state='undone' AND undone_at<?").bind(email,revision),
  db.prepare('DELETE FROM marketing_board_undo WHERE email=? AND revision NOT IN (SELECT revision FROM marketing_board_undo WHERE email=? ORDER BY revision DESC LIMIT 10)').bind(email,email),
 ]);
}

export async function handleBoardUndo(req:Request,db:D1Database,actor:TeamActor|null){
 if(req.method!=='POST'||req.headers.get('Origin')!==new URL(req.url).origin)return json({error:'Solicitação inválida.'},403);
 if(!actor?.role)return json({error:'Entre novamente.'},401);
 const body=await req.json().catch(()=>null) as {redo?:boolean}|null;
 if(typeof body?.redo!=='boolean')return json({error:'Ação inválida.'},400);
 const {redo}=body,email=actor.user.email;
 try{
  const row=await boardUndoSnapshot(db);if(!row)return json({error:'Quadro indisponível.'},503);
  const state=redo?'undone':'applied';
  const item=await db.prepare(`SELECT revision,patch FROM marketing_board_undo WHERE email=? AND state=? ORDER BY ${redo?'undone_at':'revision'} DESC LIMIT 1`).bind(email,state).first<{revision:number;patch:string}>();
  if(!item)return json({empty:true});
  const patch=JSON.parse(item.patch) as Patch;
  let tasks:Task[];
  try{tasks=applyBoardPatch(JSON.parse(row.data),patch,redo);}catch(error){return json({error:(error as Error).message},409);}
  const config=patch.config?patch.config[redo?1:0]:row.status_config;
  if(patch.config&&row.status_config!==patch.config[redo?0:1])return json({error:'A configuração do quadro foi alterada depois.'},409);
  const result=await db.batch([
   db.prepare('UPDATE marketing_board SET data=?,status_config=?,revision=revision+1 WHERE id=1 AND revision=? AND EXISTS(SELECT 1 FROM marketing_board_undo WHERE revision=? AND email=? AND state=?)').bind(JSON.stringify(tasks),config,row.revision,item.revision,email,state),
   db.prepare('UPDATE marketing_board_undo SET state=?,undone_at=? WHERE revision=? AND email=? AND state=? AND changes()=1').bind(redo?'applied':'undone',redo?null:row.revision+1,item.revision,email,state),
  ]);
  if(!result[0]?.meta.changes)return json({error:'O quadro mudou. Tente novamente.'},409);
  return json({revision:row.revision+1});
 }catch{return json({error:'Não foi possível acessar o histórico. Tente novamente.'},503);}
}
