import {canEditQuotes,isPurchase,quotesFor,MAX_QUOTE_FILES} from '../../../../purchases';
import {uploadArtworkKind} from '../../../../upload-kind';
import {canAttachArt} from '../../../../art-flow';
import {env} from 'cloudflare:workers';
import {getActor} from '../../../../access';
import {canManageTask} from '../../../../permissions';
import {companyOf} from '../../../../workflow';
import {mediaType} from '../../../../media';
import type {Task} from '../../../../model';
import {storeCentralFile} from '../../../../../server/drive-central-storage';
import {attachCentralArtwork} from '../../../../../server/attach-central-artwork';
export async function POST(req:Request){try{
 if(req.headers.get('origin')!==new URL(req.url).origin)return Response.json({error:'Origem inválida.'},{status:403});
 const actor=await getActor();if(!actor)return Response.json({error:'Entre novamente.'},{status:401});
 const url=new URL(req.url),taskId=url.searchParams.get('task')||'',requestedKind=url.searchParams.get('kind'),name=url.searchParams.get('name')||'',size=Number(url.searchParams.get('size'));
 if(!['reference','final'].includes(requestedKind||'')||!req.body)return Response.json({error:'Arquivo inválido.'},{status:400});
 const row=await env.DB!.prepare('SELECT data FROM marketing_board WHERE id=1').first<{data:string}>();const task=(JSON.parse(row?.data||'[]') as Task[]).find(t=>t.id===taskId);
 if(!task||!canManageTask(task,actor))return Response.json({error:'Salve o cartão e confira sua permissão antes de anexar arquivos.'},{status:403});
 const quoteId=url.searchParams.get('quote');
 const type=mediaType({name,type:req.headers.get('Content-Type')||''});
 if(quoteId!==null){
  if(!isPurchase(task)||!canEditQuotes(actor))return Response.json({error:'Seu perfil não pode anexar arquivos ao orçamento.'},{status:403});
  const quote=quotesFor(task).find(q=>q.id===quoteId);
  if(!quote||(quote.attachments?.length||0)>=MAX_QUOTE_FILES||!(type.startsWith('image/')||type==='application/pdf'))return Response.json({error:'Escolha um orçamento com espaço para anexar fotos ou PDFs.'},{status:400});
 }
 if(quoteId===null&&!canAttachArt(task,actor))return Response.json({error:'Lúcio e Mateus apenas revisam nesta etapa; não podem inserir artes.'},{status:403});
 const kind=quoteId!==null?'reference':uploadArtworkKind(actor,requestedKind as 'reference'|'final');
 const company=companyOf(task)?.id;if(!company)return Response.json({error:'Selecione a empresa e salve o cartão antes de anexar.'},{status:400});
 const started=performance.now();
 const attachment=await storeCentralFile({env,company,kind:kind as 'reference'|'final',name,type,size,body:req.body,owner:actor.user.email,taskId});
 const uploaded=performance.now();
 if(url.searchParams.get('attach')!=='1')return Response.json(attachment,{headers:{'Cache-Control':'no-store'}});
 const current=await getActor();if(!current)throw Error('O arquivo chegou ao Drive, mas a sessão expirou. Entre novamente e confira antes de reenviar.');
 const board=await attachCentralArtwork(current,taskId,company,attachment,quoteId??undefined);
 return Response.json({...attachment,board},{headers:{'Cache-Control':'no-store','Server-Timing':`drive;dur=${Math.round(uploaded-started)},link;dur=${Math.round(performance.now()-uploaded)}`}});
 }catch(e){return Response.json({error:e instanceof Error?e.message:'Não foi possível confirmar o envio.'},{status:503,headers:{'Cache-Control':'no-store'}})}}
