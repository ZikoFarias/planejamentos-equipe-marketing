import type {Attachment} from './model';
import type {ArtworkKind} from './drive-config';
import {MAX_FILE_SIZE} from './media';
import type {Task} from './model';
import {uploadWithProgress} from './upload-transport';
export type UploadedBoard={tasks:Task[],revision:number};
export async function uploadCentralBatch(files:File[],options:{taskId:string,kind:ArtworkKind,signal:AbortSignal,onAttachment:(a:Attachment,board?:UploadedBoard)=>void,onProgress:(message:string)=>void},fetcher:typeof fetch=fetch){
 if(files.some(f=>!f.size||f.size>MAX_FILE_SIZE))throw Error('Escolha arquivos entre 1 byte e 100 MB.');
 const result={uploaded:0,errors:[] as string[]};
 for(const file of files){options.signal.throwIfAborted();options.onProgress(file.name+' — Enviando ao Drive central…');try{
 const query=new URLSearchParams({task:options.taskId,kind:options.kind,name:file.name,size:String(file.size),attach:'1'}),url='/api/drive/central/upload?'+query;
 const response=fetcher===fetch&&typeof XMLHttpRequest!=='undefined'?await uploadWithProgress(url,file,options.signal,percent=>options.onProgress(file.name+(percent===100?' — Confirmando no Drive…':' — Enviando '+percent+'%'))):await fetcher(url,{method:'POST',headers:{'Content-Type':file.type||'application/octet-stream'},body:file,signal:options.signal});const value:any=await response.json();
 if(!response.ok)throw Error(value.error||'Envio não confirmado.');if(value.drive?.central!==true)throw Error('O servidor não confirmou o Drive central.');const {board,...attachment}=value;options.onAttachment(attachment,board);result.uploaded++;
 }catch(e){result.errors.push(file.name+': '+(e instanceof Error?e.message:'Envio não confirmado.'));if(options.signal.aborted)break;}}
 return result;
}
