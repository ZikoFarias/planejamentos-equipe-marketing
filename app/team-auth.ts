export const teamAccounts:Record<string,string>={
 'ezequiel2303f@gmail.com':'farias',
 'marketingluke09@gmail.com':'lucio','marketingluke06@gmail.com':'farias',
 'marketingluke02@gmail.com':'luiz','marketingluke24@gmail.com':'mateus',
};
export const SESSION_COOKIE='marketing_session';
export const SESSION_SECONDS=12*60*60;
const hex=(data:ArrayBuffer)=>Array.from(new Uint8Array(data),b=>b.toString(16).padStart(2,'0')).join('');
export const tokenHash=async(token:string)=>hex(await crypto.subtle.digest('SHA-256',new TextEncoder().encode(token)));
export async function checkPassword(password:string,salt:string,expected:string){
 if(!/^[a-f0-9]{32}$/.test(salt)||!/^[a-f0-9]{64}$/.test(expected))return false;
 const key=await crypto.subtle.importKey('raw',new TextEncoder().encode(password),'PBKDF2',false,['deriveBits']);
 const actual=hex(await crypto.subtle.deriveBits({name:'PBKDF2',salt:new TextEncoder().encode(salt),iterations:100000,hash:'SHA-256'},key,256));
 let difference=0;for(let i=0;i<actual.length;i++)difference|=actual.charCodeAt(i)^expected.charCodeAt(i);return difference===0;
}
export const newToken=()=>hex(crypto.getRandomValues(new Uint8Array(32)).buffer);
export const validToken=(token:string)=>/^[a-f0-9]{64}$/.test(token);
export function sessionCookie(token:string,secure:boolean,maxAge=SESSION_SECONDS){return `${SESSION_COOKIE}=${token}; Path=/; HttpOnly; SameSite=Lax; Max-Age=${maxAge}${secure?'; Secure':''}`}

export const validTeamRole=(email:string,role:string)=>email==='ezequiel2303f@gmail.com'?role==='administrador':['editor','visualizador'].includes(role);
