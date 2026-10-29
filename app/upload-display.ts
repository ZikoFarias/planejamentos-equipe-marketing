import type {Task} from './model';
import {automaticCover} from './media';
export function mergeUploadDraft(draft:Task,baseline:Task,remote:Task):Task{
 const next={...remote};
 for(const key of Object.keys(draft) as (keyof Task)[])if(!['attachments','coverUrl','approval','spelling','history'].includes(key)&&JSON.stringify(draft[key])!==JSON.stringify(baseline[key]))(next as any)[key]=draft[key];
 const removed=new Set(baseline.attachments.filter(a=>!draft.attachments.some(d=>d.url===a.url)).map(a=>a.url));
 next.attachments=[...remote.attachments.filter(a=>!removed.has(a.url)),...draft.attachments.filter(a=>!baseline.attachments.some(b=>b.url===a.url)&&!remote.attachments.some(r=>r.url===a.url))];
 const sameComment=(a:Task['comments'][number],b:Task['comments'][number])=>a.by===b.by&&a.at===b.at&&a.text===b.text;
 next.comments=[...remote.comments,...draft.comments.filter(c=>!baseline.comments.some(b=>sameComment(c,b))&&!remote.comments.some(r=>sameComment(c,r)))];
 next.coverUrl=automaticCover(next.attachments);return next;
}
const previews=new Map<string,string>(),listeners=new Set<()=>void>();
export function rememberUploadPreview(key:string,url:string){previews.set(key,url);for(const listener of listeners)listener();setTimeout(()=>{if(previews.get(key)===url){previews.delete(key);URL.revokeObjectURL(url);for(const listener of listeners)listener()}},120000)}
export const uploadPreview=(key:string)=>previews.get(key)||'';
export function subscribeUploadPreview(listener:()=>void){listeners.add(listener);return()=>{listeners.delete(listener)}}
