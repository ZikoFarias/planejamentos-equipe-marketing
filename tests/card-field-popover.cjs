const {buildSync}=require('esbuild'),assert=require('node:assert/strict'),path=require('path');
(async()=>{
 const {Window}=await import(require('url').pathToFileURL(path.resolve('.sites-runtime/drag-test-tools/node_modules/happy-dom/lib/index.js')).href),win=new Window({url:'https://board.test'});
 for(const name of ['window','document','HTMLElement','Element','Event','PointerEvent','KeyboardEvent'])globalThis[name]=name==='window'?win:win[name];
 globalThis.IS_REACT_ACT_ENVIRONMENT=true;win.HTMLElement.prototype.showPopover=function(){this.setAttribute('data-open','true')};win.HTMLElement.prototype.hidePopover=function(){this.removeAttribute('data-open')};
 buildSync({entryPoints:['app/card-field-popover.tsx'],bundle:true,platform:'node',format:'cjs',jsx:'automatic',external:['react','react-dom'],outfile:'.sites-runtime/card-field-popover-test.cjs'});
 const React=require('react'),{act}=React,{createRoot}=require('react-dom/client'),{CardFieldPopover}=require(path.resolve('.sites-runtime/card-field-popover-test.cjs')),mount=document.createElement('div'),anchor=document.createElement('button');
 document.body.append(anchor,mount);anchor.getBoundingClientRect=()=>({left:120,right:200,top:100,bottom:134,width:80,height:34});const root=createRoot(mount);let closed=0;
 for(const field of ['tags','dates','status','priority']){
  await act(async()=>root.render(React.createElement(CardFieldPopover,{field,anchor,onClose:()=>closed++},React.createElement('button',{},'Escolher'))));
  const panel=mount.querySelector('.card-field-popover');assert(panel);assert.equal(panel.style.left,'120px');assert.equal(panel.style.top,'140px');assert.equal(panel.getAttribute('aria-modal'),'false');assert.equal(mount.querySelector('.card-editor-overlay'),null);
 }
 await act(async()=>document.body.dispatchEvent(new PointerEvent('pointerdown',{bubbles:true})));assert.equal(closed,1);
 const key=new KeyboardEvent('keydown',{key:'Escape',bubbles:true,cancelable:true});await act(async()=>mount.querySelector('button').dispatchEvent(key));assert.equal(closed,2);assert(key.defaultPrevented);
 anchor.remove();await act(async()=>window.dispatchEvent(new Event('resize')));assert.equal(mount.querySelector('.card-field-popover').style.left,'120px','Removing a selected label must not move its menu to a corner');
 await act(async()=>root.unmount());console.log('PASS: all four menus anchor beside their fields without a modal overlay, close outside/on Escape, and retain position if the label anchor is removed.');
})().catch(error=>{console.error(error);process.exitCode=1});
