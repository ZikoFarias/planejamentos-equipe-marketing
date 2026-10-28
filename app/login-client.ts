import {deriveLoginKey,loginProof} from './login-proof';
export async function submitTeamLogin(email:string,password:string){
 email=email.trim().toLowerCase();
 const controller=new AbortController(),timeout=setTimeout(()=>controller.abort(),30000);
 try{
  const headers={'Content-Type':'application/json'};
  const first=await fetch('/api/auth/challenge',{method:'POST',headers,body:JSON.stringify({email}),signal:controller.signal});
  const challenge:any=await first.json();if(!first.ok)throw Error(challenge.error||'Não foi possível entrar.');
  if(!/^[a-f0-9]{64}$/.test(challenge.challenge))throw Error('Resposta de acesso inválida.');
  const key=await deriveLoginKey(password,challenge.salt),proof=await loginProof(key,email,challenge.challenge);
  const response=await fetch('/api/auth/login',{method:'POST',headers,body:JSON.stringify({email,challenge:challenge.challenge,proof}),signal:controller.signal});
  const value:any=await response.json();if(!response.ok)throw Error(value.error||'Não foi possível entrar.');
 }finally{clearTimeout(timeout)}
}
