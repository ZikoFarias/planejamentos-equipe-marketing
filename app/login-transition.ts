const transitionKey='marketing-login-entrance';
export const transitionShell=`<div class="login-reveal-stage" role="status" aria-label="Carregando o planejamento" hidden>
<svg class="login-reveal-veil" width="100%" height="100%" aria-hidden="true"><defs><mask id="luke-reveal-mask"><rect width="100%" height="100%" fill="white"/><circle class="login-reveal-aperture" cx="50%" cy="50%" r="0" fill="black"/></mask></defs><rect width="100%" height="100%" fill="#070e20" mask="url(#luke-reveal-mask)"/></svg>
<svg class="login-reveal-logo" viewBox="42.8551025390625 583.4224243164062 309.8479919433594 52.0419921875" aria-hidden="true"><use href="/brands/group-transparent.svg#luke-mark"/></svg>
<span class="login-reveal-label">Preparando seu planejamento…</span></div>`;

export async function navigateWithLogo(destination:string){
 if(window.matchMedia('(prefers-reduced-motion: reduce)').matches){
  window.location.assign(destination);
  return;
 }
 const source=document.querySelector<HTMLImageElement>('.login-mark');
 const rect=source?.getBoundingClientRect();
 const template=document.createElement('template');
 template.innerHTML=transitionShell;
 const stage=template.content.firstElementChild as HTMLElement;
 stage.hidden=false;
 document.body.appendChild(stage);
 const logo=stage.querySelector<SVGSVGElement>('.login-reveal-logo')!;
 const width=Math.min(360,window.innerWidth-64);
 if(rect){
  const movement=logo.animate([
   {left:rect.left+'px',top:rect.top+'px',width:rect.width+'px',transform:'none'},
   {left:'50%',top:'50%',width:width+'px',transform:'translate(-50.48824%,-49.73119%)'}
  ],{duration:420,easing:'cubic-bezier(.22,.75,.25,1)',fill:'forwards'});
  stage.querySelector('.login-reveal-veil')!.animate([{opacity:0},{opacity:1}],{duration:320,fill:'forwards'});
  await movement.finished.catch(()=>{});
 }
 try{sessionStorage.setItem(transitionKey,String(Date.now()))}catch{}
 window.location.assign(destination);
}

export function installBoardEntrance(){
 const stage=document.querySelector<HTMLElement>('.login-reveal-stage');
 let created=0;
 try{created=Number(sessionStorage.getItem(transitionKey));sessionStorage.removeItem(transitionKey)}catch{}
 if(!stage||!created||Date.now()-created>30000){
  stage?.remove();
  document.documentElement.classList.remove('luke-entering');
  return;
 }
 stage.hidden=false;
 const root=document.getElementById('marketing-root');
 if(root)root.inert=true;
 let finished=false;
 const cleanup=()=>{
  stage.remove();
  if(root)root.inert=false;
  document.documentElement.classList.remove('luke-entering');
 };
 const reveal=()=>{
  if(finished)return;
  finished=true;
  clearTimeout(timeout);
  window.removeEventListener('marketing-board-ready',reveal);
  if(window.matchMedia('(prefers-reduced-motion: reduce)').matches){cleanup();return}
  const aperture=stage.querySelector<SVGCircleElement>('.login-reveal-aperture')!;
  const logo=stage.querySelector<SVGSVGElement>('.login-reveal-logo')!;
  const radius=Math.hypot(window.innerWidth,window.innerHeight)/2+40;
  const width=logo.getBoundingClientRect().width;
  const initialRadius=0.01474594111610652*width;
  const label=stage.querySelector<HTMLElement>('.login-reveal-label')!;
  label.style.opacity='0';
  const started=performance.now();
  const frame=(now:number)=>{
   const progress=Math.min(1,(now-started)/1050);
   const eased=progress*progress*progress;
   const current=initialRadius+(radius-initialRadius)*eased;
   aperture.setAttribute('r',String(current));
   // Resize the SVG viewport so Chromium repaints the paths at the current size.
   logo.style.width=width*current/initialRadius+'px';
   if(progress<1)requestAnimationFrame(frame);else cleanup();
  };
  requestAnimationFrame(frame);
 };
 window.addEventListener('marketing-board-ready',reveal);
 const timeout=setTimeout(reveal,15000);
}
