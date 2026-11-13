import {getDocument,GlobalWorkerOptions} from 'pdfjs-dist';
GlobalWorkerOptions.workerSrc='/pdf.worker.min.mjs';
export async function firstPdfPage(url:string,signal:AbortSignal){
 const job=getDocument({url,withCredentials:true,useSystemFonts:true});
 const abort=()=>{void job.destroy()};signal.addEventListener('abort',abort,{once:true});
 try{signal.throwIfAborted();const pdf=await job.promise,page=await pdf.getPage(1),base=page.getViewport({scale:1}),viewport=page.getViewport({scale:Math.min(320/base.width,2)}),canvas=document.createElement('canvas');canvas.width=Math.ceil(viewport.width);canvas.height=Math.ceil(viewport.height);const context=canvas.getContext('2d');if(!context)throw Error('Canvas unavailable');await page.render({canvas,canvasContext:context,viewport}).promise;signal.throwIfAborted();return canvas.toDataURL('image/webp',.85)}finally{signal.removeEventListener('abort',abort);await job.destroy()}
}
