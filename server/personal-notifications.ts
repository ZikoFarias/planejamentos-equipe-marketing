import {personalEvents,dailySummary,type PersonalEvent,type NotificationPersona,type NotificationTask} from '../app/personal-notifications';
import {teamAccounts} from '../app/team-auth';
import {readStatusConfig} from '../app/status-config';
type Member={email:string,role:string,persona:string};
const recipient=(member:Member)=>(member.persona||teamAccounts[member.email]||'') as NotificationPersona;
async function members(db:D1Database){return (await db.prepare("SELECT email,role,persona FROM marketing_members WHERE role IN ('administrador','editor','visualizador') ORDER BY email").all<Member>()).results.filter(member=>['luiz','farias','lucio','mateus'].includes(recipient(member)))}
function insert(db:D1Database,event:PersonalEvent,email:string,key:string,at:string){
 return db.prepare('INSERT OR IGNORE INTO marketing_notifications(event_key,email,kind,task_id,title,message,targets,created_at) VALUES(?,?,?,?,?,?,?,?)').bind(key,email.toLowerCase(),event.kind,event.taskId||null,event.title,event.message,JSON.stringify(event.targets||[]),at);
}
export async function drainNotificationChanges(db:D1Database){
 const changes=(await db.prepare('SELECT id,old_task,next_task,created_at FROM marketing_notification_changes ORDER BY id LIMIT 3').all<{id:number,old_task:string|null,next_task:string,created_at:string}>()).results;
 if(!changes.length)return 0;
 const people=await members(db),board=await db.prepare('SELECT status_config FROM marketing_board WHERE id=1').first<{status_config:string}>();
 const labels=readStatusConfig(board?.status_config).labels,statements:D1PreparedStatement[]=[];
 for(const change of changes){
  const old=change.old_task?JSON.parse(change.old_task) as NotificationTask:null,next=JSON.parse(change.next_task) as NotificationTask;
  for(const event of personalEvents(old,next,labels))for(const person of people)if(recipient(person)===event.recipient)statements.push(insert(db,event,person.email,'event:'+change.id+':'+event.kind+':'+person.email,change.created_at));
 }
 statements.push(db.prepare('DELETE FROM marketing_notification_changes WHERE id IN ('+changes.map(()=>'?').join(',')+')').bind(...changes.map(change=>change.id)));
 await db.batch(statements);return changes.length;
}
export function localNotificationDay(now:Date){
 const parts=new Intl.DateTimeFormat('en-CA',{timeZone:'America/Sao_Paulo',year:'numeric',month:'2-digit',day:'2-digit',hour:'2-digit',hourCycle:'h23'}).formatToParts(now);
 const value=(type:string)=>parts.find(part=>part.type===type)?.value||'';
 return {day:value('year')+'-'+value('month')+'-'+value('day'),hour:Number(value('hour'))};
}
export async function runDailyNotifications(db:D1Database,now=new Date()){
 const {day,hour}=localNotificationDay(now);if(hour<8)return false;
 if(await db.prepare('SELECT day FROM marketing_notification_days WHERE day=?').bind(day).first())return false;
 const board=await db.prepare('SELECT data,status_config FROM marketing_board WHERE id=1').first<{data:string,status_config:string}>();if(!board)return false;
 const people=await members(db),tasks=JSON.parse(board.data) as NotificationTask[],labels=readStatusConfig(board.status_config).labels,at=now.toISOString();
 const statements=people.map(person=>insert(db,dailySummary(recipient(person),tasks,day,labels),person.email,'daily:'+day+':'+person.email,at));
 statements.push(db.prepare('INSERT OR IGNORE INTO marketing_notification_days(day,created_at) VALUES(?,?)').bind(day,at));
 await db.batch(statements);return true;
}
export async function processPersonalNotifications(db:D1Database,now=new Date()){await drainNotificationChanges(db);await runDailyNotifications(db,now)}
