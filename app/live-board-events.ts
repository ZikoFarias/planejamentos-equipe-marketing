import type {Area} from './permissions';

export type LiveActivity =
 | {kind:'drag'; taskId:string; area:Area; x:number; y:number}
 | {kind:'typing'|'sending'|'idle'; taskId:string};

export type LiveEvent =
 | {kind:'board-changed'}
 | (LiveActivity & {sender:string; name:string});

const areas = new Set<Area>(['geral','aprovacoes','farias','luiz','laura','compras']);

export function parseLiveActivity(raw:unknown):LiveActivity|null {
 if(typeof raw!=='string'||raw.length>768)return null;
 try {
  const {kind,taskId,area,x,y}=JSON.parse(raw);
  if(typeof taskId!=='string'||!taskId||taskId.length>160)return null;
  if(kind==='typing'||kind==='sending'||kind==='idle')return {kind,taskId};
  if(kind==='drag'&&areas.has(area)&&typeof x==='number'&&typeof y==='number'&&x>=0&&x<=1&&y>=0&&y<=1)return {kind,taskId,area,x,y};
 } catch {}
 return null;
}
