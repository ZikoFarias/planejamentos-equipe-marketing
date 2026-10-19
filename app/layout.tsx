import type { Metadata } from 'next';
import './globals.css';
export const metadata:Metadata={title:'Planejamentos — Equipe Marketing',description:'Planejamento de marketing em Kanban'};
export default function Layout({children}:{children:React.ReactNode}){return <html lang="pt-BR"><body>{children}</body></html>}
