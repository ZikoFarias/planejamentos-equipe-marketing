export const MAX_PROFILE_SOURCE=100*1024*1024;
export const MAX_PROFILE_UPLOAD=10*1024*1024;
export async function fitProfilePhoto(width:number,height:number,encode:(width:number,height:number,quality:number)=>Promise<Blob>){
 if(!Number.isFinite(width)||!Number.isFinite(height)||width<1||height<1)throw Error('Não foi possível ler as dimensões da foto.');
 const scale=Math.min(1,1600/Math.max(width,height));let w=Math.max(1,Math.round(width*scale)),h=Math.max(1,Math.round(height*scale));
 for(let attempt=0;attempt<5;attempt++){const blob=await encode(w,h,.88-attempt*.08);if(blob.size>0&&blob.size<=MAX_PROFILE_UPLOAD)return blob;w=Math.max(1,Math.round(w*.75));h=Math.max(1,Math.round(h*.75))}
 throw Error('Não foi possível compactar a foto para até 10 MB. Escolha outra imagem.');
}
export async function compressProfilePhoto(file:File):Promise<File>{
 if(!file.size||file.size>MAX_PROFILE_SOURCE)throw Error('Escolha uma foto de até 100 MB.');
 if(!['image/png','image/jpeg','image/webp'].includes(file.type))throw Error('Escolha uma foto PNG, JPG ou WebP.');
 const url=URL.createObjectURL(file),image=new Image();
 try{image.src=url;await image.decode();const canvas=document.createElement('canvas');
 const blob=await fitProfilePhoto(image.naturalWidth,image.naturalHeight,async(width,height,quality)=>{canvas.width=width;canvas.height=height;const ctx=canvas.getContext('2d');if(!ctx)throw Error('Seu navegador não conseguiu preparar a foto.');ctx.fillStyle='#fff';ctx.fillRect(0,0,width,height);ctx.drawImage(image,0,0,width,height);return new Promise<Blob>((resolve,reject)=>canvas.toBlob(blob=>blob?resolve(blob):reject(Error('Falha ao compactar a foto.')),'image/jpeg',quality))});
 canvas.width=0;canvas.height=0;return new File([blob],file.name.replace(/\.[^.]+$/,'')+'-perfil.jpg',{type:'image/jpeg',lastModified:Date.now()});
 }catch(e){throw e instanceof Error?e:Error('Não foi possível abrir a foto.')}finally{URL.revokeObjectURL(url)}
}
