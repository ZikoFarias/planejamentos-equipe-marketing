import {createRoot} from 'react-dom/client';
import Board from './board';
import {installBoardEntrance} from './login-transition';
installBoardEntrance();
const root=document.getElementById('marketing-root');
if(root)createRoot(root).render(<Board/>);
