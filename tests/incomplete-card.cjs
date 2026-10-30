
const {buildSync}=require('esbuild'),path=require('path'),assert=require('node:assert/strict');
(async()=>{
 const {Window}=await import(require('node:url').pathToFileURL(process.env.DOM_TEST_MODULE||path.resolve('.sites-runtime/drag-test-tools/node_modules/happy-dom/lib/index.js')).href);
 const win=new Window({url:'https://board.test'});
 for(const name of ['window','document','HTMLElement','Element','MouseEvent','Event'])globalThis[name]=name==='window'?win:win[name];
 globalThis.IS_REACT_ACT_ENVIRONMENT=true;
 buildSync({entryPoints:['app/incomplete-card-dialog.tsx'],bundle:true,platform:'node',format:'cjs',jsx:'automatic',external:['react','react-dom'],outfile:'.sites-runtime/incomplete-card-test.cjs'});
 const {missingCardFields,emptyNewCard,IncompleteCardDialog}=require(path.resolve('.sites-runtime/incomplete-card-test.cjs'));
 assert.deepEqual(missingCardFields({title:'  ',tags:[]}),['título','etiqueta de empresa']);
 assert.deepEqual(missingCardFields({title:'Compra',tags:['COMPRA']}),['etiqueta de empresa']);
 assert.deepEqual(missingCardFields({title:'',tags:['FIBROPLAST']}),['título']);
 assert.deepEqual(missingCardFields({title:'Arte',tags:['FIBROPLAST']}),[]);
 const blank={title:'',description:'',tags:[],attachments:[],comments:[],subtasks:[],checklist:[],assignees:['Lucio'],priority:'normal',start:'',due:''};assert.equal(emptyNewCard(blank,blank),true);for(const update of [{description:'Texto'},{title:'Título'},{tags:['FIBROPLAST']},{attachments:[{url:'file'}]},{due:'2026-11-01'}])assert.equal(emptyNewCard({...blank,...update},blank),false);assert.equal(emptyNewCard(blank,blank,'Comentário'),false);
 const React=require('react'),{act}=React,{createRoot}=require('react-dom/client');
 const mount=document.createElement('div');document.body.appendChild(mount);const root=createRoot(mount);
 let continued=0,discarded=0;const props={missing:['título','etiqueta de empresa'],isNew:true,onContinue:()=>continued++,onDiscard:()=>discarded++};
 await act(async()=>root.render(React.createElement(IncompleteCardDialog,props)));
 let modal=document.querySelector('[role=alertdialog]');assert.equal(modal.open,true);
 assert.match(modal.textContent,/Adicione um título e uma etiqueta de empresa/);
 assert.ok(document.getElementById(modal.getAttribute('aria-describedby')));
 await act(async()=>modal.querySelector('button').click());assert.equal(continued,1);assert.equal(discarded,0);
 await act(async()=>modal.dispatchEvent(new Event('cancel',{cancelable:true,bubbles:true})));assert.equal(continued,2);assert.equal(discarded,0);
 await act(async()=>modal.querySelectorAll('button')[1].click());assert.equal(discarded,1);
 await act(async()=>root.render(React.createElement(IncompleteCardDialog,{...props,isNew:false,missing:['etiqueta de empresa']})));
 assert.match(modal.textContent,/Descartar alterações/);assert.doesNotMatch(modal.textContent,/Cancelar cartão/);
 await act(async()=>root.unmount());assert.equal(document.querySelector('[role=alertdialog]'),null);
 console.log('PASS: missing title/company/both blocked; valid card accepted; central dialog continues safely, Escape preserves edits, and cancellation is explicit.');
})().catch(e=>{console.error(e);process.exitCode=1});
