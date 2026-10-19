import {env} from 'cloudflare:workers';
import {getActor} from '../../access';
import {MAX_FILE_SIZE,PART_SIZE,mediaType} from '../../media';
const json=(data:unknown,status=200)=>Response.json(data,{status});
export async function POST(req:Request){try{
 const jsonRequest=req.headers.get('content-type')?.includes('application/json');
 if(!jsonRequest&&Number(req.headers.get('content-length')||0)>11*1024*1024)return json({error:'Use o envio em partes para arquivos maiores que 10 MB.'},413);
 const body:any=jsonRequest?await req.json():await req.formData();
 if(req.headers.get('origin')!==new URL(req.url).origin)return json({error:'Origem inválida.'},403);
 const c=await getActor();if(!c)return json({error:'Entre novamente.'},401);
 const background=jsonRequest&&body.purpose==='background';
 if(!(background&&!!c.role)&&(!['administrador','editor'].includes(c.role)||(c.role!=='administrador'&&!c.persona)))return json({error:'Seu perfil não permite anexar arquivos.'},403);
 if(jsonRequest){
 if(body.action!=='init'||typeof body.name!=='string'||!body.name.trim()||body.name.length>300||!Number.isSafeInteger(body.size)||body.size<1||body.size>MAX_FILE_SIZE)return json({error:'Escolha um arquivo entre 1 byte e 100 MB.'},400);
 const id=crypto.randomUUID(),name=body.name,type=mediaType({name,type:body.type});
 if(background&&(body.size>20*1024*1024||!/^image\/(png|jpeg|webp|gif|avif)$/.test(type)))return json({error:'Escolha uma imagem PNG, JPG, WebP, GIF ou AVIF de até 20 MB.'},400);
 const upload=await env.BUCKET!.createMultipartUpload(id,{httpMetadata:{contentType:type,contentDisposition:`attachment; filename*=UTF-8''${encodeURIComponent(name)}`},customMetadata:{name,type}});
 await c.db.prepare('INSERT INTO marketing_uploads(id,email) VALUES(?,?)').bind(id,c.user.email.toLowerCase()).run();
 await env.BUCKET!.put('_pending/'+id,JSON.stringify({uploadId:upload.uploadId,name,type,size:body.size,createdAt:Date.now(),purpose:background?'background':'task'}));
 return json({id,partSize:PART_SIZE});}
 const file=body.get('file');if(!(file instanceof File)||file.size>10*1024*1024)return json({error:'Escolha um arquivo com até 100 MB pelo envio em partes.'},400);
 const id=crypto.randomUUID(),type=mediaType({name:file.name,type:file.type});await env.BUCKET!.put(id,file.stream(),{httpMetadata:{contentType:type,contentDisposition:`attachment; filename*=UTF-8''${encodeURIComponent(file.name)}`},customMetadata:{name:file.name,type}});await c.db.prepare('INSERT INTO marketing_uploads(id,email) VALUES(?,?)').bind(id,c.user.email.toLowerCase()).run();return json({name:file.name,url:'/api/files/'+id,type,size:file.size});
 }catch{return json({error:'Falha ao iniciar o envio. Seus anexos anteriores foram preservados.'},500)}}
