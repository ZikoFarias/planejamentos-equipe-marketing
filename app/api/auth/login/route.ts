import {env} from 'cloudflare:workers';
import {handleTeamLogin} from '../../../team-login-handler';
export const POST=(req:Request)=>handleTeamLogin(req,env);
