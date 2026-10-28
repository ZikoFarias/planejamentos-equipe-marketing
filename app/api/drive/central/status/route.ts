import {env} from 'cloudflare:workers';
import {getActor} from '../../../../access';
import {CENTRAL_DRIVE_EMAIL} from '../../../../../server/drive-central-auth';
export async function GET(){const actor=await getActor();if(!actor)return Response.json({error:'Entre novamente.'},{status:401});const row=await env.DB!.prepare('SELECT email FROM marketing_drive_connection WHERE id=1').first<{email:string}>();return Response.json({connected:row?.email===CENTRAL_DRIVE_EMAIL,admin:actor.role==='administrador'},{headers:{'Cache-Control':'no-store'}})}
