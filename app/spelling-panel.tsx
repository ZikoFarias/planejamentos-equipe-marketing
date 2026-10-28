'use client';
import type {Task} from './model';
import {finalImages,spellingFlagged,spellingFingerprint} from './spelling';
export function SpellingPanel({task,busy,canReview,canDismiss,onAction}:{task:Task,busy:boolean,canReview:boolean,canDismiss:boolean,onAction:(action:'review'|'dismiss')=>void}){
 if(!task.attachments.some(a=>a.artworkKind==='final'))return null;
 const review=task.spelling?.fingerprint===spellingFingerprint(task)?task.spelling:undefined,flagged=spellingFlagged(task),supported=finalImages(task).length>0;
 return <section className={'detail-section spelling-panel '+(flagged?'spelling-alert':'')} aria-label="Revisão ortográfica"><h3>Revisão ortográfica</h3><p role="status">{review?.message||(supported?'Verificação pendente. A análise começa automaticamente ao salvar a arte.':'Este formato precisa de revisão manual. A análise automática aceita PNG, JPEG e WebP.')}</p>{flagged&&<ul>{review!.issues.map((issue,i)=><li key={i}><small>{issue.file}</small><p><del>{issue.text}</del> → <strong>{issue.suggestion}</strong></p><small>{issue.reason}</small></li>)}</ul>}<div className="spelling-actions">{canReview&&supported&&<button disabled={busy} onClick={()=>onAction('review')}>Reanalisar</button>}{flagged&&canDismiss&&<button disabled={busy} onClick={()=>onAction('dismiss')}>Descartar alerta incorreto</button>}</div><small>A análise automática pode falhar. A aprovação humana continua obrigatória.</small></section>
}
