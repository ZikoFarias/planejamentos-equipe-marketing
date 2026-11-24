'use client';
import {mediaType} from './media';
import {Info} from 'lucide-react';
import type {Task} from './model';
import {finalImages,needsFilenameRecheck,spellingFlagged,spellingFingerprint} from './spelling';
export const canShowSpellingPanel=(task:Task)=>task.attachments.some(a=>a.artworkKind==='final'&&!mediaType(a).startsWith('audio/'));
export function SpellingPanel({task,busy,canReview,canDismiss,onAction}:{task:Task,busy:boolean,canReview:boolean,canDismiss:boolean,onAction:(action:'review'|'dismiss')=>void}){
 if(!canShowSpellingPanel(task))return null;
 const review=task.spelling?.fingerprint===spellingFingerprint(task)?task.spelling:undefined,rechecking=needsFilenameRecheck(task),flagged=spellingFlagged(task),supported=finalImages(task).length>0;
 return <section className={'detail-section spelling-panel '+(flagged?'spelling-alert':'')} aria-label="Revisão automática"><div className="spelling-heading"><h3>Revisão automática</h3><details className="spelling-help"><summary aria-label="Informações sobre a revisão automática"><Info size={15} aria-hidden="true"/></summary><small>A análise automática pode falhar. A aprovação humana continua obrigatória.</small></details></div><p role="status">{rechecking?'Alerta antigo aguardando nova conferência do texto da imagem.':review?.state==='clean'?'Nenhum erro ortográfico detectado.':review?.message||(supported?'Verificação pendente. A análise começa automaticamente ao salvar a arte.':'Este formato precisa de revisão manual. A análise automática aceita PNG, JPEG e WebP.')}</p>{flagged&&!rechecking&&<ul>{review!.issues.map((issue,i)=><li key={i}><small>{issue.file}</small><p><del>{issue.text}</del> → <strong>{issue.suggestion}</strong></p><small>{issue.reason}</small></li>)}</ul>}<div className="spelling-actions">{canReview&&supported&&<button disabled={busy} onClick={()=>onAction('review')}>Reanalisar</button>}{flagged&&canDismiss&&<button disabled={busy} onClick={()=>onAction('dismiss')}>Ignorar erro ortográfico</button>}</div></section>
}
