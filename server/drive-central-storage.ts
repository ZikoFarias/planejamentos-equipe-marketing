import {CENTRAL_DRIVE_EMAIL,refreshCentralAccess,revealCentralToken} from './drive-central-auth';
import {driveFolders,driveConfig} from '../app/drive-config';
import {MAX_FILE_SIZE} from '../app/media';
let access:{cipher:string,token:string,until:number}|undefined;
export async function centralAccess(env:Cloudflare.Env){
 const connection=await env.DB!.prepare('SELECT email,encrypted_refresh FROM marketing_drive_connection WHERE id=1').first<{email:string,encrypted_refresh:string}>();
 if(!connection||connection.email!==CENTRAL_DRIVE_EMAIL)throw Error('A conta central do Drive precisa ser autorizada pelo administrador.');
 if(access&&access.cipher===connection.encrypted_refresh&&access.until>Date.now())return access.token;
 const refreshToken=await revealCentralToken(connection.encrypted_refresh,env.GOOGLE_DRIVE_ENCRYPTION_KEY!);
 const token=await refreshCentralAccess({clientId:env.GOOGLE_DRIVE_CLIENT_ID!,clientSecret:env.GOOGLE_DRIVE_CLIENT_SECRET!,refreshToken});
 access={cipher:connection.encrypted_refresh,token,until:Date.now()+300000};return token;
}
async function json(response:Response){if(!response.ok)throw Error('O Drive recusou a operação. Confira a conexão central e o espaço disponível.');return await response.json() as any}
export async function storeCentralFile(input:{env:Cloudflare.Env,company:string,kind:'reference'|'final',name:string,type:string,size:number,body:ReadableStream<Uint8Array>,owner:string,taskId:string},fetcher:typeof fetch=fetch){
 const folderId=driveFolders[input.company]?.[input.kind];if(!folderId)throw Error('Empresa inválida.');return storeFileInFolder({...input,folderId},fetcher);
}
async function storeFileInFolder(input:{env:Cloudflare.Env,folderId:string,kind:'reference'|'final',name:string,type:string,size:number,body:ReadableStream<Uint8Array>,owner:string,taskId:string},fetcher:typeof fetch=fetch){
 const folderId=input.folderId;if(!folderId||!input.name.trim()||input.name.length>300||!Number.isSafeInteger(input.size)||input.size<1||input.size>MAX_FILE_SIZE)throw Error('Empresa, nome ou tamanho inválido.');
 const token=await centralAccess(input.env),headers={Authorization:'Bearer '+token};
 const [folder,generated]=await Promise.all([
  fetcher('https://www.googleapis.com/drive/v3/files/'+folderId+'?fields=id,name,mimeType,capabilities(canAddChildren)&supportsAllDrives=true',{headers}).then(json),
  fetcher('https://www.googleapis.com/drive/v3/files/generateIds?count=1&space=drive',{headers}).then(json),
 ]);
 if(folder.id!==folderId||folder.mimeType!=='application/vnd.google-apps.folder'||folder.capabilities?.canAddChildren!==true)throw Error('A conta central não pode gravar na pasta desta empresa.');
 const id=generated.ids?.[0];if(typeof id!=='string'||!/^[\w-]{10,200}$/.test(id))throw Error('Identificação do Drive inválida.');
 const started=await fetcher('https://www.googleapis.com/upload/drive/v3/files?uploadType=resumable&supportsAllDrives=true&fields=id,size,parents',{method:'POST',headers:{...headers,'Content-Type':'application/json','X-Upload-Content-Type':input.type,'X-Upload-Content-Length':String(input.size)},body:JSON.stringify({id,name:input.name,mimeType:input.type,parents:[folderId],appProperties:{artworkKind:input.kind,taskId:input.taskId}})});
 const location=started.headers.get('Location');if(!started.ok||!location?.startsWith('https://www.googleapis.com/upload/'))throw Error('Não foi possível iniciar o arquivo no Drive.');
 // Stream bytes through the Worker; never buffer a 100 MB artwork in memory.
 let bytes=0;const limited=input.body.pipeThrough(new TransformStream<Uint8Array,Uint8Array>({transform(chunk,controller){bytes+=chunk.byteLength;if(bytes>input.size)throw Error('Tamanho diferente do informado.');controller.enqueue(chunk)},flush(){if(bytes!==input.size)throw Error('Arquivo incompleto.')}}));
 let saved:any;try{saved=await json(await fetcher(location,{method:'PUT',headers:{...headers,'Content-Type':input.type},body:limited,duplex:'half'} as RequestInit));}
 catch{saved=await json(await fetcher('https://www.googleapis.com/drive/v3/files/'+id+'?fields=id,size,parents&supportsAllDrives=true',{headers}));}
 if(saved.id!==id||Number(saved.size)!==input.size||!saved.parents?.includes(folderId))throw Error('Não foi possível confirmar o arquivo na pasta da empresa. Confira o Drive antes de repetir.');
 await input.env.DB!.prepare('INSERT INTO marketing_central_uploads(file_id,email,task_id,created_at) VALUES(?,?,?,?)').bind(id,input.owner,input.taskId,Date.now()).run();
 const url='https://drive.google.com/file/d/'+id+'/view';return {name:input.name,url,type:input.type,size:input.size,artworkKind:input.kind,drive:{central:true,fileId:id,folderId,folderName:folder.name,url,savedAt:new Date().toISOString()}};
}

export async function storeCentralBackground(input:{profile?:boolean,env:Cloudflare.Env,name:string,type:string,size:number,body:ReadableStream<Uint8Array>,owner:string},fetcher:typeof fetch=fetch){
 if(!Number.isSafeInteger(input.size)||input.size<1||input.size>(input.profile?10:20)*1024*1024||!/^image\/(png|jpeg|webp|gif|avif)$/.test(input.type))throw Error('Escolha uma imagem de até '+(input.profile?10:20)+' MB.');
 const token=await centralAccess(input.env),headers={Authorization:'Bearer '+token};const query=new URLSearchParams({q:"'"+driveConfig.rootFolder+"' in parents and trashed=false and mimeType='application/vnd.google-apps.folder' and appProperties has { key='marketingPurpose' and value='backgrounds' }",fields:'files(id)',pageSize:'10'});
 const found=await json(await fetcher('https://www.googleapis.com/drive/v3/files?'+query,{headers}));let folderId=found.files?.[0]?.id;
 if(!folderId){const created=await json(await fetcher('https://www.googleapis.com/drive/v3/files?fields=id',{method:'POST',headers:{...headers,'Content-Type':'application/json'},body:JSON.stringify({name:'Fundos do quadro',mimeType:'application/vnd.google-apps.folder',parents:[driveConfig.rootFolder],appProperties:{marketingPurpose:'backgrounds'}})}));folderId=created.id;}
 if(typeof folderId!=='string'||!/^[\w-]{10,200}$/.test(folderId))throw Error('Não foi possível preparar a pasta de fundos.');
 const saved=await storeFileInFolder({...input,folderId,kind:'reference',taskId:'_background'},fetcher);return {name:saved.name,url:'/api/background/'+saved.drive.fileId,type:saved.type,size:saved.size};
}
