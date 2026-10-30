'use client';
import {useEffect,useRef,useState} from 'react';
import {Settings,LogOut} from 'lucide-react';
import {photoFrameStyle,type PhotoFrame} from './profiles';
export function AccountMenu({name,email,role,photo,frame,busy,onSettings,onLogout}:{name:string,email:string,role:string,photo?:string,frame?:PhotoFrame,busy:boolean,onSettings:()=>void,onLogout:()=>void}){
 const menu=useRef<HTMLDetailsElement>(null),[failed,setFailed]=useState('');
 useEffect(()=>{const outside=(e:PointerEvent)=>{if(!menu.current?.contains(e.target as Node)&&menu.current)menu.current.open=false};const escape=(e:KeyboardEvent)=>{if(e.key==='Escape'&&menu.current?.open){menu.current.open=false;menu.current.querySelector('summary')?.focus()}};document.addEventListener('pointerdown',outside);document.addEventListener('keydown',escape);return()=>{document.removeEventListener('pointerdown',outside);document.removeEventListener('keydown',escape)}},[]);
 const close=()=>{if(menu.current)menu.current.open=false};
 return <details ref={menu} className="account-menu"><summary aria-label="Abrir perfil" title="Meu perfil"><span className="account-avatar">{photo&&failed!==photo?<img src={photo} alt="" style={photoFrameStyle(frame)} onError={()=>setFailed(photo)}/>:<span>{name.trim().split(/\s+/).map(p=>p[0]).slice(0,2).join('').toUpperCase()}</span>}</span></summary><div className="account-panel"><strong>{name}</strong><span>{email}</span><small>{role}</small><button type="button" disabled={!role} onClick={()=>{close();onSettings()}}><Settings size={17}/>Configurações</button><button type="button" disabled={busy} onClick={()=>{close();onLogout()}}><LogOut size={17}/>Sair</button></div></details>;
}
