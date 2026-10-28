import {companyById,companyId} from './workflow';
import {labelStyle as defaultStyle,ink} from './appearance';
export type LabelConfig=Record<string,{name:string,color:string}>;
export function labelName(id:string,config:LabelConfig={}){return config[id]?.name||companyById(companyId(id))?.label||id.toLocaleUpperCase('pt-BR')}
export function labelStyle(id:string,config:LabelConfig={}){const color=config[id]?.color;return color?{background:color,color:ink(color)}:defaultStyle(id)}
export function validLabel(name:unknown,color:unknown){return typeof name==='string'&&!!name.trim()&&name.trim().length<=60&&typeof color==='string'&&/^#[a-f0-9]{6}$/i.test(color)}
