import {getActor} from '../../access';
import {processPersonalNotifications} from '../../../server/personal-notifications';
export const dynamic='force-dynamic';
const json=(data:unknown,status=200)=>Response.json(data,{status,headers:{'Cache-Control':'private, no-store'}});
export async function GET(req:Request){
 try{
  const actor=await getActor();if(!actor)return json({error:'Entre novamente para ver suas notificações.'},401);
  const before=new URL(req.url).searchParams.get('before');if(before!==null&&(!/^\d+$/.test(before)||!Number.isSafeInteger(Number(before))||Number(before)<1))return json({error:'Página inválida.'},400);
  await processPersonalNotifications(actor.db);
  const email=actor.user.email.toLowerCase(),query=actor.db.prepare('SELECT id,kind,task_id,title,message,targets,created_at,read_at,seen_at FROM marketing_notifications WHERE email=?'+(before?' AND id<?':'')+' ORDER BY id DESC LIMIT 51');
  const rows=(await (before?query.bind(email,Number(before)):query.bind(email)).all<any>()).results;
  const unread=await actor.db.prepare('SELECT count(*) AS count FROM marketing_notifications WHERE email=? AND read_at IS NULL').bind(email).first<{count:number}>();
  const page=rows.slice(0,50);
  return json({items:page.map(row=>({id:row.id,kind:row.kind,taskId:row.task_id||undefined,title:row.title,message:row.message,targets:JSON.parse(row.targets),createdAt:row.created_at,readAt:row.read_at,seenAt:row.seen_at})),unread:unread?.count||0,next:rows.length>50?page.at(-1).id:null});
 }catch{return json({error:'Não foi possível carregar suas notificações.'},500)}
}
export async function POST(req:Request){
 try{
  if(req.headers.get('origin')!==new URL(req.url).origin)return json({error:'Origem inválida.'},403);
  const actor=await getActor();if(!actor)return json({error:'Entre novamente para atualizar suas notificações.'},401);
  const body:any=await req.json(),email=actor.user.email.toLowerCase(),at=new Date().toISOString();
  if(!['read','seen','read-all'].includes(body.action))return json({error:'Ação inválida.'},400);
  if(body.action==='read-all')await actor.db.prepare('UPDATE marketing_notifications SET read_at=coalesce(read_at,?),seen_at=coalesce(seen_at,?) WHERE email=? AND read_at IS NULL').bind(at,at,email).run();
  else{
   if(!Array.isArray(body.ids)||!body.ids.length||body.ids.length>50||body.ids.some((id:unknown)=>!Number.isSafeInteger(id)||Number(id)<1))return json({error:'Notificações inválidas.'},400);
   const read=body.action==='read',sql='UPDATE marketing_notifications SET '+(read?'read_at=coalesce(read_at,?),':'')+'seen_at=coalesce(seen_at,?) WHERE email=? AND id IN ('+body.ids.map(()=>'?').join(',')+')';
   await actor.db.prepare(sql).bind(...(read?[at]:[]),at,email,...body.ids).run();
  }
  const unread=await actor.db.prepare('SELECT count(*) AS count FROM marketing_notifications WHERE email=? AND read_at IS NULL').bind(email).first<{count:number}>();
  return json({ok:true,unread:unread?.count||0});
 }catch{return json({error:'Não foi possível atualizar suas notificações.'},500)}
}
