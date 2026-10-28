import type {Task} from './model';
import {isPurchase} from './purchases';
const id=(name:string)=>name.trim().toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g,'');
export function withParticipants(task:Task):Task{
 const assignees=task.assignees.filter(name=>!['lucio','lucio alves xavier','mateus'].includes(id(name)));
 assignees.push('Lucio Alves Xavier');if(!isPurchase(task))assignees.push('Mateus');
 return {...task,assignees:[...new Set(assignees)]};
}
