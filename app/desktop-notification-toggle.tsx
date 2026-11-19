'use client';
import {useState} from 'react';
export function DesktopNotificationToggle(){
 const [permission,setPermission]=useState(()=>typeof Notification==='undefined'?'unsupported':Notification.permission);
 if(permission==='unsupported')return null;
 return <div className="desktop-notification-toggle"><button type="button" disabled={permission==='granted'||permission==='denied'} onClick={async()=>setPermission(await Notification.requestPermission())}>{permission==='granted'?'Notificações do Windows ativadas':'Ativar notificações do Windows'}</button>{permission==='denied'&&<small>Libere as notificações nas permissões deste site no navegador.</small>}<small>Os avisos chegam enquanto o site estiver aberto, inclusive em outra aba.</small></div>;
}
