import {loginDestination} from './task-link';
import {submitTeamLogin} from './login-client';
const form=document.querySelector<HTMLFormElement>('.login-panel form')!;
const email=form.querySelector<HTMLInputElement>('input[type=email]')!,password=form.querySelector<HTMLInputElement>('#login-password')!;
const submit=form.querySelector<HTMLButtonElement>('.login-submit')!,toggle=form.querySelector<HTMLButtonElement>('.login-password button')!;
const error=document.createElement('p');error.className='login-error';error.setAttribute('role','alert');error.hidden=true;form.insertBefore(error,submit);
toggle.addEventListener('click',()=>{const show=password.type==='password';password.type=show?'text':'password';toggle.setAttribute('aria-label',show?'Ocultar senha':'Mostrar senha')});
form.addEventListener('submit',async event=>{
 event.preventDefault();if(submit.disabled)return;
 error.hidden=true;submit.disabled=email.disabled=password.disabled=toggle.disabled=true;
 try{await submitTeamLogin(email.value,password.value);password.value='';window.location.assign(loginDestination(window.location.search))}
 catch(e){error.textContent=e instanceof Error&&e.name!=='AbortError'?e.message:'Não foi possível entrar. Confira a conexão e tente novamente.';error.hidden=false;submit.disabled=email.disabled=password.disabled=toggle.disabled=false}
});

