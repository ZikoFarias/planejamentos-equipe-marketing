import {createRoot} from 'react-dom/client';
import Board from './board';
const root=document.getElementById('marketing-root');
if(root)createRoot(root).render(<Board/>);
