'use client';
import {useEffect,useState} from 'react';
import {driveConfig} from './drive-config';
import {prepareDrive,authorizeDrive,getDriveToken,disconnectDrive} from './drive-client';
export function DriveConnection(){
 const [available,setAvailable]=useState(false);
 const [ready,setReady]=useState(false),[connected,setConnected]=useState(false),[busy,setBusy]=useState(false),[error,setError]=useState('');
 useEffect(()=>{if(!driveConfig.enabled)return;setAvailable(true);let alive=true;prepareDrive().then(()=>{if(alive)setReady(true)}).catch(()=>{});const changed=()=>setConnected(!!getDriveToken());window.addEventListener('marketing-drive-auth',changed);return()=>{alive=false;window.removeEventListener('marketing-drive-auth',changed)}},[]);
 if(!available)return null;
 return <div className="drive-connection"><button disabled={busy} title="A conexão ao Google é separada do login do site" onClick={async()=>{setError('');if(connected){disconnectDrive();return}setBusy(true);try{if(!ready){await prepareDrive();setReady(true);setError('Google carregado. Clique novamente para conectar.')}else await authorizeDrive()}catch(e){setError(e instanceof Error?e.message:'Não foi possível conectar.')}finally{setBusy(false)}}}>{busy?'Conectando…':connected?'Desconectar Drive':'Conectar Drive'}</button>{error&&<span role="alert">{error}</span>}</div>;
}
