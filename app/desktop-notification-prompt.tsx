'use client';
import {useEffect,useState} from 'react';
import {Bell,X} from 'lucide-react';
import {testDesktopNotification} from './desktop-notification-test';

export function DesktopNotificationPrompt({email}:{email:string}){
 const [visible,setVisible]=useState(false),[busy,setBusy]=useState(false);
 useEffect(()=>{
  if(!email||!('Notification' in window))return;
  const check=()=>{
   if(Notification.permission!=='granted')return;
   setVisible(false);
   const key='marketing-desktop-test:'+email;
   try{if(sessionStorage.getItem(key))return;testDesktopNotification();sessionStorage.setItem(key,'1')}catch{}
  };
  check();const timer=setInterval(check,2000);window.addEventListener('focus',check);
  return()=>{clearInterval(timer);window.removeEventListener('focus',check)};
 },[email]);
 useEffect(()=>{
  if(!email||!('Notification' in window)||Notification.permission!=='default')return;
  const key='marketing-notification-prompt:'+email;
  try{if(sessionStorage.getItem(key))return;}catch{}
  setVisible(true);
 },[email]);
 function dismiss(){
  try{sessionStorage.setItem('marketing-notification-prompt:'+email,'1');}catch{}
  setVisible(false);
 }
 if(!visible)return null;
 return <aside className="desktop-notification-prompt" role="region" aria-label="Ativar notificações do Windows">
  <Bell size={20} aria-hidden="true"/>
  <div><strong>Receba avisos no Windows</strong><p>Ative as notificações para acompanhar as novas aprovações com o site aberto.</p>
   <button type="button" className="primary" disabled={busy} onClick={async()=>{setBusy(true);try{await Notification.requestPermission();dismiss()}finally{setBusy(false)}}}>Ativar notificações</button>
   <button type="button" disabled={busy} onClick={dismiss}>Agora não</button>
  </div>
  <button type="button" className="icon" disabled={busy} aria-label="Fechar aviso" onClick={dismiss}><X size={16}/></button>
 </aside>;
}
