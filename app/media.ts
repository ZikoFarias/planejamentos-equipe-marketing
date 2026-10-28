import type {Attachment} from './model';
export const MAX_FILE_SIZE=100*1024*1024;
export const PART_SIZE=8*1024*1024;
const imageTypes:Record<string,string>={png:'image/png',jpg:'image/jpeg',jpeg:'image/jpeg',webp:'image/webp',gif:'image/gif',avif:'image/avif'};
const videoTypes:Record<string,string>={mp4:'video/mp4',webm:'video/webm',mov:'video/quicktime'};
export function mediaType(a:Pick<Attachment,'name'|'type'>){const ext=a.name.split('.').at(-1)?.toLowerCase()||'';const allowed=[...Object.values(imageTypes),...Object.values(videoTypes),'application/pdf'];return a.type&&allowed.includes(a.type)?a.type:imageTypes[ext]||videoTypes[ext]||(ext==='pdf'?'application/pdf':'application/octet-stream')}
export function previewKind(a:Pick<Attachment,'name'|'type'>){const type=mediaType(a);return type.startsWith('image/')?'image':type.startsWith('video/')?'video':type==='application/pdf'?'pdf':'file'}
export function previewUrl(a:Attachment){return /^\/api\/files\/[a-f0-9-]{36}$/.test(a.url)?a.url+'?preview=1':/^https?:\/\//.test(a.url)?a.url:''}
export function sizeLabel(bytes?:number){if(bytes==null)return '';return bytes>=1024*1024?(bytes/1024/1024).toFixed(1)+' MB':Math.max(1,Math.round(bytes/1024))+' KB'}
export function automaticCover(attachments:Attachment[]){const images=attachments.filter(a=>previewKind(a)==='image');return (images.filter(a=>a.artworkKind==='final').at(-1)||images.at(-1))?.url}
export function coverFor(task:{attachments:Attachment[],coverUrl?:string}){return task.coverUrl?task.attachments.find(a=>a.url===task.coverUrl&&previewKind(a)==='image'):undefined}
