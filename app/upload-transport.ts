// Browser progress measures bytes sent; 100% is not a Drive confirmation.
export function uploadWithProgress(url:string,file:File,signal:AbortSignal,progress:(sent:number)=>void):Promise<Response>{
 return new Promise((resolve,reject)=>{
  const request=new XMLHttpRequest(),abort=()=>request.abort();
  const finish=()=>signal.removeEventListener('abort',abort);
  request.open('POST',url);request.setRequestHeader('Content-Type',file.type||'application/octet-stream');request.timeout=180000;
  request.upload.onprogress=event=>progress(Math.min(100,Math.round(event.loaded/file.size*100)));
  request.onload=()=>{finish();if(request.status<200||request.status>599){reject(Error('A conexão terminou sem confirmar o envio. Confira o cartão antes de repetir.'));return}resolve(new Response(request.responseText,{status:request.status,headers:{'Content-Type':request.getResponseHeader('Content-Type')||'application/json'}}))};
  request.onerror=()=>{finish();reject(Error('Falha de conexão durante o envio. Confira o cartão antes de repetir.'))};
  request.ontimeout=()=>{finish();reject(Error('O envio levou tempo demais. Confira os anexos e o Drive antes de repetir.'))};
  request.onabort=()=>{finish();reject(new DOMException('Envio cancelado.','AbortError'))};
  if(signal.aborted){reject(new DOMException('Envio cancelado.','AbortError'));return}
  signal.addEventListener('abort',abort,{once:true});request.send(file);
 });
}
