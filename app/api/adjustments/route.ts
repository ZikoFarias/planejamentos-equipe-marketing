import {env} from 'cloudflare:workers';
import {getActor} from '../../access';
import {handleCancelAdjustment} from '../../../server/adjustment-handler';
export async function POST(req:Request){return handleCancelAdjustment(req,env,await getActor())}
