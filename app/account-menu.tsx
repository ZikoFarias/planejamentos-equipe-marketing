'use client';
import {useEffect,useRef,useState} from 'react';
import {Settings,LogOut,Bell,ChevronDown,ChevronRight,UserRound} from 'lucide-react';
import {photoFrameStyle,type PhotoFrame} from './profiles';
type AreaLink = {id:string; label:string; count?:number};
export function AccountMenu({name,email,role,photo,frame,busy,onSettings,onLogout,unread=0,onNotifications,onProfileOpen,areas=[],activeArea,onAreaChange}:{name:string,email:string,role:string,photo?:string,frame?:PhotoFrame,busy:boolean,onSettings:()=>void,onLogout:()=>void,unread?:number,onNotifications?:()=>void,onProfileOpen?:()=>void,areas?:AreaLink[],activeArea?:string,onAreaChange?:(id:string)=>void}){
 const menu=useRef<HTMLDetailsElement>(null),[failed,setFailed]=useState('');
 useEffect(()=>{const outside=(e:PointerEvent)=>{if(!menu.current?.contains(e.target as Node)&&menu.current)menu.current.open=false};const escape=(e:KeyboardEvent)=>{if(e.key==='Escape'&&menu.current?.open){menu.current.open=false;menu.current.querySelector('summary')?.focus()}};document.addEventListener('pointerdown',outside);document.addEventListener('keydown',escape);return()=>{document.removeEventListener('pointerdown',outside);document.removeEventListener('keydown',escape)}},[]);
 const close=()=>{if(menu.current)menu.current.open=false};
 const avatar = photo&&failed!==photo ? <img src={photo} alt="" style={photoFrameStyle(frame)} onError={()=>setFailed(photo)}/> : name ? <span>{name.trim().split(/\s+/).slice(0,2).map(part=>part[0]).join('').toUpperCase()}</span> : <UserRound size={17}/>;
 return <details ref={menu} className="account-menu unified-account-menu" onToggle={event=>{if(event.currentTarget.open)onProfileOpen?.()}}>
  <summary aria-label="Abrir perfil e áreas" title="Perfil e áreas">
   <span className="account-avatar">{avatar}</span>
   <span className="account-active-area">{areas.find(area=>area.id===activeArea)?.label||'Áreas da equipe'}</span>
   <ChevronDown size={15} aria-hidden="true"/>
   {unread>0&&<span className="account-unread" aria-label={unread+' notificações não lidas'}>{unread>99?'99+':unread}</span>}
  </summary>
  <div className="account-panel">
   <button className="account-profile-row" type="button" disabled={!role} onClick={()=>{close();onSettings()}}>
    <span className="account-avatar">{avatar}</span><span><strong>{name||'Equipe'}</strong><span>{email}</span><small>{role}</small></span><ChevronRight size={16}/>
   </button>
   <div className="account-menu-group" role="group" aria-label="Contas e áreas">
    <span className="account-group-label">Contas / Áreas</span>
    {areas.map(area=><button type="button" key={area.id} disabled={!role||busy} aria-current={activeArea===area.id?'page':undefined} onClick={()=>{close();onAreaChange?.(area.id)}}>
     <span className="account-area-dot"/><span>{area.label}</span>{area.count!==undefined&&<small>{area.count}</small>}<ChevronRight size={15}/>
    </button>)}
   </div>
   <div className="account-menu-group" role="group" aria-label="Preferências">
    <span className="account-group-label">Preferências</span>
    {onNotifications&&<button type="button" onClick={()=>{close();onNotifications()}}><Bell size={17}/>Notificações{unread>0&&<small>{unread}</small>}<ChevronRight size={15}/></button>}
    <button type="button" disabled={!role} onClick={()=>{close();onSettings()}}><Settings size={17}/>Configurações<ChevronRight size={15}/></button>
   </div>
   <button className="account-sign-out" type="button" disabled={busy} onClick={()=>{close();onLogout()}}><LogOut size={17}/>Sair</button>
  </div>
 </details>;
}
