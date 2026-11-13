'use client';
import {useEffect,useRef,useState} from 'react';
export function CardBorderGlow(){
 const ref=useRef<SVGSVGElement>(null),[size,setSize]=useState({width:200,height:300});
 useEffect(()=>{const svg=ref.current;if(!svg)return;const measure=()=>{const box=svg.getBoundingClientRect();if(box.width&&box.height)setSize(previous=>previous.width===box.width&&previous.height===box.height?previous:{width:box.width,height:box.height})};measure();if(typeof ResizeObserver==='undefined')return;const observer=new ResizeObserver(measure);observer.observe(svg);return()=>observer.disconnect()},[]);
 const w=size.width,h=size.height,r=15,x=w/2;
 return <svg ref={ref} className="card-border-glow" viewBox={`0 0 ${w} ${h}`} aria-hidden="true" focusable="false"><path d={`M${x} 1H${w-r}Q${w-1} 1 ${w-1} ${r}V${h-r}Q${w-1} ${h-1} ${w-r} ${h-1}H${x}`} pathLength="1000"/><path d={`M${x} 1H${r}Q1 1 1 ${r}V${h-r}Q1 ${h-1} ${r} ${h-1}H${x}`} pathLength="1000"/></svg>
}
