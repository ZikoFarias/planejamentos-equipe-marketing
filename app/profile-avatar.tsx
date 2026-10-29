'use client';
import {useEffect,useId,useRef,useState,useSyncExternalStore} from 'react';
import {profileFor,profileDetails,photoFrameStyle,type Profiles} from './profiles';
import {Mail,BriefcaseBusiness} from 'lucide-react';
import {teamAccounts} from './team-auth';
import {names} from './permissions';
let profiles:Profiles={};const listeners=new Set<()=>void>();export function setTeamProfiles(next:Profiles){profiles=next;for(const listener of listeners)listener()}const subscribe=(fn:()=>void)=>{listeners.add(fn);return()=>{listeners.delete(fn)}};export const profileName=(name:string)=>profileFor(name,profiles)?.name||name;
// Real profile photographs can be added here when supplied by the team.
export const profilePhotos:Record<string,string>={};
export function ProfileAvatar({name}:{name:string}){
 const current=useSyncExternalStore(subscribe,()=>profiles,()=>profiles),profile=profileFor(name,current),display=profile?.name||(Object.hasOwn(teamAccounts,name)?names[teamAccounts[name]]:name);const [failed,setFailed]=useState(''),id=name.toLocaleLowerCase('pt-BR').startsWith('lucio')?'lucio':name.toLocaleLowerCase('pt-BR'),photo=profile?.photo||profilePhotos[id];
 const initials=display.trim().split(/\s+/).map(part=>part[0]).slice(0,2).join('').toUpperCase();
 const details=profileDetails(name,current),popup=useRef<HTMLSpanElement>(null),anchor=useRef<HTMLSpanElement>(null),timer=useRef<ReturnType<typeof setTimeout>|null>(null),popupId=useId();
 function cancel(){if(timer.current)clearTimeout(timer.current)}
 function hide(){cancel();popup.current?.hidePopover?.()}
 function open(){cancel();const box=anchor.current?.getBoundingClientRect(),panel=popup.current;if(!box||!panel)return;panel.showPopover?.();const width=Math.min(300,window.innerWidth-24),height=panel.offsetHeight;panel.style.width=width+'px';panel.style.left=Math.max(12,Math.min(box.left,window.innerWidth-width-12))+'px';panel.style.top=Math.max(12,box.bottom+height+10>window.innerHeight?box.top-height-8:box.bottom+8)+'px'}
 function later(){cancel();timer.current=setTimeout(hide,180)}
 useEffect(()=>()=>{if(timer.current)clearTimeout(timer.current)},[]);
 return <span ref={anchor} className="profile-avatar" role="img" aria-label={display} tabIndex={0} aria-describedby={popupId} onMouseEnter={open} onMouseLeave={later} onFocus={open} onBlur={later} onKeyDown={e=>{if(e.key==='Escape'){e.stopPropagation();hide()}}}>{photo&&failed!==photo?<img src={photo} alt="" style={photoFrameStyle(profile?.photoFrame)} onError={()=>setFailed(photo)}/>:<span aria-hidden="true">{initials}</span>}<span id={popupId} ref={popup} popover="manual" role="tooltip" className="profile-hovercard" onMouseEnter={cancel} onMouseLeave={later} onClick={e=>e.stopPropagation()}><span className="profile-hovercard-heading"><span className="profile-hovercard-photo">{photo&&failed!==photo?<img src={photo} alt="" style={photoFrameStyle(profile?.photoFrame)} onError={()=>setFailed(photo)}/>:initials}</span><span><strong>{details?.name||display}</strong><small>Equipe de marketing</small></span></span>{details?.job&&<span className="profile-hovercard-line"><BriefcaseBusiness size={15}/>{details.job}</span>}{details?.loginEmail&&<span className="profile-hovercard-line"><Mail size={15}/>{details.loginEmail}</span>}</span></span>
}
