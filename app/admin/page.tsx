import {redirect} from 'next/navigation';
import {getActor} from '../access';
import Board from '../board';
export default async function Admin(){const actor=await getActor();if(actor?.role!=='administrador')redirect('/login');return <Board/>}
