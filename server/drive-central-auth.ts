// Server-only OAuth helpers. Never import this module from client components.
export const CENTRAL_DRIVE_EMAIL='marketinglukegroup@gmail.com';
export const CENTRAL_DRIVE_SCOPE='openid email https://www.googleapis.com/auth/drive';
export type CentralDriveSecrets={clientId:string,clientSecret:string,refreshToken:string};
const tokenEndpoint='https://oauth2.googleapis.com/token';
export function centralAuthorizationUrl(clientId:string,redirectUri:string,state:string,challenge:string){
 const url=new URL('https://accounts.google.com/o/oauth2/v2/auth');
 url.search=new URLSearchParams({client_id:clientId,redirect_uri:redirectUri,response_type:'code',scope:CENTRAL_DRIVE_SCOPE,access_type:'offline',prompt:'consent select_account',login_hint:CENTRAL_DRIVE_EMAIL,state,code_challenge:challenge,code_challenge_method:'S256'}).toString();return url.toString();
}
export async function centralAccount(accessToken:string,fetcher:typeof fetch=fetch){
 const response=await fetcher('https://openidconnect.googleapis.com/v1/userinfo',{headers:{Authorization:'Bearer '+accessToken},signal:AbortSignal.timeout(15000)});
 if(!response.ok)throw Error('Não foi possível confirmar a conta central do Google.');
 const value:any=await response.json();
 if(value.email!==CENTRAL_DRIVE_EMAIL||value.email_verified!==true)throw Error('Autorize apenas a conta '+CENTRAL_DRIVE_EMAIL+'.');
 return {email:CENTRAL_DRIVE_EMAIL};
}
export async function exchangeCentralCode(input:{clientId:string,clientSecret:string,code:string,verifier:string,redirectUri:string},fetcher:typeof fetch=fetch){
 const response=await fetcher(tokenEndpoint,{method:'POST',headers:{'Content-Type':'application/x-www-form-urlencoded'},body:new URLSearchParams({client_id:input.clientId,client_secret:input.clientSecret,code:input.code,code_verifier:input.verifier,redirect_uri:input.redirectUri,grant_type:'authorization_code'}),signal:AbortSignal.timeout(15000)});
 if(!response.ok)throw Error('O Google não concluiu a autorização central. Tente novamente.');
 const value:any=await response.json();
 if(typeof value.access_token!=='string'||typeof value.refresh_token!=='string')throw Error('O Google não liberou a autorização contínua. Reconecte a conta central.');
 await centralAccount(value.access_token,fetcher);
 return {accessToken:value.access_token as string,refreshToken:value.refresh_token as string};
}
export async function refreshCentralAccess(secrets:CentralDriveSecrets,fetcher:typeof fetch=fetch){
 if(!secrets.clientId||!secrets.clientSecret||!secrets.refreshToken)throw Error('A conta central do Drive ainda não foi autorizada pelo administrador.');
 const response=await fetcher(tokenEndpoint,{method:'POST',headers:{'Content-Type':'application/x-www-form-urlencoded'},body:new URLSearchParams({client_id:secrets.clientId,client_secret:secrets.clientSecret,refresh_token:secrets.refreshToken,grant_type:'refresh_token'}),signal:AbortSignal.timeout(15000)});
 if(!response.ok)throw Error('A autorização central do Drive expirou ou foi revogada. Peça ao administrador para reconectar.');
 const value:any=await response.json();if(typeof value.access_token!=='string')throw Error('O Google retornou uma autorização inválida.');return value.access_token as string;
}
const encode=(bytes:Uint8Array)=>btoa(String.fromCharCode(...bytes));
const decode=(value:string)=>Uint8Array.from(atob(value),c=>c.charCodeAt(0));
export async function protectCentralToken(value:string,encryptionKey:string){
 const raw=decode(encryptionKey);if(raw.length!==32)throw Error('Chave de proteção central inválida.');
 const key=await crypto.subtle.importKey('raw',raw,'AES-GCM',false,['encrypt']),iv=crypto.getRandomValues(new Uint8Array(12));
 const ciphertext=await crypto.subtle.encrypt({name:'AES-GCM',iv,additionalData:new TextEncoder().encode(CENTRAL_DRIVE_EMAIL)},key,new TextEncoder().encode(value));
 return encode(iv)+'.'+encode(new Uint8Array(ciphertext));
}
export async function revealCentralToken(value:string,encryptionKey:string){
 const [iv,ciphertext]=value.split('.'),raw=decode(encryptionKey);if(raw.length!==32)throw Error('Chave de proteção central inválida.');
 const key=await crypto.subtle.importKey('raw',raw,'AES-GCM',false,['decrypt']);
 return new TextDecoder().decode(await crypto.subtle.decrypt({name:'AES-GCM',iv:decode(iv),additionalData:new TextEncoder().encode(CENTRAL_DRIVE_EMAIL)},key,decode(ciphertext)));
}
