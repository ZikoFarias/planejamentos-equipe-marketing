import type {Attachment} from './model';
import {MAX_FILE_SIZE} from './media';
async function responseJson(r:Response){let data:any;try{data=await r.json()}catch{throw Error('O servidor não respondeu ao envio. Tente novamente.')}if(!r.ok)throw Error(data.error||'Não foi possível enviar o arquivo.');return data}
export async function uploadFile(file:File,onProgress:(percent:number)=>void,signal:AbortSignal,purpose?:'background'):Promise<Attachment>{
 if(file.size<1||file.size>MAX_FILE_SIZE)throw Error('Escolha um arquivo entre 1 byte e 100 MB.');
 const init=await responseJson(await fetch('/api/files',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({action:'init',name:file.name,size:file.size,type:file.type,purpose}),signal}));
 const url='/api/files/'+init.id+'/parts';try{const parts=[];for(let offset=0,n=1;offset<file.size;offset+=init.partSize,n++){const blob=file.slice(offset,Math.min(file.size,offset+init.partSize));const part=await responseJson(await fetch(url+'?part='+n,{method:'PUT',body:blob,signal}));parts.push(part);onProgress(Math.min(98,Math.round((offset+blob.size)/file.size*98)))}
 const attachment=await responseJson(await fetch(url,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({parts}),signal}));onProgress(100);return attachment;
 }catch(e){await fetch(url,{method:'DELETE'}).catch(()=>{});throw e}}
