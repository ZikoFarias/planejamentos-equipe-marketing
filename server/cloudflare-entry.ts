import {handleTeamLogin} from '../app/team-login-handler';
type Environment=Cloudflare.Env&{ASSETS:Fetcher};
// Keep authentication independent of the server-rendering runtime on Workers Free.
export default {async fetch(request:Request,env:Environment,ctx:ExecutionContext){
 const url=new URL(request.url),headers=new Headers(request.headers);
 for(const key of [...headers.keys()])if(key.startsWith('oai-authenticated-'))headers.delete(key);
 const clean=new Request(request,{headers});let response:Response;
 if(url.pathname==='/api/auth/login'||url.pathname==='/api/auth/challenge')response=await handleTeamLogin(clean,env,url.pathname.endsWith('/challenge'));
 else if(url.pathname==='/login'&&['GET','HEAD'].includes(request.method)){
  url.pathname='/_team/login.html';url.search='';response=await env.ASSETS.fetch(new Request(url,{method:request.method}));
 }else if(url.pathname==='/api/preferences')response=Response.json(request.method==='GET'?{colors:{},background:''}:{error:'Preferências de arquivo desativadas nesta prévia de teste.'},{status:request.method==='GET'?200:503});
 else if(url.pathname.startsWith('/api/files'))response=Response.json({error:'Envio de arquivos desativado nesta prévia gratuita de teste.'},{status:503});
 else{
  // @ts-ignore Generated server bundle is present in the deployment staging directory.
  const {default:app}=await import('./index.js');response=await app.fetch(clean,env,ctx);
 }
 const out=new Response(response.body,response);out.headers.set('X-Robots-Tag','noindex, nofollow');out.headers.set('X-Preview-Environment','test-only');
 if(url.pathname==='/_team/login.html')out.headers.set('Cache-Control','no-store');
 return out;
}};
