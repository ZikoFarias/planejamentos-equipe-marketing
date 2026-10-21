import {driveConfig,driveFolders,artworkLabels,type ArtworkKind} from './drive-config';
import type {Attachment} from './model';
import {MAX_FILE_SIZE} from './media';

const scope='https://www.googleapis.com/auth/drive.file';
type GoogleWindow=Window & {google?:any,gapi?:any};
let libraries:Promise<void>|undefined;
function script(src:string){return new Promise<void>((resolve,reject)=>{
  const node=document.createElement('script');node.src=src;node.async=true;
  const timer=setTimeout(()=>{node.remove();reject(Error('O Google demorou para carregar. Tente novamente.'))},15000);
  node.onload=()=>{clearTimeout(timer);resolve()};node.onerror=()=>{clearTimeout(timer);node.remove();reject(Error('Não foi possível carregar o Google. Confira sua conexão.'))};document.head.appendChild(node);
})}
export function prepareDrive(){
  if(!libraries)libraries=Promise.all([script('https://accounts.google.com/gsi/client'),script('https://apis.google.com/js/api.js')]).then(()=>new Promise<void>((resolve,reject)=>{
    (window as GoogleWindow).gapi.load('picker',{callback:resolve,onerror:()=>reject(Error('Não foi possível abrir o seletor do Drive.')),timeout:15000,ontimeout:()=>reject(Error('O seletor do Drive demorou para carregar.'))});
  })).catch(e=>{libraries=undefined;throw e});
  return libraries;
}
// Call directly from a click, after prepareDrive, so Google can open its popup.
export function authorizeDrive():Promise<string>{return new Promise((resolve,reject)=>{
  const google=(window as GoogleWindow).google;
  if(!google?.accounts?.oauth2){reject(Error('Aguarde o Google carregar e tente novamente.'));return}
  google.accounts.oauth2.initTokenClient({client_id:driveConfig.clientId,scope,include_granted_scopes:false,
    callback:(response:any)=>{
      if(response.error||!response.access_token){reject(Error('A autorização do Drive não foi concluída.'));return}
      if(!google.accounts.oauth2.hasGrantedAllScopes(response,scope)){reject(Error('Autorize o acesso aos arquivos escolhidos para continuar.'));return}
      resolve(response.access_token);
    },error_callback:()=>reject(Error('A janela do Google foi fechada ou bloqueada. Abra novamente para continuar.'))
  }).requestAccessToken({prompt:'select_account'});
})}
export function chooseDriveFolder(token:string,company:string,kind:ArtworkKind):Promise<{id:string,name:string}|null>{return new Promise((resolve,reject)=>{
  const p=(window as GoogleWindow).google.picker;
  const view=new p.DocsView(p.ViewId.FOLDERS).setIncludeFolders(true).setSelectFolderEnabled(true)
    .setParent(driveFolders[company]?.[kind]||driveConfig.rootFolder);
  let picker:any;
  const finish=(value:{id:string,name:string}|null)=>{picker?.dispose();resolve(value)};
  try{picker=new p.PickerBuilder().addView(view).setOAuthToken(token).setDeveloperKey(driveConfig.apiKey)
    .setAppId(driveConfig.projectNumber).setOrigin(window.location.origin).setLocale('pt-BR')
    .setTitle('Escolha a pasta — '+artworkLabels[kind]).setCallback((data:any)=>{
      if(data.action===p.Action.CANCEL)finish(null);
      if(data.action===p.Action.PICKED){const folder=data.docs?.[0];
        if(!folder||folder.mimeType!=='application/vnd.google-apps.folder'||!validId(folder.id)){picker?.dispose();reject(Error('Escolha uma pasta válida do Drive.'));return}
        finish({id:folder.id,name:folder.name||'Pasta selecionada'});
      }
    }).build();picker.setVisible(true);
  }catch{picker?.dispose();reject(Error('Não foi possível abrir o Drive. Confira as credenciais e os sites autorizados no Google Cloud.'))}
})}
export const validId=(id:unknown):id is string=>typeof id==='string'&&/^[a-zA-Z0-9_-]{10,200}$/.test(id);
export function driveError(status:number){return status===401?'A autorização do Google expirou. Conecte novamente.':status===403?'O Google recusou o acesso. Confira a permissão de gravação da pasta e o espaço disponível.':status===429?'O Drive recebeu muitos envios. Aguarde antes de tentar novamente.':'Não foi possível concluir o envio ao Drive.'}
async function readJson(response:Response):Promise<any>{if(!response.ok)throw Error(driveError(response.status));try{return await response.json()}catch{throw Error('O Drive retornou uma resposta inválida.')}}
async function boundedFetch(url:string,init:RequestInit,timeout=30000){const controller=new AbortController();const timer=setTimeout(()=>controller.abort(),timeout);try{return await fetch(url,{...init,signal:controller.signal})}finally{clearTimeout(timer)}}
// Only authenticated same-origin attachments may be exported. Never proxy arbitrary URLs.
export function localAttachment(a:Attachment){return /^\/api\/files\/[a-f0-9-]{36}$/.test(a.url)}
export async function exportAttachment(a:Attachment,token:string,folder:{id:string,name:string},kind:ArtworkKind,onProgress:(text:string)=>void){
  if(!localAttachment(a))throw Error('Envie este arquivo ao cartão antes de salvar no Drive. Links externos não são copiados automaticamente.');
  if(!validId(folder.id))throw Error('Pasta inválida. Selecione novamente.');
  onProgress('Lendo arquivo…');
  const controller=new AbortController(),timer=setTimeout(()=>controller.abort(),120000);
  let blob:Blob;
  try{const source=await fetch(a.url,{credentials:'same-origin',signal:controller.signal});
    if(!source.ok)throw Error('Não foi possível ler o anexo. Confira seu acesso ao cartão.');
    if(source.redirected||(source.headers.get('Content-Type')||'').includes('text/html'))throw Error('A sessão do site expirou. Entre novamente antes de copiar o anexo.');
    if(Number(source.headers.get('Content-Length'))>MAX_FILE_SIZE)throw Error('O arquivo ultrapassa 100 MB.');
    blob=await source.blob();
  }finally{clearTimeout(timer)}
  if(!blob.size||blob.size>MAX_FILE_SIZE)throw Error('O arquivo deve ter entre 1 byte e 100 MB.');
  const type=blob.type||a.type||'application/octet-stream';
  onProgress('Preparando envio…');
  // A preallocated ID prevents a transport retry from creating a second file.
  const generated=await readJson(await boundedFetch('https://www.googleapis.com/drive/v3/files/generateIds?count=1&space=drive',{headers:{Authorization:'Bearer '+token}}));
  const id=generated.ids?.[0];if(!validId(id))throw Error('O Drive não retornou a identificação do arquivo.');
  const started=await boundedFetch('https://www.googleapis.com/upload/drive/v3/files?uploadType=resumable&supportsAllDrives=true&fields=id,name,webViewLink',{
    method:'POST',headers:{Authorization:'Bearer '+token,'Content-Type':'application/json','X-Upload-Content-Type':type,'X-Upload-Content-Length':String(blob.size)},
    body:JSON.stringify({id,name:a.name,mimeType:type,parents:[folder.id],description:artworkLabels[kind]+' — Planejamentos Marketing',appProperties:{artworkKind:kind}})
  });
  if(!started.ok)throw Error(driveError(started.status));const location=started.headers.get('Location');
  if(!location||!location.startsWith('https://www.googleapis.com/upload/'))throw Error('O Drive não iniciou o envio.');
  onProgress('Enviando ao Drive…');
  try{
    const saved=await readJson(await boundedFetch(location,{method:'PUT',headers:{Authorization:'Bearer '+token,'Content-Type':type},body:blob},120000));
    if(saved.id!==id)throw Error('O Drive não confirmou a identificação do arquivo.');
    return {fileId:id,folderId:folder.id,folderName:folder.name,url:'https://drive.google.com/file/d/'+id+'/view',savedAt:new Date().toISOString()};
  }catch{
    // An interrupted response may follow a successful upload. Verify this exact ID.
    try{const confirmed=await readJson(await boundedFetch('https://www.googleapis.com/drive/v3/files/'+id+'?fields=id&supportsAllDrives=true',{headers:{Authorization:'Bearer '+token}}));
      if(confirmed.id===id)return {fileId:id,folderId:folder.id,folderName:folder.name,url:'https://drive.google.com/file/d/'+id+'/view',savedAt:new Date().toISOString()};
    }catch{}
    throw Error('Não foi possível confirmar o envio. Confira a pasta no Drive antes de tentar novamente.');
  }
}
