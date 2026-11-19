import type {Task} from './model';
export const reactionEmojis=['👍','❤️','😂','👏','🎉','😮','😢','✅'] as const;
export function changeComment(task:Task,email:string,body:{id:string;action:string;text?:unknown;emoji?:unknown},now=Date.now()):Task{
 const comment=task.comments.find(item=>item.id===body.id);
 if(!comment)throw Error('Comentário indisponível.');
 if(body.action==='edit'){
  if(comment.by!==email||now-Date.parse(comment.at)>=60000||now<Date.parse(comment.at))throw Error('A edição é permitida ao autor durante 1 minuto após o envio.');
  if(typeof body.text!=='string'||body.text.length>10000||!body.text.trim()&&!comment.attachments?.length)throw Error('Informe um comentário válido.');
  return {...task,comments:task.comments.map(item=>item===comment?{...item,text:(body.text as string).trim(),editedAt:new Date(now).toISOString()}:item)};
 }
 if(body.action!=='react'||!reactionEmojis.includes(body.emoji as any))throw Error('Reação inválida.');
 const reactions={...comment.reactions},emoji=body.emoji as string,people=reactions[emoji]||[];
 reactions[emoji]=people.includes(email)?people.filter(person=>person!==email):[...people,email];
 if(!reactions[emoji].length)delete reactions[emoji];
 return {...task,comments:task.comments.map(item=>item===comment?{...item,reactions}:item)};
}
