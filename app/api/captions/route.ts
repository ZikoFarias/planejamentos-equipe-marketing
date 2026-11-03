import {env} from 'cloudflare:workers';
import {getActor} from '../../access';
import {handleCaption} from '../../../server/caption-handler';
export async function POST(req:Request){return handleCaption(req,env,await getActor())}
