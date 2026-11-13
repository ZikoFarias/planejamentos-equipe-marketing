'use client';
import {useLayoutEffect,useRef,useState} from 'react';
export function DescriptionField({value,onChange}:{value:string,onChange:(value:string)=>void}){
 const ref=useRef<HTMLTextAreaElement>(null),[expanded,setExpanded]=useState(false);
 useLayoutEffect(()=>{if(!expanded||!ref.current)return;ref.current.style.height='auto';ref.current.style.height=Math.max(160,ref.current.scrollHeight)+'px'},[expanded,value]);
 return <textarea ref={ref} className={expanded?'description-expanded':undefined} aria-label="Descrição" aria-expanded={expanded} rows={5} value={value} onFocus={()=>setExpanded(true)} onClick={()=>setExpanded(true)} onChange={event=>onChange(event.target.value)} placeholder="Descreva a entrega, as referências e o objetivo…"/>
}
