import {env} from 'cloudflare:workers';
import {getActor} from '../../../../access';
import {serveCentralMedia} from '../../../../../server/central-media';
export async function GET(req:Request){return serveCentralMedia(req,env,await getActor())}
