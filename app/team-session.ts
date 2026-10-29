import {cookies} from 'next/headers';
import {env} from 'cloudflare:workers';
import {SESSION_COOKIE} from './team-auth';
import {teamSessionForToken} from './request-session';
export async function getTeamSession(){return teamSessionForToken((await cookies()).get(SESSION_COOKIE)?.value,env)}
