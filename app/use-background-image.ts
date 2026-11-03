'use client';
import {useEffect,useState} from 'react';
import {compressBackgroundImage} from './background-compression';
export function useBackgroundImage(source:string){
 const [current,setCurrent]=useState({source:'',url:''});
 useEffect(()=>{if(!source){setCurrent({source:'',url:''});return}let active=true,objectUrl='';const controller=new AbortController(),url=source+'?preview=1';
 (async()=>{try{const response=await fetch(url,{signal:controller.signal});if(!response.ok)throw Error('Fundo indisponível');const original=await response.blob();const optimized=await compressBackgroundImage(new File([original],'fundo',{type:original.type}));if(!active)return;objectUrl=URL.createObjectURL(optimized);setCurrent({source,url:objectUrl})}catch{if(active&&!controller.signal.aborted)setCurrent({source,url})}})();
 return()=>{active=false;controller.abort();if(objectUrl)URL.revokeObjectURL(objectUrl)};
 },[source]);
 return current.source===source?current.url:'';
}
