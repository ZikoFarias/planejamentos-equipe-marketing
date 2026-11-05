'use client';
import {useState,type CSSProperties,type PointerEvent} from 'react';

const swatches=['#ef4444','#f97316','#eab308','#22c55e','#06b6d4','#3b82f6','#8b5cf6','#ec4899'];
const clamp=(value:number)=>Math.max(0,Math.min(1,value));
const byte=(value:number)=>Math.round(value*255).toString(16).padStart(2,'0');

function toHsv(hex:string){
 const [r,g,b]=[1,3,5].map(index=>parseInt(hex.slice(index,index+2),16)/255);
 const v=Math.max(r,g,b),delta=v-Math.min(r,g,b);
 const hue=delta===0?0:r===v?(g-b)/delta:g===v?(b-r)/delta+2:(r-g)/delta+4;
 return {h:(hue*60+360)%360,s:v===0?0:delta/v,v};
}

function fromHsv(h:number,s:number,v:number){
 const channel=(n:number)=>{const k=(n+h/60)%6;return v-v*s*Math.max(0,Math.min(k,4-k,1))};
 return '#'+[5,3,1].map(n=>byte(channel(n))).join('');
}

export function ColorPanel({label,value,onChange,disabled,alpha=false}:{label:string,value:string,onChange:(value:string)=>void,disabled?:boolean,alpha?:boolean}){
 const hex=value.slice(0,7);
 const opacity=alpha&&value.length===9?parseInt(value.slice(7),16)/255:1;
 const hsv=toHsv(hex);
 const [hueHint,setHueHint]=useState(0);
 const hue=hsv.s&&hsv.v?hsv.h:hueHint;
 const [editing,setEditing]=useState<string|null>(null);
 const change=(color:string,amount=opacity)=>onChange(color+(alpha&&amount<1?byte(amount):''));
 const pick=(event:PointerEvent<HTMLButtonElement>)=>{
  const rect=event.currentTarget.getBoundingClientRect();
  setHueHint(hue);
  change(fromHsv(hue,clamp((event.clientX-rect.left)/rect.width),1-clamp((event.clientY-rect.top)/rect.height)));
 };
 return <details className="color-panel">
  <summary aria-label={label}><span className="color-panel-sample" style={{background:value}}/><span>{label}</span><code>{value.toUpperCase()}</code></summary>
  <fieldset disabled={disabled} aria-label={label}>
   <button type="button" className="color-panel-area" aria-label="Saturação e brilho. Use as setas para ajustar." style={{'--picker-hue':`hsl(${hue} 100% 50%)`} as CSSProperties}
    onPointerDown={event=>{event.currentTarget.setPointerCapture(event.pointerId);pick(event)}}
    onPointerMove={event=>{if(event.currentTarget.hasPointerCapture(event.pointerId))pick(event)}}
    onKeyDown={event=>{const step=event.shiftKey?.1:.02;
     const directions:Record<string,[number,number]>={ArrowLeft:[-step,0],ArrowRight:[step,0],ArrowDown:[0,-step],ArrowUp:[0,step]};
     const direction=directions[event.key];
     if(!direction)return;
     event.preventDefault();
     setHueHint(hue);
     change(fromHsv(hue,clamp(hsv.s+direction[0]),clamp(hsv.v+direction[1])));
    }}>
    <span style={{left:hsv.s*100+'%',top:(1-hsv.v)*100+'%',background:hex}}/>
   </button>
   <label>Matiz<input className="color-panel-hue" type="range" min="0" max="359" value={Math.round(hue)%360} onChange={event=>{const next=+event.target.value;setHueHint(next);change(fromHsv(next,hsv.s||1,hsv.v||1))}}/></label>
   {alpha&&<label>Opacidade · {Math.round(opacity*100)}%<input type="range" min="0" max="100" value={Math.round(opacity*100)} onChange={event=>change(hex,+event.target.value/100)}/></label>}
   <label>HEX<input spellCheck={false} value={editing??value.toUpperCase()} maxLength={alpha?9:7} onBlur={()=>setEditing(null)} onChange={event=>{
    const next=event.target.value;setEditing(next);
    if(/^#[0-9a-f]{6}$/i.test(next))change(next.toLowerCase());
    else if(alpha&&/^#[0-9a-f]{8}$/i.test(next))onChange(next.toLowerCase());
   }}/></label>
   <div className="color-panel-swatches" aria-label="Cores prontas">{swatches.map(color=><button type="button" key={color} aria-label={'Usar '+color} aria-pressed={hex===color} style={{background:color}} onClick={()=>change(color)}/>)}</div>
  </fieldset>
 </details>;
}
