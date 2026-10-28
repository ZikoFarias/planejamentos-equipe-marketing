import {getTeamSession} from '../team-session';
import {redirect} from 'next/navigation';
import LoginForm from './login-form';
export default async function Login(){if(await getTeamSession())redirect('/');return <LoginForm/>}
