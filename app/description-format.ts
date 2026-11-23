export const richDescriptionPrefix='<!--marketing-description-->';
export const isRichDescription=(value:string)=>value.startsWith(richDescriptionPrefix);
export const escapeDescription=(value:string)=>value.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
export function descriptionHtml(value:string){
 if(!isRichDescription(value))return escapeDescription(value).replace(/\*\*(.+?)\*\*/g,'<strong>$1</strong>').replace(/_([^_]+)_/g,'<em>$1</em>').replace(/\n/g,'<br>');
 const template=document.createElement('template');template.innerHTML=value.slice(richDescriptionPrefix.length);
 const allowed=new Set(['B','STRONG','I','EM','U','S','STRIKE','DEL','CODE','PRE','P','DIV','BR','UL','OL','LI','BLOCKQUOTE','H2','H3','SPAN','A','FONT']);
 function clean(node:Node):string{
  if(node.nodeType===3)return escapeDescription(node.textContent||'');
  if(node.nodeType!==1)return '';
  const el=node as HTMLElement;if(['SCRIPT','STYLE','IFRAME','OBJECT','SVG','MATH'].includes(el.tagName))return '';
  const body=Array.from(el.childNodes).map(clean).join('');if(!allowed.has(el.tagName))return body;
  const tag=el.tagName==='FONT'?'span':el.tagName.toLowerCase();
  let attrs='';
  const color=el.style.color||el.getAttribute('color')||'',bg=el.style.backgroundColor;
  const safe=(value:string)=>/^(#[a-f0-9]{3,8}|rgba?\([\d.,% ]+\)|[a-z]+)$/i.test(value);
  const style=[safe(color)?'color:'+color:'',bg&&safe(bg)?'background-color:'+bg:'',['left','center','right'].includes(el.style.textAlign)?'text-align:'+el.style.textAlign:''].filter(Boolean).join(';');
  if(style)attrs+=' style="'+escapeDescription(style)+'"';
  if(tag==='a'){const href=el.getAttribute('href')||'';if(/^(https?:\/\/|mailto:)/i.test(href))attrs+=' href="'+escapeDescription(href)+'" target="_blank" rel="noopener noreferrer"'}
  return '<'+tag+attrs+'>'+body+(tag==='br'?'':'</'+tag+'>');
 }
 return Array.from(template.content.childNodes).map(clean).join('');
}
export function descriptionText(value:string){
 if(!isRichDescription(value))return value;
 if(typeof document==='undefined')return value.slice(richDescriptionPrefix.length).replace(/<[^>]*>/g,'');
 const template=document.createElement('template');template.innerHTML=descriptionHtml(value).replace(/<br\s*\/?\s*>|<\/(?:div|p|li|h2|h3|blockquote)>/gi,'\n');return template.content.textContent?.trim()||'';
}
