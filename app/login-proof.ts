export const PASSWORD_ITERATIONS=100000;
const hex=(bytes:ArrayBuffer)=>Array.from(new Uint8Array(bytes),b=>b.toString(16).padStart(2,'0')).join('');
const bytes=(value:string)=>Uint8Array.from(value.match(/../g)!,s=>parseInt(s,16));
export async function deriveLoginKey(password:string,salt:string){
 if(!/^[a-f0-9]{32}$/.test(salt))throw Error('Resposta de acesso inválida.');
 const key=await crypto.subtle.importKey('raw',new TextEncoder().encode(password),'PBKDF2',false,['deriveBits']);
 return hex(await crypto.subtle.deriveBits({name:'PBKDF2',salt:new TextEncoder().encode(salt),iterations:PASSWORD_ITERATIONS,hash:'SHA-256'},key,256));
}
export async function loginProof(keyHex:string,email:string,challenge:string){
 const key=await crypto.subtle.importKey('raw',bytes(keyHex),{name:'HMAC',hash:'SHA-256'},false,['sign']);
 return hex(await crypto.subtle.sign('HMAC',key,new TextEncoder().encode(JSON.stringify(['marketing-login-v1',email,challenge]))));
}
export async function verifyLoginProof(keyHex:string,email:string,challenge:string,proof:string){
 if(!/^[a-f0-9]{64}$/.test(keyHex)||!/^[a-f0-9]{64}$/.test(proof))return false;
 const key=await crypto.subtle.importKey('raw',bytes(keyHex),{name:'HMAC',hash:'SHA-256'},false,['verify']);
 return crypto.subtle.verify('HMAC',key,bytes(proof),new TextEncoder().encode(JSON.stringify(['marketing-login-v1',email,challenge])));
}
