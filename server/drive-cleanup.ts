import type {Task} from '../app/model';
import {centralAccess} from './drive-central-storage';
type Job={file_id:string,desired_trashed:number,generation:number,attempts:number};
export function linkedCentralFiles(tasks:Task[]){
 const ids=new Set<string>();
 for(const task of tasks)for(const file of [...task.attachments,...task.comments.flatMap(comment=>comment.attachments||[])])
  if(file.drive?.central&&file.drive.fileId)ids.add(file.drive.fileId);
 return ids;
}
// The board trigger captures removals atomically. Retried jobs always recheck the live board.
// Files stay in the Drive trash; restoring a card through Undo restores its files as well.
export async function processDriveCleanup(env:Cloudflare.Env,now=Date.now(),fetcher:typeof fetch=fetch){
 const db=env.DB!;
 const jobs=(await db.prepare('SELECT file_id,desired_trashed,generation,attempts FROM marketing_drive_cleanup WHERE applied_generation<generation AND next_attempt<=? ORDER BY next_attempt,file_id LIMIT 3').bind(now).all<Job>()).results;
 let applied=0;
 for(const job of jobs){
  try{
   const owned=await db.prepare("SELECT task_id FROM marketing_central_uploads WHERE file_id=? AND task_id NOT IN ('_profile','_background')").bind(job.file_id).first();
   if(!owned)throw Error('Unmanaged file');
   const row=await db.prepare('SELECT data FROM marketing_board WHERE id=1').first<{data:string}>();
   if(!row)throw Error('Board unavailable');
   const linked=linkedCentralFiles(JSON.parse(row.data) as Task[]).has(job.file_id);
   // A newer board revision supersedes this job; the trigger has queued the correction.
   if(linked===!!job.desired_trashed)continue;
   const token=await centralAccess(env);
   const response=await fetcher('https://www.googleapis.com/drive/v3/files/'+encodeURIComponent(job.file_id)+'?supportsAllDrives=true&fields=id,trashed',{
    method:'PATCH',headers:{Authorization:'Bearer '+token,'Content-Type':'application/json'},body:JSON.stringify({trashed:!!job.desired_trashed}),signal:AbortSignal.timeout(15000)
   });
   if(!response.ok)throw Error('Drive unavailable');
   const file=await response.json() as {id?:string,trashed?:boolean};
   if(file.id!==job.file_id||file.trashed!==!!job.desired_trashed)throw Error('Drive did not confirm');
   const result=await db.prepare('UPDATE marketing_drive_cleanup SET applied_generation=?,attempts=0 WHERE file_id=? AND generation=?').bind(job.generation,job.file_id,job.generation).run();
   if(result.meta.changes)applied++;
   else await db.prepare('UPDATE marketing_drive_cleanup SET applied_generation=0,next_attempt=0 WHERE file_id=? AND generation>?').bind(job.file_id,job.generation).run();
  }catch{
   // A stale request may have reached Google before failing; reapply the newest intent.
   await db.prepare('UPDATE marketing_drive_cleanup SET applied_generation=0,next_attempt=0 WHERE file_id=? AND generation>?').bind(job.file_id,job.generation).run();
   const retry=now+Math.min(3600000,60000*2**Math.min(job.attempts,6));
   await db.prepare('UPDATE marketing_drive_cleanup SET attempts=attempts+1,next_attempt=? WHERE file_id=? AND generation=?').bind(retry,job.file_id,job.generation).run();
  }
 }
 return applied;
}
