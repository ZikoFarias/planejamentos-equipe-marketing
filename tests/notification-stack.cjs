
const fs=require('fs'),path=require('path'),assert=require('node:assert/strict'),{buildSync}=require('esbuild');
(async()=>{
 const {Window}=await import(require('node:url').pathToFileURL(path.resolve('.sites-runtime/drag-test-tools/node_modules/happy-dom/lib/index.js')).href);
 const win=new Window({url:'https://board.test'});
 for(const name of ['window','document','HTMLElement','HTMLDialogElement','Element','MouseEvent','Event','MutationObserver'])globalThis[name]=name==='window'?win:win[name];
 globalThis.IS_REACT_ACT_ENVIRONMENT=true;const shown=[];win.HTMLElement.prototype.showPopover=function(){shown.push(this)};win.HTMLElement.prototype.hidePopover=function(){};
 buildSync({entryPoints:['app/notification-stack.tsx'],bundle:true,platform:'node',format:'cjs',jsx:'automatic',external:['react','react-dom'],outfile:'.sites-runtime/notification-stack-test.cjs'});
 const React=require('react'),{act}=React,{createRoot}=require('react-dom/client'),{NotificationStack}=require(path.resolve('.sites-runtime/notification-stack-test.cjs'));
 const mount=document.createElement('div');document.body.appendChild(mount);const root=createRoot(mount);let closed=0;
 const render=active=>React.createElement(NotificationStack,{active},React.createElement('div',{role:'alert'},'Erro',React.createElement('button',{onClick:()=>closed++},'Fechar')),React.createElement('div',{role:'status'},'Confirmado'));
 await act(async()=>root.render(render(true)));let layer=document.querySelector('.notification-stack');assert.equal(layer.parentElement,document.body);assert.equal(layer.getAttribute('popover'),'manual');assert.equal(layer.querySelector('.notification-corner').children.length,2);assert.equal(shown.at(-1),layer);
 const first=document.createElement('dialog');document.body.appendChild(first);await act(async()=>{first.showModal();await new Promise(r=>setTimeout(r,0))});
 layer=document.querySelector('.notification-stack');assert.equal(layer.parentElement,first);assert.equal(shown.at(-1),layer);
 const second=document.createElement('dialog');document.body.appendChild(second);await act(async()=>{second.showModal();await new Promise(r=>setTimeout(r,0))});
 layer=document.querySelector('.notification-stack');assert.equal(layer.parentElement,second);assert.equal(shown.at(-1),layer);
 const tooltip=document.createElement('div');tooltip.setAttribute('popover','manual');second.appendChild(tooltip);const count=shown.length,event=new Event('toggle');Object.defineProperty(event,'newState',{value:'open'});await act(async()=>tooltip.dispatchEvent(event));assert.ok(shown.length>count);assert.equal(shown.at(-1),layer);
 await act(async()=>layer.querySelector('button').click());assert.equal(closed,1);
 await act(async()=>{second.close();await new Promise(r=>setTimeout(r,0))});assert.equal(document.querySelector('.notification-stack').parentElement,first);
 await act(async()=>{first.close();await new Promise(r=>setTimeout(r,0))});assert.equal(document.querySelector('.notification-stack').parentElement,document.body);
 await act(async()=>root.render(render(false)));assert.equal(document.querySelector('.notification-stack'),null);
 await act(async()=>root.unmount());first.remove();second.remove();
 console.log('PASS: notifications stack together, use native top layer, follow nested dialogs, rise above later popovers, remain clickable, and return to the board on modal close.');
})().catch(e=>{console.error(e);process.exitCode=1});
