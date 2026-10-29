import {names} from './permissions';
import {teamAccounts} from './team-auth';
export type Profiles=Record<string,{name:string,photo:string}>;
export function validProfile(email:unknown,name:unknown,photo:unknown){return typeof email==='string'&&Object.hasOwn(teamAccounts,email)&&typeof name==='string'&&name.trim().length>0&&name.trim().length<=80&&typeof photo==='string'&&(!photo||/^\/api\/background\/[\w-]{10,200}$/.test(photo))}
export function profileFor(name:string,profiles:Profiles){const normalized=name.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g,'');const email=Object.keys(teamAccounts).find(email=>email===name)||Object.keys(profiles).find(email=>profiles[email].name===name)||Object.keys(teamAccounts).filter(email=>email!=='ezequiel2303f@gmail.com').find(email=>(names[teamAccounts[email]]||'').toLowerCase()===normalized||teamAccounts[email]===normalized);return email?profiles[email]:undefined}
