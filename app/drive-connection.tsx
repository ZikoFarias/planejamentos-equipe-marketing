'use client';
import {useEffect,useState} from 'react';
import {driveConfig} from './drive-config';
export function DriveConnection(){const [state,setState]=useState<{connected:boolean,admin:boolean}|null>(null);useEffect(()=>{if(!driveConfig.enabled)return;let active=true;fetch('/api/drive/central/status',{cache:'no-store'}).then(async r=>{if(r.ok&&active)setState(await r.json() as any)}).catch(()=>{});return()=>{active=false}},[]);if(!state||state.connected)return null;return <div className="drive-connection">{state.admin?<a href="/api/drive/central/start">Autorizar Drive central</a>:<span>Drive central aguardando autorização</span>}</div>}
