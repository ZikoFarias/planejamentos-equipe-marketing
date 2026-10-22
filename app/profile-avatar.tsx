'use client';
import {useState} from 'react';
// Real profile photographs can be added here when supplied by the team.
export const profilePhotos:Record<string,string>={};
export function ProfileAvatar({name}:{name:string}){
 const [failed,setFailed]=useState(false),id=name.toLocaleLowerCase('pt-BR').startsWith('lucio')?'lucio':name.toLocaleLowerCase('pt-BR'),photo=profilePhotos[id];
 const initials=name.trim().split(/\s+/).map(part=>part[0]).slice(0,2).join('').toUpperCase();
 return <span className="profile-avatar" role="img" aria-label={name} title={name}>{photo&&!failed?<img src={photo} alt="" onError={()=>setFailed(true)}/>:<span aria-hidden="true">{initials}</span>}</span>
}
