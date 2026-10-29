import {requestTeamSession} from '../app/request-session';
import {enqueueSpelling,processSpellingQueue} from './spelling-review';
import {spellingFingerprint,finalImages} from '../app/spelling';
import type {Task} from '../app/model';
import {handleTeamLogin} from '../app/team-login-handler';
type Environment=Cloudflare.Env&{ASSETS:Fetcher};
// Keep authentication independent of the server-rendering runtime on Workers Free.
export default {async scheduled(_event:ScheduledController,env:Environment,ctx:ExecutionContext){ctx.waitUntil(processSpellingQueue(env))},async fetch(request:Request,env:Environment,ctx:ExecutionContext){
 const url=new URL(request.url),headers=new Headers(request.headers);
 for(const key of [...headers.keys()])if(key.startsWith('oai-authenticated-'))headers.delete(key);
 const clean=new Request(request,{headers});let response:Response;
 const boardWrite=request.method==='POST'&&(url.pathname==='/api/board'||(url.pathname==='/api/drive/central/upload'&&url.searchParams.get('attach')==='1'));
 const before=boardWrite?await env.DB!.prepare('SELECT data FROM marketing_board WHERE id=1').first<{data:string}>():null;
 if(url.pathname==='/'&&['GET','HEAD'].includes(request.method)){if(!await requestTeamSession(clean,env))response=Response.redirect(new URL('/login',url).href,302);else{url.pathname='/_team/board.html';url.search='';response=await env.ASSETS.fetch(new Request(url,{method:request.method}));response=new Response(response.body,response);response.headers.set('Cache-Control','private, no-store')}}
 else if(url.pathname==='/api/auth/login'||url.pathname==='/api/auth/challenge')response=await handleTeamLogin(clean,env,url.pathname.endsWith('/challenge'));
 else if(url.pathname==='/login'&&['GET','HEAD'].includes(request.method)){
  url.pathname='/_team/login.html';url.search='';response=await env.ASSETS.fetch(new Request(url,{method:request.method}));
 }else{
  // @ts-ignore Generated server bundle is present in the deployment staging directory.
  const {default:app}=await import('./index.js');response=await app.fetch(clean,env,ctx);
 }
 if(boardWrite&&response.ok){try{const value:any=await response.clone().json(),body=value.board||value;const old=JSON.parse(before?.data||'[]') as Task[];const changed=(body.tasks||[]).filter((task:Task)=>finalImages(task).length&&spellingFingerprint(task)!==(old.find(t=>t.id===task.id)?spellingFingerprint(old.find(t=>t.id===task.id)!):'[]'));if(changed.length)ctx.waitUntil(enqueueSpelling(env,changed.map((task:Task)=>task.id)).catch(()=>{}));}catch{}}
 const out=new Response(response.body,response);out.headers.set('X-Robots-Tag','noindex, nofollow');out.headers.set('X-Application-Environment','production');
 if(url.pathname==='/_team/login.html')out.headers.set('Cache-Control','no-store');
 return out;
}};
