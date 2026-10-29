'use client';
import {useState,useSyncExternalStore} from 'react';
import {profileFor,photoFrameStyle,type Profiles} from './profiles';
import {teamAccounts} from './team-auth';
import {names} from './permissions';
let profiles:Profiles={};const listeners=new Set<()=>void>();export function setTeamProfiles(next:Profiles){profiles=next;for(const listener of listeners)listener()}const subscribe=(fn:()=>void)=>{listeners.add(fn);return()=>{listeners.delete(fn)}};export const profileName=(name:string)=>profileFor(name,profiles)?.name||name;
// Real profile photographs can be added here when supplied by the team.
export const profilePhotos:Record<string,string>={};
export function ProfileAvatar({name}:{name:string}){
 const current=useSyncExternalStore(subscribe,()=>profiles,()=>profiles),profile=profileFor(name,current),display=profile?.name||(Object.hasOwn(teamAccounts,name)?names[teamAccounts[name]]:name);const [failed,setFailed]=useState(''),id=name.toLocaleLowerCase('pt-BR').startsWith('lucio')?'lucio':name.toLocaleLowerCase('pt-BR'),photo=profile?.photo||profilePhotos[id];
 const initials=display.trim().split(/\s+/).map(part=>part[0]).slice(0,2).join('').toUpperCase();
 return <span className="profile-avatar" role="img" aria-label={display} title={display}>{photo&&failed!==photo?<img src={photo} alt="" style={photoFrameStyle(profile?.photoFrame)} onError={()=>setFailed(photo)}/>:<span aria-hidden="true">{initials}</span>}</span>
}
