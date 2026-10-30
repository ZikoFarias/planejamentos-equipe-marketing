
const fs=require('fs'),path=require('path'),assert=require('node:assert/strict'),{buildSync}=require('esbuild');
(async()=>{
 const {Window}=await import(require('node:url').pathToFileURL(path.resolve('.sites-runtime/drag-test-tools/node_modules/happy-dom/lib/index.js')).href);
 const win=new Window({url:'https://board.test'});for(const name of ['window','document','HTMLElement','Element','MouseEvent','PointerEvent','KeyboardEvent'])globalThis[name]=name==='window'?win:win[name];globalThis.IS_REACT_ACT_ENVIRONMENT=true;
 buildSync({entryPoints:['app/purchase-quote.tsx'],bundle:true,platform:'node',format:'cjs',jsx:'automatic',external:['react','react-dom'],outfile:'.sites-runtime/purchase-quote-dom.cjs'});
 buildSync({entryPoints:['app/account-menu.tsx'],bundle:true,platform:'node',format:'cjs',jsx:'automatic',external:['react','react-dom'],outfile:'.sites-runtime/account-menu-dom.cjs'});
 const React=require('react'),{act}=React,{createRoot}=require('react-dom/client'),{PurchaseQuote}=require(path.resolve('.sites-runtime/purchase-quote-dom.cjs')),{AccountMenu}=require(path.resolve('.sites-runtime/account-menu-dom.cjs'));
 const mount=document.createElement('div');document.body.appendChild(mount);const root=createRoot(mount);
 const task={id:'q',title:'Teste',tags:['COMPRA'],purchase:{requiresArt:false,stage:'orçamento',quotes:[{id:'a',place:'Loja',link:'',quantity:2,unitPrice:10}]}};
 let selection;
 await act(async()=>root.render(React.createElement(PurchaseQuote,{task,canEdit:true,canApprove:false,busy:false,onChange:(q,s)=>selection=s})));
 let details=mount.querySelector('details');assert.equal(details.open,false);assert.match(details.querySelector('[role=tooltip]').textContent,/seleção é opcional/);assert.equal(details.querySelector('input[type=radio]').disabled,true);assert.doesNotMatch(details.textContent,/Aprovar orçamento selecionado/);
 await act(async()=>details.querySelector('summary').click());assert.equal(details.open,true);
 await act(async()=>root.render(React.createElement(PurchaseQuote,{task,canEdit:false,canApprove:true,busy:false,onChange:(q,s)=>selection=s})));
 assert.equal(details.querySelector('input[type=radio]').disabled,false);assert.equal(details.querySelector('input[placeholder="Local / fornecedor"]').disabled,true);
 await act(async()=>details.querySelector('input[type=radio]').click());assert.equal(selection,'a');
 let settings=0,logout=0;
 await act(async()=>root.render(React.createElement(AccountMenu,{name:'Farias',email:'farias@test.local',role:'administrador',busy:false,onSettings:()=>settings++,onLogout:()=>logout++})));
 details=mount.querySelector('details');assert.equal(details.open,false);assert.match(details.textContent,/Configurações/);assert.match(details.textContent,/Sair/);
 await act(async()=>details.querySelector('summary').click());assert.equal(details.open,true);
 await act(async()=>details.querySelector('button').click());assert.equal(settings,1);assert.equal(details.open,false);
 details.open=true;await act(async()=>document.body.dispatchEvent(new PointerEvent('pointerdown',{bubbles:true})));assert.equal(details.open,false);
 details.open=true;await act(async()=>document.dispatchEvent(new KeyboardEvent('keydown',{key:'Escape',bubbles:true})));assert.equal(details.open,false);
 details.open=true;await act(async()=>details.querySelectorAll('button')[1].click());assert.equal(logout,1);assert.equal(details.open,false);
 await act(async()=>root.unmount());
 console.log('PASS: collapsed quotes expand; information tooltip present; only Lucio selects; no approval button; profile menu exposes settings/logout and closes on outside click or Escape.');
})().catch(e=>{console.error(e);process.exitCode=1});
