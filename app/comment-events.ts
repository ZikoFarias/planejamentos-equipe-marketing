import type {Task} from './model';

export function commentEvents(task:Task){
 const events=task.comments.map(comment=>({...comment,kind:'comment'}));
 const shown=new Set(task.comments.flatMap(comment=>(comment.attachments||[]).map(file=>file.url)));
 for(const activity of [...task.history].reverse()){
  const attachments=(activity.attachments||[]).filter(file=>task.attachments.some(current=>current.url===file.url)&&!shown.has(file.url));
  if(!attachments.length)continue;
  attachments.forEach(file=>shown.add(file.url));
  events.push({...activity,text:'',attachments,kind:'comment'});
 }
 for(const file of task.attachments){
  if(shown.has(file.url))continue;
  shown.add(file.url);
  events.push({text:'',by:'Autoria não registrada',at:file.drive?.savedAt||'',attachments:[file],kind:'comment'});
 }
 return events.sort((a,b)=>(Date.parse(a.at)||0)-(Date.parse(b.at)||0));
}
