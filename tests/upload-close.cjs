const assert=require('node:assert/strict'),fs=require('fs'),vm=require('vm');
(async()=>{
 const source=fs.readFileSync('app/board.tsx','utf8'),start=source.indexOf('async function close(){'),end=source.indexOf('\n async function spellingAction',start);assert(start>=0&&end>start);
 const original={id:'original'},other={id:'other'};let resolveUpload,closed=false;
 const state={uploading:false,commentSending:false,saving:false,writeLock:{current:false},draft:original,actor:{},canWriteCaption:()=>false,commentFiles:[{}],commentMedia:[],commentSendLock:{current:false},liveBoard:{current:{draft:original}},setDraft(value){state.draft=value},dismissDraft(){closed=true;state.draft=null;state.liveBoard.current.draft=null},sendComment(){state.commentSendLock.current=true;return new Promise(resolve=>resolveUpload=resolve)}};
 const context=vm.createContext(state);vm.runInContext(source.slice(start,end)+';globalThis.closeCard=close;',context);
 const closing=context.closeCard();await Promise.race([closing,new Promise((_,reject)=>setTimeout(()=>reject(Error('Closing waited for upload')),150))]);assert(closed);resolveUpload(true);await Promise.resolve();assert.equal(state.draft,null,'Upload must not reopen its card');
 closed=false;state.draft=original;state.liveBoard.current.draft=original;state.commentSendLock.current=false;await context.closeCard();state.draft=other;state.liveBoard.current.draft=other;resolveUpload(false);await Promise.resolve();assert.equal(state.draft,other,'Failed background upload must not replace another open card');
 state.uploading=true;state.commentSending=true;state.draft=original;await context.closeCard();assert.equal(state.draft,null,'Already uploading comment can close immediately');
 console.log('PASS: close starts comment upload without waiting, completion stays closed, failure preserves a different open card and active uploads allow closing.');
})().catch(error=>{console.error(error);process.exitCode=1});
