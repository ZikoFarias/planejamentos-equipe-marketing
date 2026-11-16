import {env} from 'cloudflare:workers';
import {handleGoogleTeamLogin} from '../../../google-team-login';

export function POST(request: Request) {
 return handleGoogleTeamLogin(request, env);
}
