export function linkedTaskId(search:string){const id=new URLSearchParams(search).get('card')||'';return /^[\w-]{1,100}$/.test(id)?id:''}
export function taskLink(origin:string,id:string){const url=new URL('/',origin);url.searchParams.set('card',id);return url.href}
export function loginDestination(search:string){const id=linkedTaskId(search);return id?'/?card='+encodeURIComponent(id):'/'}
