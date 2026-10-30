import type {Task} from './model';
import {isPurchase} from './purchases';
import {externalMediaLabel,purchaseLabel} from './external-media-label';
import type {LabelConfig} from './labels';
const id=(name:string)=>name.trim().toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g,'');
export function withParticipants(task:Task,labels:LabelConfig={}):Task{
 const assignees=task.assignees.filter(name=>!['lucio','lucio alves xavier','mateus'].includes(id(name)));
 const purchase=isPurchase(task)||!!purchaseLabel(task,labels);
 const owner=['a fazer farias','em andamento farias'].includes(task.status)?'Farias':['a fazer luiz','em andamento luiz'].includes(task.status)?'Luiz':'';
 if(owner&&!assignees.some(name=>id(name)===id(owner)))assignees.push(owner);
 if(purchase&&!assignees.some(name=>id(name)==='farias'))assignees.push('Farias');
 assignees.push('Lucio Alves Xavier');if(!purchase&&!externalMediaLabel(task,labels))assignees.push('Mateus');
 return {...task,assignees:[...new Set(assignees)]};
}
