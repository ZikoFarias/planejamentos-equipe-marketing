import {companyById,companyId} from './workflow';
export type Appearance={colors:Record<string,string>,background:string,backgroundColor?:string,names?:Record<string,string>,areas?:Record<string,AreaAppearance>};
export const defaultAppearance:Appearance={colors:{},background:''};
export function ink(hex:string){const rgb=hex.replace('#','').match(/../g)!.map(v=>parseInt(v,16)/255).map(v=>v<=.04045?v/12.92:((v+.055)/1.055)**2.4);return rgb[0]*.2126+rgb[1]*.7152+rgb[2]*.0722>.179?'#071725':'#ffffff'}
export function labelStyle(label:string){const palette=['#9f8fef','#4bce97','#f5cd47','#85b8ff','#e774bb'];let hash=0;for(const ch of label.toLowerCase())hash=(hash*31+ch.charCodeAt(0))>>>0;const color=companyById(companyId(label))?.color||palette[hash%palette.length];return {background:color,color:ink(color)}}
export function validAppearance(value:any):value is Appearance{return !!value&&(value.names===undefined||validNames(value.names))&&(value.areas===undefined||!!value.areas&&typeof value.areas==='object'&&!Array.isArray(value.areas)&&Object.entries(value.areas).every(([area,entry]:[string,any])=>(appearanceAreas as readonly string[]).includes(area)&&validColors(entry?.colors)&&(entry.names===undefined||validNames(entry.names))))&&(value.backgroundColor===undefined||value.backgroundColor===''||typeof value.backgroundColor==='string'&&/^#[a-f0-9]{6}$/i.test(value.backgroundColor))&&typeof value.background==='string'&&(!value.background||(/^\/api\/files\/[a-f0-9-]{36}$/.test(value.background)||/^\/api\/background\/[\w-]{10,200}$/.test(value.background)))&&!!value.colors&&typeof value.colors==='object'&&!Array.isArray(value.colors)&&Object.keys(value.colors).length<=60&&Object.entries(value.colors).every(([k,v])=>k.length<=100&&typeof v==='string'&&/^#[a-f0-9]{6}$/i.test(v))}

export type AreaAppearance={colors:Record<string,string>,names?:Record<string,string>};
export const appearanceAreas=['aprovacoes','luiz','farias','compras','laura'] as const;
export type AppearanceSection='background'|'statuses';
const validColors=(value:any)=>!!value&&typeof value==='object'&&!Array.isArray(value)&&Object.keys(value).length<=60&&Object.entries(value).every(([key,color])=>key.length<=100&&typeof color==='string'&&/^#[a-f0-9]{6}$/i.test(color));
const validNames=(value:any)=>!!value&&typeof value==='object'&&!Array.isArray(value)&&Object.keys(value).length<=60&&Object.entries(value).every(([key,name])=>key.length<=100&&typeof name==='string'&&name.trim().length>0&&name.length<=60);
export function columnKey(area:string,id:string){return id==='a fazer'?'a fazer '+area:id==='em andamento'?(area==='compras'?'em andamento farias':'em andamento '+area):id==='comprar'?'a fazer farias':id==='aprovado'?'aprovado ✅':id==='stand-by'?'stand-by ⛔':id==='concluído'?'concluidos e postados':id==='aprovação'?'aprovação fibroplast':id}
export function columnAppearance(value:Appearance,area:string,id:string,color:string,name:string){
 const key=columnKey(area,id),local=value.areas?.[area];
 return {color:local?.colors[id]||(id==='aprovação'?value.colors[id]:undefined)||value.colors[key]||value.colors[id]||color,name:local?.names?.[id]||value.names?.[id==='aprovação'?id:key]||value.names?.[id]||name};
}
export function sharedAppearance(personal:Appearance,shared:Appearance):Appearance{return {...personal,colors:shared.colors,...(shared.names?{names:shared.names}:{}),...(shared.areas?{areas:shared.areas}:{})}}
