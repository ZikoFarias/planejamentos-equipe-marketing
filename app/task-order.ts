import type {Task} from './model';
export const postedStatus='concluidos e postados';
function validTime(value?:string){return value&&!isNaN(Date.parse(value))?Date.parse(value):0}
export function postedTime(task:Task){return validTime(task.postedAt)||validTime(task.history.find(h=>h.text.normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase().includes(postedStatus))?.at)}
export function stampPosted(previous:Task|undefined,next:Task,now:string):Task{const {postedAt,...rest}=next;const value=next.status===postedStatus&&previous?.status!==postedStatus?now:previous?.postedAt;return value?{...rest,postedAt:value}:rest}
export function orderColumn(tasks:Task[],status:string){return [...tasks].sort((a,b)=>{if(status===postedStatus){const byPosted=postedTime(b)-postedTime(a);if(byPosted)return byPosted;return a.due&&b.due?b.due.localeCompare(a.due):a.due?-1:b.due?1:0}return a.due&&b.due?a.due.localeCompare(b.due):a.due?-1:b.due?1:0})}
