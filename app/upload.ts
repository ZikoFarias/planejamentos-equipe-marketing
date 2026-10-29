import {driveConfig} from './drive-config';
import type {Attachment} from './model';
import {MAX_FILE_SIZE} from './media';
async function responseJson(r:Response){let data:any;try{data=await r.json()}catch{throw Error('O servidor não respondeu ao envio. Tente novamente.')}if(!r.ok)throw Error(data.error||'Não foi possível enviar o arquivo.');return data}
export async function uploadFile(file:File,onProgress:(percent:number)=>void,signal:AbortSignal,purpose?:'background'|'profile'):Promise<Attachment>{
 if(file.size<1||file.size>MAX_FILE_SIZE)throw Error('Escolha um arquivo entre 1 byte e 100 MB.');
 if((purpose==='background'||purpose==='profile')&&driveConfig.enabled){if(file.size>(purpose==='profile'?100:20)*1024*1024)throw Error('Escolha uma imagem de até '+(purpose==='profile'?100:20)+' MB.');onProgress(1);const query=new URLSearchParams({name:file.name,size:String(file.size)});const attachment=await responseJson(await fetch('/api/background?'+query+'&purpose='+purpose,{method:'POST',headers:{'Content-Type':file.type||'application/octet-stream'},body:file,signal}));onProgress(100);return attachment;}
 const init=await responseJson(await fetch('/api/files',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({action:'init',name:file.name,size:file.size,type:file.type,purpose}),signal}));
 const url='/api/files/'+init.id+'/parts';try{const parts=[];for(let offset=0,n=1;offset<file.size;offset+=init.partSize,n++){const blob=file.slice(offset,Math.min(file.size,offset+init.partSize));const part=await responseJson(await fetch(url+'?part='+n,{method:'PUT',body:blob,signal}));parts.push(part);onProgress(Math.min(98,Math.round((offset+blob.size)/file.size*98)))}
 const attachment=await responseJson(await fetch(url,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({parts}),signal}));onProgress(100);return attachment;
 }catch(e){await fetch(url,{method:'DELETE'}).catch(()=>{});throw e}}
