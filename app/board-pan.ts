export function bindBoardPan(board:HTMLElement){
 const view=board.ownerDocument.defaultView;if(!view)return()=>{};let activeCleanup:(()=>void)|undefined;
 const down=(event:PointerEvent)=>{if(event.button!==0||event.pointerType&&event.pointerType!=='mouse'||event.isPrimary===false)return;const target=event.target as HTMLElement;if(target.closest('.task,button,a,input,textarea,select,[role=button],.column-head,.add-card'))return;
 activeCleanup?.();const pointer=event.pointerId,startX=event.clientX,startScroll=board.scrollLeft;let moving=false;
 const move=(e:PointerEvent)=>{if(e.pointerId!==pointer)return;const dx=e.clientX-startX;if(!moving&&Math.abs(dx)<5)return;if(!moving){moving=true;board.classList.add('board-panning');board.setPointerCapture?.(pointer)}e.preventDefault();board.scrollLeft=startScroll-dx;};
 const end=(e:PointerEvent)=>{if(e.pointerId===pointer)cleanup()};
 const cleanup=()=>{view.removeEventListener('pointermove',move);view.removeEventListener('pointerup',end);view.removeEventListener('pointercancel',end);board.removeEventListener('lostpointercapture',end);board.classList.remove('board-panning');if(board.hasPointerCapture?.(pointer))board.releasePointerCapture(pointer);activeCleanup=undefined};
 activeCleanup=cleanup;view.addEventListener('pointermove',move,{passive:false});view.addEventListener('pointerup',end);view.addEventListener('pointercancel',end);board.addEventListener('lostpointercapture',end);
 };
 board.addEventListener('pointerdown',down);return()=>{activeCleanup?.();board.removeEventListener('pointerdown',down)};
}
