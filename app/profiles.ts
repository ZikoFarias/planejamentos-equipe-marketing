import {names} from './permissions';
import {teamAccounts} from './team-auth';
export type PhotoFrame={x:number,y:number,zoom:number};
export const defaultPhotoFrame:PhotoFrame={x:50,y:50,zoom:1};
export const validPhotoFrame=(frame:any):frame is PhotoFrame=>!!frame&&typeof frame==='object'&&Number.isFinite(frame.x)&&frame.x>=0&&frame.x<=100&&Number.isFinite(frame.y)&&frame.y>=0&&frame.y<=100&&Number.isFinite(frame.zoom)&&frame.zoom>=1&&frame.zoom<=3;
export function photoFrameStyle(frame:PhotoFrame=defaultPhotoFrame){return {objectPosition:`${frame.x}% ${frame.y}%`,transform:`scale(${frame.zoom})`,transformOrigin:`${frame.x}% ${frame.y}%`}}
export type Profiles=Record<string,{name:string,photo:string,job?:string,loginEmail?:string,photoFrame?:PhotoFrame}>;
export const teamJobs:Record<string,string>={lucio:'Gerente',mateus:'Social Media e Videomaker',farias:'Designer',luiz:'Designer'};
export function loginAccount(email:string,profiles:Profiles){return Object.keys(teamAccounts).find(account=>(profiles[account]?.loginEmail||account)===email)}
export function validProfile(email:unknown,name:unknown,photo:unknown){return typeof email==='string'&&Object.hasOwn(teamAccounts,email)&&typeof name==='string'&&name.trim().length>0&&name.trim().length<=80&&typeof photo==='string'&&(!photo||/^\/api\/background\/[\w-]{10,200}$/.test(photo))}
export function profileFor(name:string,profiles:Profiles){const normalized=name.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g,'');const email=Object.keys(teamAccounts).find(email=>email===name)||Object.keys(profiles).filter(email=>email!=='ezequiel2303f@gmail.com').find(email=>profiles[email].name===name)||Object.keys(teamAccounts).filter(email=>email!=='ezequiel2303f@gmail.com').find(email=>(names[teamAccounts[email]]||'').toLowerCase()===normalized||teamAccounts[email]===normalized);return email?profiles[email]:undefined}
export function profileDetails(name:string,profiles:Profiles){const defaults:Profiles=Object.fromEntries(Object.entries(teamAccounts).map(([email,persona])=>[email,{name:profiles[email]?.name||names[persona],photo:profiles[email]?.photo||'',job:profiles[email]?.job||teamJobs[persona],loginEmail:profiles[email]?.loginEmail||email}]));return profileFor(name,defaults)}
