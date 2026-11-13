'use client';
import {useEffect,useRef,useState} from 'react';
import {Copy,Check} from 'lucide-react';
export function CopyTextButton({text,label}:{text:string,label:string}){
 const [copied,setCopied]=useState(false),[error,setError]=useState(false),timer=useRef<ReturnType<typeof setTimeout>|null>(null);
 useEffect(()=>()=>{if(timer.current)clearTimeout(timer.current)},[]);
 async function copy(){try{await navigator.clipboard.writeText(text);setCopied(true);setError(false);if(timer.current)clearTimeout(timer.current);timer.current=setTimeout(()=>setCopied(false),1800)}catch{setError(true)}}
 return <><button type="button" className="caption-copy" aria-label={copied?'Texto copiado':label} title={copied?'Texto copiado':label} disabled={!text.trim()} onClick={()=>{void copy()}}>{copied?<Check size={17}/>:<Copy size={17}/>}</button>{error&&<small role="alert">Não foi possível copiar. Confira a permissão da área de transferência.</small>}</>
}
