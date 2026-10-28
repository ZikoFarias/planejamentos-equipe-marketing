import {uploadDriveFile} from './drive-client';
import {MAX_FILE_SIZE} from './media';
import type {Attachment} from './model';
import type {ArtworkKind} from './drive-config';
type Options={kind:ArtworkKind,token:string,folder:{id:string,name:string},signal:AbortSignal,onAttachment:(a:Attachment)=>void,onProgress:(text:string)=>void};
export async function uploadDirectDriveBatch(files:File[],options:Options,upload=uploadDriveFile){
 if(files.some(file=>!file.size||file.size>MAX_FILE_SIZE))throw Error('Escolha arquivos entre 1 byte e 100 MB.');
 const result={uploaded:0,errors:[] as string[]};
 for(const file of files){
  options.signal.throwIfAborted();
  try{const saved=await upload(file,options.token,options.folder,options.kind,text=>options.onProgress(file.name+' — '+text),options.signal);options.onAttachment(saved);result.uploaded++;}
  catch(e){result.errors.push(file.name+': '+(e instanceof Error?e.message:'Envio não confirmado.'));if(options.signal.aborted)break;}
 }
 return result;
}
