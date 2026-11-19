import {processDriveCleanup} from './drive-cleanup';
import {handleCancelAdjustment} from './adjustment-handler';
import {handleCaption} from './caption-handler';
import {serveCentralMedia} from './central-media';
import {drainNotificationChanges,processPersonalNotifications} from './personal-notifications';
import {requestTeamSession} from '../app/request-session';
import {enqueueSpelling,processSpellingQueue} from './spelling-review';
import {spellingFingerprint,finalImages} from '../app/spelling';
import type {Task} from '../app/model';
import {handleTeamLogin} from '../app/team-login-handler';
import {handleGoogleTeamLogin} from '../app/google-team-login';
import {boardActionRevision} from '../app/board-action-response';
import {boardUndoSnapshot,handleBoardUndo,rememberBoardAction,undoableRoutes} from './board-undo';
export {LiveBoard} from './live-board';
type Environment=Cloudflare.Env&{ASSETS:Fetcher;LIVE_BOARD?:DurableObjectNamespace};
const boardChanges=new Set([...undoableRoutes,'/api/undo']);
// Keep authentication independent of the server-rendering runtime on Workers Free.
export default {async scheduled(_event:ScheduledController,env:Environment,ctx:ExecutionContext){ctx.waitUntil(Promise.allSettled([processSpellingQueue(env),processPersonalNotifications(env.DB!).then(async changed=>{if(changed&&env.LIVE_BOARD)await env.LIVE_BOARD.getByName('marketing').fetch('https://board.internal/change',{method:'POST'})}),processDriveCleanup(env)]))},async fetch(request:Request,env:Environment,ctx:ExecutionContext){
 try{
 const url=new URL(request.url),headers=new Headers(request.headers);
 for(const key of [...headers.keys()])if(key.startsWith('oai-authenticated-'))headers.delete(key);
 const clean=new Request(request,{headers});let response:Response;
 const live=env.LIVE_BOARD?.getByName('marketing');
 if(url.pathname==='/api/live-board'){
  if(request.method!=='GET'||headers.get('Upgrade')?.toLowerCase()!=='websocket')return new Response(null,{status:426});
  if(headers.get('Origin')!==url.origin)return new Response(null,{status:403});
  const session=await requestTeamSession(clean,env);
  if(!session?.role)return new Response(null,{status:401});
  if(!live)return new Response(null,{status:503});
  return live.fetch(new Request(clean,{headers:{Upgrade:'websocket','X-Team-Email':session.user.email,'X-Team-Name':encodeURIComponent(session.user.displayName),'X-Team-Role':session.role}}));
 }
 const boardWrite=request.method==='POST'&&(url.pathname==='/api/board'||(url.pathname==='/api/drive/central/upload'&&url.searchParams.get('attach')==='1'));
 const remember=request.method==='POST'&&undoableRoutes.has(url.pathname)&&(url.pathname!=='/api/drive/central/upload'||boardWrite);
 const actor=remember||url.pathname==='/api/undo'?await requestTeamSession(clean,env):null;
 const before=remember&&actor?await boardUndoSnapshot(env.DB!):null;
 if(url.pathname==='/'&&['GET','HEAD'].includes(request.method)){if(!await requestTeamSession(clean,env))response=Response.redirect(new URL('/login'+url.search,url).href,302);else{url.pathname='/_team/board.html';url.search='';response=await env.ASSETS.fetch(new Request(url,{method:request.method}));response=new Response(response.body,response);response.headers.set('Cache-Control','private, no-store')}}
 else if(url.pathname==='/api/adjustments')response=await handleCancelAdjustment(clean,env,await requestTeamSession(clean,env));
 else if(url.pathname==='/api/undo')response=await handleBoardUndo(clean,env.DB!,actor);
 else if(url.pathname==='/api/captions')response=await handleCaption(clean,env,await requestTeamSession(clean,env));
 else if(url.pathname==='/api/drive/central/media'&&request.method==='GET')response=await serveCentralMedia(clean,env,await requestTeamSession(clean,env));
 else if(url.pathname==='/api/auth/login'||url.pathname==='/api/auth/challenge')response=await handleTeamLogin(clean,env,url.pathname.endsWith('/challenge'));
 else if(url.pathname==='/api/auth/google')response=await handleGoogleTeamLogin(clean,env);
 else if(url.pathname==='/login'&&['GET','HEAD'].includes(request.method)){
  url.pathname='/_team/login.html';url.search='';response=await env.ASSETS.fetch(new Request(url,{method:request.method}));
 }else{
  // @ts-ignore Generated server bundle is present in the deployment staging directory.
  const {default:app}=await import('./index.js');response=await app.fetch(clean,env,ctx);
 }
 if(before&&actor&&response.ok){
  try{const revision=Number(response.headers.get(boardActionRevision));
   if(Number.isSafeInteger(revision)&&revision>0)await rememberBoardAction(env.DB!,before,revision,actor.user.email);
  }catch(error){console.warn('O histórico desta ação não pôde ser gravado.',error);}
 }
 if(boardWrite&&response.ok)ctx.waitUntil(Promise.allSettled([processDriveCleanup(env),drainNotificationChanges(env.DB!).then(async changed=>{if(changed&&live)await live.fetch('https://board.internal/change',{method:'POST'})})]));
 if(live&&response.ok&&['POST','PATCH','PUT','DELETE'].includes(request.method)&&(boardWrite||boardChanges.has(url.pathname))){
  ctx.waitUntil(live.fetch('https://board.internal/change',{method:'POST'}).catch(()=>{}));
 }
 if(boardWrite&&response.ok){try{const value:any=await response.clone().json(),body=value.board||value;const old=JSON.parse(before?.data||'[]') as Task[];const changed=(body.tasks||[]).filter((task:Task)=>finalImages(task).length&&spellingFingerprint(task)!==(old.find(t=>t.id===task.id)?spellingFingerprint(old.find(t=>t.id===task.id)!):'[]'));if(changed.length)ctx.waitUntil(enqueueSpelling(env,changed.map((task:Task)=>task.id)).catch(()=>{}));}catch{}}
 const out=new Response(response.body,response);out.headers.delete(boardActionRevision);out.headers.set('X-Robots-Tag','noindex, nofollow');out.headers.set('X-Application-Environment','production');
 if(url.pathname==='/_team/login.html')out.headers.set('Cache-Control','no-store');
 return out;
 }catch(error){const limited=String(error).includes("daily row read limit");const message=limited?"O limite diário do banco gratuito foi atingido. O acesso volta às 21h (horário de Brasília).":"Serviço temporariamente indisponível. Tente novamente.";return request.url.includes("/api/")?Response.json({error:message},{status:503,headers:{"Retry-After":"300","Cache-Control":"no-store"}}):new Response(`<!doctype html><html lang="pt-BR"><meta charset="utf-8"><meta name="viewport" content="width=device-width"><title>Planejamento de Marketing</title><body style="background:#071625;color:#e8f2ff;font:18px system-ui;padding:10vh 8vw"><h1>Planejamento de Marketing</h1><p>${message}</p><a style="color:#66b8ff" href="/login">Voltar ao login</a></body></html>`,{status:503,headers:{"Content-Type":"text/html; charset=utf-8","Cache-Control":"no-store","Retry-After":"300"}})}
}};
