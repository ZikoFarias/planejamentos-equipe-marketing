'use client';
import {EmojiButton} from './emoji-picker';
import {useEffect,useLayoutEffect,useRef,useState} from 'react';
import {Bold,Italic,Underline,Strikethrough,Code,Link,List,ListOrdered,Palette,ChevronDown,AlignLeft,AlignCenter,AlignRight,RemoveFormatting} from 'lucide-react';
import {descriptionHtml,descriptionText,richDescriptionPrefix} from './description-format';
const colors=['#f87171','#fb923c','#facc15','#38bdf8','#a78bfa','#f472b6','#4ade80','#d1d5db','#ffffff'];
const backgrounds=['#7f1d1d','#7c2d12','#713f12','#1e3a8a','#4c1d95','#831843','#14532d','#374151'];
export function DescriptionReadOnly({value}:{value:string}){
 const [html,setHtml]=useState('');useEffect(()=>setHtml(descriptionHtml(value)),[value]);
 return html?<div className="description-rich-read" dangerouslySetInnerHTML={{__html:html}}/>:<div className="description-rich-read">{descriptionText(value)}</div>;
}
export function DescriptionField({value,onChange}:{value:string,onChange:(value:string)=>void}){
 const ref=useRef<HTMLDivElement>(null),container=useRef<HTMLDivElement>(null),range=useRef<Range|null>(null),last=useRef(value);
 const [toolbar,setToolbar]=useState<{top:number,left:number}|null>(null),[menu,setMenu]=useState(''),[link,setLink]=useState('');
 useLayoutEffect(()=>{if(ref.current&&last.current!==value){ref.current.innerHTML=descriptionHtml(value);last.current=value}},[value]);
 useLayoutEffect(()=>{if(ref.current)ref.current.innerHTML=descriptionHtml(value)},[]);
 function emit(){if(!ref.current)return;const html=descriptionHtml(richDescriptionPrefix+ref.current.innerHTML);const next=ref.current.textContent?.trim()||ref.current.querySelector('li')?richDescriptionPrefix+html:'';last.current=next;onChange(next)}
 useEffect(()=>{
  function selected(){const selection=window.getSelection(),root=ref.current;if(!selection||!root||!selection.rangeCount||!root.contains(selection.anchorNode)||!root.contains(selection.focusNode)){if(!container.current?.contains(document.activeElement))setToolbar(null);return}const r=selection.getRangeAt(0);range.current=r.cloneRange();if(selection.isCollapsed){setToolbar(null);setMenu('');return}const box=r.getBoundingClientRect(),parent=container.current!.getBoundingClientRect();setToolbar({top:box.top-parent.top-46,left:Math.max(0,Math.min(box.left-parent.left,parent.width-330))})}
  document.addEventListener('selectionchange',selected);return()=>document.removeEventListener('selectionchange',selected);
 },[]);
 function restore(){ref.current?.focus();if(range.current){const selected=window.getSelection();selected?.removeAllRanges();selected?.addRange(range.current)}}
 function command(name:string,arg?:string){restore();document.execCommand(name,false,arg);emit();const selection=window.getSelection();if(selection?.rangeCount)range.current=selection.getRangeAt(0).cloneRange();setMenu('')}
 function tool(label:string,Icon:typeof Bold,name:string,arg?:string){return <button type="button" aria-label={label} title={label} onMouseDown={e=>e.preventDefault()} onClick={()=>command(name,arg)}><Icon size={16}/></button>}
 return <div className="description-editor" ref={container} onBlur={e=>{if(!e.currentTarget.contains(e.relatedTarget)){setToolbar(null);setMenu('')}}}>
 <div className="description-emoji-action"><EmojiButton shortcutOnly editorRef={ref} onOpen={()=>{const selection=window.getSelection();if(selection?.rangeCount&&ref.current?.contains(selection.anchorNode))range.current=selection.getRangeAt(0).cloneRange()}} onSelect={emoji=>{const root=ref.current;if(!root)return;root.focus();const selection=window.getSelection();let saved=range.current;if(!saved||!root.contains(saved.startContainer)){saved=document.createRange();saved.selectNodeContents(root);saved.collapse(false)}selection?.removeAllRanges();selection?.addRange(saved);document.execCommand('insertText',false,emoji);emit();if(selection?.rangeCount)range.current=selection.getRangeAt(0).cloneRange()}}/></div>
 <div ref={ref} className="description-rich-input" contentEditable spellCheck={true} lang="pt-BR" autoCorrect="on" autoCapitalize="sentences" suppressContentEditableWarning role="textbox" aria-label="Descrição" aria-multiline="true" data-placeholder="Descreva a entrega, as referências e o objetivo…" onInput={emit} onPaste={e=>{e.preventDefault();command('insertText',e.clipboardData.getData('text/plain'))}} onKeyDown={e=>{if((e.ctrlKey||e.metaKey)&&['b','i','u'].includes(e.key.toLowerCase())){e.preventDefault();command({b:'bold',i:'italic',u:'underline'}[e.key.toLowerCase()]!)}if(e.key==='Escape'){setToolbar(null);setMenu('')}}}/>
 {toolbar&&<div className="description-format-popover" style={{top:toolbar.top,left:toolbar.left}} onMouseDown={e=>{if(!(e.target instanceof HTMLInputElement))e.preventDefault()}}>
 <div className="description-format-bar" role="toolbar" aria-label="Formatar texto selecionado">
 <button type="button" title="Listas" aria-label="Listas" aria-expanded={menu==='list'} onClick={()=>setMenu(menu==='list'?'':'list')}><List size={16}/><ChevronDown size={11}/></button>
 <button type="button" title="Tipo de texto" aria-label="Tipo de texto" aria-expanded={menu==='text'} onClick={()=>setMenu(menu==='text'?'':'text')}>Texto<ChevronDown size={11}/></button>
 <button type="button" title="Cores do texto" aria-label="Cores do texto" aria-expanded={menu==='color'} onClick={()=>setMenu(menu==='color'?'':'color')}><Palette size={16}/></button>
 {tool('Negrito',Bold,'bold')}{tool('Itálico',Italic,'italic')}{tool('Sublinhado',Underline,'underline')}{tool('Tachado',Strikethrough,'strikeThrough')}
 {tool('Código',Code,'formatBlock','pre')}
 <button type="button" title="Alinhamento" aria-label="Alinhamento" onClick={()=>setMenu(menu==='align'?'':'align')}><AlignLeft size={16}/></button>
 <button type="button" title="Inserir link" aria-label="Inserir link" onClick={()=>{setMenu(menu==='link'?'':'link');setLink('')}}><Link size={16}/></button>
 </div>
 {menu&&<div className="description-format-menu">
 {menu==='list'&&<>{tool('Lista com marcadores',List,'insertUnorderedList')}{tool('Lista numerada',ListOrdered,'insertOrderedList')}</>}
 {menu==='text'&&<>{['p','h2','h3','blockquote'].map((tag,i)=><button type="button" key={tag} onClick={()=>command('formatBlock',tag)}>{['Texto normal','Título','Subtítulo','Citação'][i]}</button>)}</>}
 {menu==='align'&&<>{tool('Alinhar à esquerda',AlignLeft,'justifyLeft')}{tool('Centralizar',AlignCenter,'justifyCenter')}{tool('Alinhar à direita',AlignRight,'justifyRight')}</>}
 {menu==='color'&&<><small>Cores do texto</small><div className="description-swatches">{colors.map(color=><button type="button" key={color} style={{color}} aria-label={'Texto '+color} onClick={()=>{document.execCommand('styleWithCSS',false,'true');command('foreColor',color)}}>A</button>)}</div><small>Destaques do texto</small><div className="description-swatches">{backgrounds.map(color=><button type="button" key={color} style={{background:color}} aria-label={'Destaque '+color} onClick={()=>command('hiliteColor',color)}/>)}</div>{tool('Remover formatação',RemoveFormatting,'removeFormat')}</>}
 {menu==='link'&&<form onSubmit={e=>{e.preventDefault();const url=link.trim();if(/^(https?:\/\/|mailto:)/i.test(url))command('createLink',url)}}><input autoFocus type="url" aria-label="Endereço do link" placeholder="https://" value={link} onChange={e=>setLink(e.target.value)}/><button type="submit">Aplicar</button><button type="button" onClick={()=>command('unlink')}>Remover link</button></form>}
 </div>}
 </div>}
 </div>
}
