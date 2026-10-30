
const {buildSync}=require('esbuild'),fs=require('fs'),path=require('path'),assert=require('node:assert/strict');
(async()=>{
 const {Window}=await import(require('node:url').pathToFileURL(path.resolve('.sites-runtime/drag-test-tools/node_modules/happy-dom/lib/index.js')).href);
 const win=new Window({url:'https://board.test'});for(const name of ['window','document','HTMLElement','HTMLDialogElement','Element','MouseEvent','PointerEvent','KeyboardEvent','Event'])globalThis[name]=name==='window'?win:win[name];globalThis.IS_REACT_ACT_ENVIRONMENT=true;
 const React=require('react'),{act}=React,{createRoot}=require('react-dom/client');
 for(const entry of ['app/account-menu.tsx','app/personal-notification-ui.tsx','app/use-personal-notifications.ts'])buildSync({entryPoints:[entry],bundle:true,platform:'node',format:'cjs',jsx:'automatic',external:['react','react-dom'],outfile:'.sites-runtime/'+path.basename(entry).replace(/\.tsx?$/,'.cjs')});
 const {AccountMenu}=require(path.resolve('.sites-runtime/account-menu.cjs')),{PersonalNotificationPanel,PersonalNotificationBubble}=require(path.resolve('.sites-runtime/personal-notification-ui.cjs')),{usePersonalNotifications}=require(path.resolve('.sites-runtime/use-personal-notifications.cjs'));
 const mount=document.createElement('div');document.body.appendChild(mount);const root=createRoot(mount);let opened=0,read=[],closed=0,more=0,all=0;
 const notification={id:2,kind:'assigned',taskId:'card',title:'Novo cartão',message:'Arte para você',targets:[],createdAt:'2026-11-01T11:00:00Z',readAt:null,seenAt:null};
 await act(async()=>root.render(React.createElement(AccountMenu,{name:'Luiz',email:'luiz@test',role:'editor',unread:3,busy:false,onNotifications:()=>opened++,onSettings(){},onLogout(){}})));
 assert.equal(mount.querySelector('.account-unread').textContent,'3');await act(async()=>mount.querySelector('summary').click());await act(async()=>[...mount.querySelectorAll('button')].find(b=>b.textContent.includes('Notificações')).click());assert.equal(opened,1);
 await act(async()=>root.render(React.createElement(PersonalNotificationPanel,{items:[notification,{...notification,id:1,kind:'daily',taskId:undefined,targets:[{id:'pending',title:'Pendência',status:'a fazer luiz'}]}],unread:2,loading:false,error:'',moreBusy:false,hasMore:true,onMore:()=>more++,onReadAll:async()=>all++,onRead:async id=>read.push(id),onOpenTask:async(id,kind)=>{assert.ok(['card','pending'].includes(id));opened++;return true},onClose:()=>closed++})));
 assert.equal(mount.querySelector('dialog').open,true);assert.equal(mount.querySelectorAll('.personal-notification.unread').length,2);
 await act(async()=>mount.querySelector('.personal-notification-open').click());assert.equal(read.at(-1),2);assert.equal(closed,1);
 await act(async()=>mount.querySelector('.notification-targets button').click());assert.equal(read.at(-1),1);
 await act(async()=>mount.querySelector('.notifications-more').click());assert.equal(more,1);
 await act(async()=>mount.querySelector('.personal-notifications-actions button').click());assert.equal(all,1);
 const anchor=document.createElement('summary'),menu=document.createElement('details');menu.className='account-menu';menu.appendChild(anchor);document.body.appendChild(menu);anchor.getBoundingClientRect=()=>({bottom:55,right:980});let bubbleOpened=0,dismissed=0;
 await act(async()=>root.render(React.createElement(PersonalNotificationBubble,{item:notification,count:2,onOpen:()=>bubbleOpened++,onDismiss:()=>dismissed++})));
 assert.equal(mount.querySelector('.personal-notification-bubble').style.top,'67px');await act(async()=>mount.querySelector('.personal-bubble-open').click());assert.equal(bubbleOpened,1);await act(async()=>mount.querySelector('.personal-bubble-close').click());assert.equal(dismissed,1);
 const rows={'luiz@test':[{...notification},{...notification,id:1}],'mateus@test':[{...notification,id:99,taskId:'other',title:'Mateus'}]};let owner='luiz@test',delayOwner='',release;const posts=[];
 globalThis.fetch=async(url,options={})=>{
  const requestedOwner=owner;
  if(options.method==='POST'){const body=JSON.parse(options.body);posts.push(body);for(const row of rows[requestedOwner])if(body.action==='read-all'||body.ids?.includes(row.id)){row.seenAt='seen';if(body.action!=='seen')row.readAt='read'}return Response.json({ok:true,unread:rows[requestedOwner].filter(row=>!row.readAt).length})}
  const value={items:structuredClone(rows[requestedOwner]),unread:rows[requestedOwner].filter(row=>!row.readAt).length,next:null};
  if(delayOwner===requestedOwner){delayOwner='';return new Promise(resolve=>{release=()=>resolve(Response.json(value))})}
  return Response.json(value);
 };
 let hook;
 function Harness({email}){hook=usePersonalNotifications(email,true,()=>{});return React.createElement('div',{},hook.bubble?.id||'none')}
 const tick=()=>new Promise(resolve=>setTimeout(resolve,0));
 await act(async()=>{root.render(React.createElement(Harness,{email:owner}));await tick()});assert.equal(hook.unread,2);assert.equal(hook.bubble.id,2);
 await act(async()=>{win.dispatchEvent(new Event('focus'));await tick()});assert.equal(hook.bubble.id,2,'Older unseen messages must not replace the current bubble');
 await act(async()=>{hook.openPanel();await tick()});assert.equal(hook.bubble,null);assert.ok(posts.some(post=>post.action==='seen'));assert.equal(hook.unread,2);
 await act(async()=>{await hook.read(2);await tick()});assert.equal(hook.unread,1);
 await act(async()=>{await hook.markAll();await tick()});assert.equal(hook.unread,0);
 await act(async()=>hook.closePanel());rows[owner].unshift({...notification,id:3,readAt:null,seenAt:null});await act(async()=>{win.dispatchEvent(new Event('focus'));await tick()});assert.equal(hook.bubble.id,3);
 delayOwner=owner;await act(async()=>{win.dispatchEvent(new Event('focus'));await tick()});assert.equal(typeof release,'function');
 owner='mateus@test';await act(async()=>{root.render(React.createElement(Harness,{email:owner}));await tick()});assert.equal(hook.items[0].id,99);
 await act(async()=>{release();await tick()});assert.equal(hook.items[0].id,99,'A stale response from another account must be ignored');
 await act(async()=>root.unmount());menu.remove();
 console.log('PASS: profile unread counter and notifications menu; readable history and daily targets; clickable anchored bubble; no old-bubble cycling; read/seen separation; account switch discards stale responses.');
})().catch(error=>{console.error(error);process.exitCode=1});
