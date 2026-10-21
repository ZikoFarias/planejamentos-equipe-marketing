import type {Attachment} from './model';
import type {ArtworkKind} from './drive-config';
import {uploadFile} from './upload';
import {exportAttachment} from './drive-client';
import {MAX_FILE_SIZE} from './media';

type Backup={token:string,folder:{id:string,name:string}};
type Options={kind:ArtworkKind,backup?:Backup,signal:AbortSignal,onAttachment:(attachment:Attachment)=>void,onProgress:(text:string)=>void};
// Injected transports keep workflow tests independent from Google credentials.
export async function uploadArtworkBatch(files:File[],options:Options,transport={upload:uploadFile,backup:exportAttachment}){
  if(files.some(file=>file.size<1||file.size>MAX_FILE_SIZE))throw Error('Escolha arquivos entre 1 byte e 100 MB.');
  const result={uploaded:0,backedUp:0,failedBackups:0};
  for(const file of files){
    options.signal.throwIfAborted();
    const attachment:Attachment={...await transport.upload(file,percent=>options.onProgress(file.name+' — '+percent+'%'),options.signal),artworkKind:options.kind};
    if(options.backup)attachment.backup={status:'pending'};
    options.onAttachment(attachment);result.uploaded++;
    if(!options.backup)continue;
    try{
      options.signal.throwIfAborted();
      const drive=await transport.backup(attachment,options.backup.token,options.backup.folder,options.kind,text=>options.onProgress(file.name+' — Backup no Drive: '+text));
      options.onAttachment({...attachment,drive,backup:undefined});result.backedUp++;
    }catch(e){
      const message=e instanceof Error?e.message:'Falha ao copiar para o Drive.';
      options.onAttachment({...attachment,backup:{status:'failed',message:message.slice(0,1000)}});result.failedBackups++;
    }
  }
  return result;
}
