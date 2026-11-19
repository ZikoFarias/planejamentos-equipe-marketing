'use client';
import {useEffect,useState} from 'react';
import {testDesktopNotification} from './desktop-notification-test';
export function DesktopNotificationToggle(){
 const [permission,setPermission]=useState(()=>typeof Notification==='undefined'?'unsupported':Notification.permission);
 const [message,setMessage]=useState('');
 useEffect(()=>{if(!('Notification' in window))return;const check=()=>setPermission(Notification.permission);window.addEventListener('focus',check);const timer=setInterval(check,2000);return()=>{clearInterval(timer);window.removeEventListener('focus',check)}},[]);
 if(permission==='unsupported')return null;
 return <div className="desktop-notification-toggle"><button type="button" disabled={permission==='denied'} onClick={async()=>{try{const next=await Notification.requestPermission();setPermission(next);if(next==='granted'){testDesktopNotification();setMessage('Teste enviado. Se não aparecer, confira Não incomodar e as notificações do Chrome nas configurações do Windows.')}}catch(e){setMessage((e as Error).message)}}}>{permission==='granted'?'Enviar notificação de teste':'Ativar notificações do Windows'}</button>{permission==='denied'&&<small>Libere as notificações nas permissões deste site no navegador.</small>}{message&&<small role="status">{message}</small>}<small>Os avisos chegam enquanto o site estiver aberto, inclusive em outra aba.</small></div>;
}
