import {statuses,Task} from './model';
import {personalColumns} from './workflow';
export type StatusDefinition={id:string,name:string,color:string};
export type StatusConfig={custom:StatusDefinition[],removed:Record<string,string>};
export const emptyStatusConfig:StatusConfig={custom:[],removed:{}};
export function readStatusConfig(raw?:string|StatusConfig):StatusConfig{if(!raw)return emptyStatusConfig;const value=typeof raw==='string'?JSON.parse(raw):raw;return {custom:value.custom||[],removed:value.removed||{}}}
export function statusDefinitions(config:StatusConfig=emptyStatusConfig){return [...statuses.map(([id,color])=>({id,name:id.toLocaleUpperCase('pt-BR'),color})),...config.custom].filter(s=>!config.removed[s.id])}
export function configuredStatus(id:string,config:StatusConfig=emptyStatusConfig){const seen=new Set<string>();while(config.removed[id]){if(seen.has(id))throw Error('Os destinos dos status formam um ciclo.');seen.add(id);id=config.removed[id]}return id}
export function configuredTask(task:Task,config:StatusConfig=emptyStatusConfig):Task{return {...task,status:configuredStatus(task.status,config)}}
export function customStatus(id:string){return id.startsWith('custom:')}
export function statusColumns(area:string,config:StatusConfig=emptyStatusConfig):string[][]{const definitions=statusDefinitions(config);if(area!=='luiz'&&area!=='farias')return definitions.map(s=>[s.id,s.color,s.name]);const active=new Set(definitions.map(s=>s.id));return [...personalColumns.filter(([id])=>id==='a fazer'?active.has('a fazer '+area)||(area==='luiz'&&active.has('ideias')):id==='em andamento'?active.has('em andamento '+area):id==='aprovação'?definitions.some(s=>s.id.startsWith('aprovação ')):active.has(id)),...definitions.filter(s=>customStatus(s.id)).map(s=>[s.id,s.color,s.name])]}
export function autoPhase(id:string){return id.startsWith('em andamento ')||id.startsWith('aprovação ')}
