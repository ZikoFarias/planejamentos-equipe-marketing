import Board from './board';
import {redirect} from 'next/navigation';
import {getTeamSession} from './team-session';
export default async function Home(){if(!await getTeamSession())redirect('/login');return <Board/>}
