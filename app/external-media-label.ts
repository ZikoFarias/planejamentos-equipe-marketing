import type {Task} from './model';
import {labelName,type LabelConfig} from './labels';
const normalize=(value:string)=>value.normalize('NFD').replace(/[\u0300-\u036f]/g,'').trim().replace(/\s+/g,' ').toUpperCase();
export function externalMediaLabel(task:Pick<Task,'tags'>,config:LabelConfig={}){
 return task.tags.find(id=>[id,labelName(id,config)].some(value=>['MIDIA EXTERNA','MIDIA EXTERIOR'].includes(normalize(value))));
}
