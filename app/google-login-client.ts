import {loginDestination} from './task-link';

type GoogleIdentity = {
 initialize(config: {client_id: string; nonce: string; callback: (result: {credential: string}) => void}): void;
 renderButton(element: HTMLElement, options: {theme: string; size: string; text: string; locale: string}): void;
};

let scriptLoad: Promise<void> | undefined;
function loadGoogleIdentity() {
 return scriptLoad ??= new Promise<void>((resolve, reject) => {
  const script = document.createElement('script');
  script.src = 'https://accounts.google.com/gsi/client';
  script.async = true;
  script.onload = () => resolve();
  script.onerror = () => { scriptLoad = undefined; reject(new Error('Google indisponível no momento.')); };
  document.head.appendChild(script);
 });
}

export function mountGoogleLogin(element: HTMLElement) {
 const button = element.querySelector<HTMLElement>('.google-login-button')!;
 const message = element.querySelector<HTMLElement>('.google-login-message')!;
 let active = true;
 let signingIn = false;
 const send = async (payload: object) => {
  const response = await fetch('/api/auth/google', {method: 'POST', headers: {'Content-Type': 'application/json'}, body: JSON.stringify({...payload,administrator:new URLSearchParams(window.location.search).get('admin')==='1'}), signal: AbortSignal.timeout(15000)});
  const data = await response.json() as {error?: string; clientId: string; nonce: string};
  if (!response.ok) throw new Error(data.error);
  return data;
 };
 const start = async () => {
  try {
   const [{clientId, nonce}] = await Promise.all([send({action: 'start'}), loadGoogleIdentity()]);
   if (!active) return;
   const identity = (window as Window & {google?: {accounts: {id: GoogleIdentity}}}).google?.accounts.id;
   if (!identity) throw new Error('Google indisponível no momento.');
   identity.initialize({client_id: clientId, nonce, callback: async ({credential}) => {
    if (!active || signingIn) return;
    signingIn = true;
    message.textContent = '';
    try {
     await send({credential});
     window.location.assign(loginDestination(window.location.search));
    } catch (error) {
     signingIn = false;
     if (active) message.textContent = error instanceof Error ? error.message : 'Não foi possível entrar com Google.';
     if (active) void start();
    }
   }});
   button.replaceChildren();
   identity.renderButton(button, {theme: 'filled_blue', size: 'large', text: 'signin_with', locale: 'pt-BR'});
  } catch(error) {
   if (active) message.textContent = error instanceof Error ? error.message : 'Google indisponível no momento.';
  }
 };
 void start();
 return () => { active = false; };
}
