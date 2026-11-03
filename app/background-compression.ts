export const MAX_BACKGROUND_SOURCE=20*1024*1024;
export const MAX_BACKGROUND_RENDER=1536*1024;
export async function fitBackgroundImage(width:number,height:number,encode:(width:number,height:number,quality:number)=>Promise<Blob>){
 if(!Number.isFinite(width)||!Number.isFinite(height)||width<1||height<1)throw Error('Não foi possível ler a imagem de fundo.');
 const scale=Math.min(1,2560/Math.max(width,height));let w=Math.max(1,Math.round(width*scale)),h=Math.max(1,Math.round(height*scale));
 for(let attempt=0;attempt<6;attempt++){const blob=await encode(w,h,.84-attempt*.07);if(blob.size>0&&blob.size<=MAX_BACKGROUND_RENDER)return blob;w=Math.max(1,Math.round(w*.8));h=Math.max(1,Math.round(h*.8))}
 throw Error('Não foi possível preparar uma versão leve deste fundo.');
}
export async function compressBackgroundImage(file:File):Promise<File>{
 if(!file.size||file.size>MAX_BACKGROUND_SOURCE)throw Error('Escolha uma imagem de fundo de até 20 MB.');
 if(!/^image\/(png|jpeg|webp|gif|avif)$/.test(file.type))throw Error('Escolha uma imagem PNG, JPG, WebP, GIF ou AVIF.');
 const url=URL.createObjectURL(file),image=new Image(),canvas=document.createElement('canvas');
 try{image.src=url;await image.decode();const blob=await fitBackgroundImage(image.naturalWidth,image.naturalHeight,async(width,height,quality)=>{canvas.width=width;canvas.height=height;const ctx=canvas.getContext('2d');if(!ctx)throw Error('Não foi possível otimizar o fundo.');ctx.drawImage(image,0,0,width,height);return new Promise<Blob>((resolve,reject)=>canvas.toBlob(value=>value?resolve(value):reject(Error('Não foi possível otimizar o fundo.')),'image/webp',quality))});const ext=blob.type==='image/jpeg'?'jpg':blob.type==='image/png'?'png':'webp';return new File([blob],file.name.replace(/\.[^.]+$/,'')+'-fundo.'+ext,{type:blob.type,lastModified:Date.now()})}finally{image.src='';canvas.width=0;canvas.height=0;URL.revokeObjectURL(url)}
}
