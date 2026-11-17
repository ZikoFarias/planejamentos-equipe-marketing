'use client';
import {useEffect,useRef,useState} from 'react';
import {Settings,LogOut,Bell,ChevronDown,ChevronRight,UserRound} from 'lucide-react';
import {photoFrameStyle,type PhotoFrame} from './profiles';
type AreaLink = {id:string; label:string; count?:number};
export function AccountAvatar({name,photo,frame}:{name:string;photo?:string;frame?:PhotoFrame}) {
 const [failed,setFailed] = useState('');
 const initials = name.trim().split(/\s+/).slice(0,2).map(part=>part[0]).join('').toUpperCase();
 return <span className="account-avatar" aria-hidden="true">
  {photo && failed!==photo ? <img src={photo} alt="" style={photoFrameStyle(frame)} onError={()=>setFailed(photo)}/> : initials || <UserRound size={17}/>}
 </span>;
}
export function AccountMenu({name,email,job,role,photo,frame,busy,onSettings,onLogout,unread=0,onNotifications,onProfileOpen,areas=[],activeArea,onAreaChange,persistent=false,onCollapse}:{name:string,email:string,job?:string,role:string,photo?:string,frame?:PhotoFrame,busy:boolean,onSettings:()=>void,onLogout:()=>void,unread?:number,onNotifications?:()=>void,onProfileOpen?:()=>void,areas?:AreaLink[],activeArea?:string,onAreaChange?:(id:string)=>void,persistent?:boolean,onCollapse?:()=>void}){
 const menu=useRef<HTMLDetailsElement>(null);
 useEffect(()=>{const outside=(e:PointerEvent)=>{if(!menu.current?.contains(e.target as Node)&&menu.current)menu.current.open=false};const escape=(e:KeyboardEvent)=>{if(e.key==='Escape'&&menu.current?.open){menu.current.open=false;menu.current.querySelector('summary')?.focus()}};document.addEventListener('pointerdown',outside);document.addEventListener('keydown',escape);return()=>{document.removeEventListener('pointerdown',outside);document.removeEventListener('keydown',escape)}},[]);
 const close=()=>{if(menu.current)menu.current.open=false};
 const avatar = <AccountAvatar name={name} photo={photo} frame={frame}/>;
 const ProfileRow=onCollapse?'button':'div';
 const panel = (
  <div className="account-panel">
   <ProfileRow className="account-profile-row" type={onCollapse?'button':undefined} onClick={onCollapse} title={onCollapse?'Recolher barra lateral':undefined}>
    {avatar}
    <span><strong>{name||'Equipe'}</strong><span>{job}</span><small>{email}</small></span>
   </ProfileRow>
   <div className="account-menu-group account-areas" role="group" aria-label="Contas e áreas">
    <span className="account-group-label">Contas / Áreas</span>
    {areas.map(area=><button type="button" key={area.id} disabled={!role||busy} aria-current={activeArea===area.id?'page':undefined} onClick={()=>{close();onAreaChange?.(area.id);onCollapse?.()}}>
     <span className="account-area-dot"/><span>{area.label}</span><small className="account-area-count">{area.count}</small><ChevronRight size={15}/>
    </button>)}
   </div>
   <div className="account-menu-group" role="group" aria-label="Preferências">
    <span className="account-group-label">Preferências</span>
    {onNotifications&&<button type="button" onClick={()=>{close();onNotifications()}}><Bell size={17}/>Notificações{unread>0&&<small>{unread}</small>}<ChevronRight size={15}/></button>}
    <button type="button" disabled={!role} onClick={()=>{close();onSettings()}}><Settings size={17}/>Configurações<ChevronRight size={15}/></button>
   </div>
   <button className="account-sign-out" type="button" disabled={busy} onClick={()=>{close();onLogout()}}><LogOut size={17}/>Sair</button>
  </div>
 );
 if (persistent) return <nav className="unified-account-menu" aria-label="Perfil e áreas">{panel}</nav>;
 return <details ref={menu} className="account-menu unified-account-menu" onToggle={event=>{if(event.currentTarget.open)onProfileOpen?.()}}>
  <summary aria-label="Abrir perfil e áreas" title="Perfil e áreas">
   {avatar}
   <span className="account-active-area">{areas.find(area=>area.id===activeArea)?.label||'Áreas da equipe'}</span>
   <ChevronDown size={15} aria-hidden="true"/>
   {unread>0&&<span className="account-unread" aria-label={unread+' notificações não lidas'}>{unread>99?'99+':unread}</span>}
  </summary>
  {panel}
 </details>;
}
