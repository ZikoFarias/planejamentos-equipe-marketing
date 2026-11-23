import fs from 'node:fs';
import path from 'node:path';
import {execFileSync} from 'node:child_process';
import {build} from 'esbuild';
import {pathToFileURL} from 'node:url';
const config='.sites-runtime/cloudflare-free-preview/server/wrangler.json',target=JSON.parse(fs.readFileSync(config,'utf8'));
if(target.name!=='planejamentos-marketing-teste-gratis'||target.d1_databases?.find(d=>d.binding==='DB')?.database_id!=='3dbf5037-7f75-4567-9600-1314f0489114')throw Error('Configuração de destino inesperada.');
const tool=path.resolve('.sites-runtime/task-type-migration-tools.mjs');
await build({stdin:{contents:"export * from './app/task-types';export * from './app/purchases';export * from './app/reviewer-policy';export * from './app/captions';",resolveDir:process.cwd()},bundle:true,platform:'node',format:'esm',outfile:tool});
const {normalizeTaskType,isPurchase,purchaseReady,lucioOnly,needsCaption,quoteApproved}=await import(pathToFileURL(tool));
function run(args){try{return JSON.parse(execFileSync(process.execPath,['--import','./scripts/sites-env.mjs','./node_modules/wrangler/bin/wrangler.js','d1','execute','planejamentos-marketing-teste-gratis','--remote','--config',config,'--json',...args],{encoding:'utf8',stdio:['ignore','pipe','pipe'],maxBuffer:16*1024*1024}))}catch{throw Error('Não foi possível concluir a operação no banco. Nenhum dado foi exibido.')}} 
for(let attempt=0;attempt<3;attempt++){
 const row=run(['--command','SELECT data,revision,status_config FROM marketing_board WHERE id=1'])[0].results[0],current=JSON.parse(row.data),labels=JSON.parse(row.status_config||'{}').labels||{},next=current.map(t=>normalizeTaskType(t,labels));
 for(let i=0;i<current.length;i++){const a=current[i],b=next[i];for(const rule of [isPurchase,purchaseReady,quoteApproved])if(!!rule(a)!==!!rule(b))throw Error('A conversão alteraria uma regra financeira; operação interrompida.');if(lucioOnly(a,labels)!==lucioOnly(b,labels)||needsCaption(a,labels)!==needsCaption(b,labels))throw Error('A conversão alteraria revisores ou legendas; operação interrompida.');for(const key of ['id','title','status','description','assignees','attachments','comments','history','caption','approval'])if(JSON.stringify(a[key])!==JSON.stringify(b[key]))throw Error('A conversão alteraria dados do cartão; operação interrompida.')}
 const count=next.filter((t,i)=>JSON.stringify(t)!==JSON.stringify(current[i])).length,types={};for(const t of next)types[t.taskType]=(types[t.taskType]||0)+1;
 console.log(JSON.stringify({mode:process.argv.includes('--apply')?'apply':'dry-run',cards:next.length,changed:count,types,combinedPurchaseArt:next.filter(t=>t.externalArtwork).length}));
 if(!process.argv.includes('--apply')||!count)break;
 fs.writeFileSync(path.resolve('.sites-runtime/task-types-backup-'+Date.now()+'.json'),JSON.stringify(row));
 const file=path.resolve('.sites-runtime/task-types-migration.sql'),data=JSON.stringify(next).replaceAll("'","''");fs.writeFileSync(file,"UPDATE marketing_board SET data='"+data+"',revision=revision+1 WHERE id=1 AND revision="+row.revision+";");
 const result=run(['--file',file]);if(result.some(r=>r.meta?.changes>0)){console.log('Migração confirmada; histórico, arquivos, revisores e aprovações preservados.');break}if(attempt===2)throw Error('O quadro mudou durante a migração. Tente novamente.');
}
