'use client';
import {useEffect, useRef, useState} from 'react';
import type {FormEvent} from 'react';
import {ArrowLeft, ArrowRight, CloudUpload, FileText, FolderOpen, RefreshCw} from 'lucide-react';
import './arquivos.css';

const units = [
  'LUKE GROUP', 'FIBROPLAST', 'POSTO-PS', 'POSTO-RV', 'POSTO-BRR',
  'ERVATEIRA', 'MATERIAIS-PS', 'MATERIAIS-SMO', 'CONCRETO',
] as const;
type Folder = 'references' | 'finalized';
type DriveFile = {id: string; name: string; mimeType: string; size?: string; modifiedTime?: string};
type Listing = {files: DriveFile[]; nextPageToken: string | null; canUpload: boolean; error?: string};
const folders: {id: Folder; label: string; detail: string}[] = [
  {id: 'references', label: 'REFERÊNCIAS', detail: 'Briefings, imagens e outros materiais de apoio.'},
  {id: 'finalized', label: 'ARTES FINALIZADAS', detail: 'Somente materiais revisados e prontos para entrega.'},
];
const fileSize = (bytes?: string) => {
  if (!bytes) return '';
  const n = Number(bytes);
  if (!Number.isFinite(n)) return '';
  return n >= 1024 * 1024 ? (n / 1048576).toFixed(1) + ' MB' : Math.max(1, Math.ceil(n / 1024)) + ' KB';
};
function endpoint(company: string, folder: Folder, fileId?: string) {
  const params = new URLSearchParams({company, folder});
  if (fileId) params.set('id', fileId);
  return '/api/drive' + (fileId ? '/file' : '') + '?' + params.toString();
}

export default function Arquivos() {
  const [company, setCompany] = useState<string>('FIBROPLAST');
  const [folder, setFolder] = useState<Folder>('references');
  const [files, setFiles] = useState<DriveFile[]>([]);
  const [nextPage, setNextPage] = useState<string | null>(null);
  const [canUpload, setCanUpload] = useState(false);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [refresh, setRefresh] = useState(0);
  const fileInput = useRef<HTMLInputElement>(null);
  const currentSelection = useRef(company + '/' + folder);
  currentSelection.current = company + '/' + folder;

  useEffect(() => {
    const controller = new AbortController();
    setLoading(true);
    setFiles([]);
    setNextPage(null);
    setCanUpload(false);
    setError('');
    fetch(endpoint(company, folder), {signal: controller.signal})
      .then(async response => {
        const result = (await response.json()) as Listing;
        if (!response.ok) throw new Error(result.error || 'Não foi possível acessar o Drive.');
        return result;
      })
      .then(result => {
        if (controller.signal.aborted) return;
        setFiles(result.files);
        setNextPage(result.nextPageToken);
        setCanUpload(result.canUpload);
      })
      .catch(reason => {
        if (!controller.signal.aborted) setError(reason instanceof Error ? reason.message : 'Erro ao carregar.');
      })
      .finally(() => {if (!controller.signal.aborted) setLoading(false);});
    return () => controller.abort();
  }, [company, folder, refresh]);

  async function loadMore() {
    if (!nextPage || loadingMore) return;
    const selection = company + '/' + folder;
    setLoadingMore(true);
    setError('');
    try {
      const response = await fetch(endpoint(company, folder) + '&pageToken=' + encodeURIComponent(nextPage));
      const result = (await response.json()) as Listing;
      if (!response.ok) throw new Error(result.error || 'Erro ao carregar mais arquivos.');
      if (currentSelection.current !== selection) return;
      setFiles(previous => [...previous, ...result.files]);
      setNextPage(result.nextPageToken);
    } catch (reason) {
      if (currentSelection.current === selection) setError(reason instanceof Error ? reason.message : 'Falha na consulta.');
    } finally {setLoadingMore(false);}
  }

  async function upload(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const file = fileInput.current?.files?.[0];
    if (!file || sending) return;
    if (!file.size || file.size > 10 * 1024 * 1024) {
      setError('Escolha um arquivo de até 10 MB.');
      return;
    }
    const selection = company + '/' + folder;
    setSending(true);
    setError('');
    setMessage('');
    try {
      const data = new FormData();
      data.append('company', company);
      data.append('folder', folder);
      data.append('file', file);
      const response = await fetch('/api/drive', {method: 'POST', body: data});
      const result = (await response.json()) as {error?: string};
      if (!response.ok) throw new Error(result.error || 'Não foi possível enviar.');
      if (fileInput.current) fileInput.current.value = '';
      if (currentSelection.current === selection) {
        setMessage('Arquivo enviado para a pasta selecionada no Google Drive.');
        setRefresh(value => value + 1);
      }
    } catch (reason) {
      if (currentSelection.current === selection) setError(reason instanceof Error ? reason.message : 'Falha no envio. Confirme no Drive antes de tentar novamente.');
    } finally {setSending(false);}
  }

  return <div className="drive-ui"><div className="drive-shell">
    <header className="drive-heading">
      <div><a className="drive-back" href="/"><ArrowLeft size={17}/> Voltar ao planejamento</a>
        <span className="drive-eyebrow">EQUIPE MARKETING</span>
        <h1>Arquivos da equipe</h1>
        <p>Referências e artes finalizadas nas pastas do Google Drive.</p>
      </div>
      <button type="button" className="drive-refresh" disabled={loading || sending}
        onClick={() => setRefresh(v => v + 1)}><RefreshCw size={16}/> Atualizar</button>
    </header>
    <div className="drive-layout">
      <nav className="drive-units" aria-label="Empresas e unidades">
        <h2>EMPRESAS E UNIDADES</h2>
        {units.map(name => <button key={name} type="button" aria-current={name === company ? 'page' : undefined}
          className={name === company ? 'is-active' : ''} onClick={() => {setCompany(name); setMessage('');}}>
          <FolderOpen size={17}/><span>{name}</span>{name === company && <ArrowRight size={15}/>}
        </button>)}
      </nav>
      <main className="drive-content">
        <span className="drive-eyebrow">{company}</span><h2>Banco de arquivos</h2>
        <div className="drive-tabs" role="tablist" aria-label="Pastas">
          {folders.map(item => <button key={item.id} type="button" role="tab"
            aria-selected={folder === item.id} className={folder === item.id ? 'is-active' : ''}
            onClick={() => {setFolder(item.id); setMessage('');}}>{item.label}</button>)}
        </div>
        <p className="drive-caption">{folders.find(item => item.id === folder)?.detail}</p>
        {!!error && <div className="drive-notice is-error" role="alert">{error}</div>}
        {!!message && <div className="drive-notice" role="status">{message}</div>}
        {loading ? <div className="drive-empty">Carregando arquivos…</div> :
          !error && !files.length ? <div className="drive-empty"><FolderOpen size={30}/><strong>Pasta vazia</strong><span>Não existem arquivos nesta pasta.</span></div> : null}
        {!loading && files.length > 0 && <div className="drive-file-list">
          {files.map(file => <div className="drive-file" key={file.id}>
            <div className="drive-file-icon"><FileText size={20}/></div>
            <div className="drive-file-info"><strong title={file.name}>{file.name}</strong>
              <span>{fileSize(file.size)}{file.size && file.modifiedTime ? ' · ' : ''}
                {file.modifiedTime ? new Date(file.modifiedTime).toLocaleDateString('pt-BR') : ''}</span>
            </div>
            {file.mimeType === 'application/vnd.google-apps.folder'
              ? <a className="drive-download" target="_blank" rel="noopener noreferrer"
                  href={'https://drive.google.com/drive/folders/' + encodeURIComponent(file.id)}>Abrir no Drive <ArrowRight size={14}/></a>
              : <a className="drive-download" href={endpoint(company, folder, file.id)}>Baixar <ArrowRight size={14}/></a>}
          </div>)}
        </div>}
        {!!nextPage && !loading && <button type="button" className="drive-more" disabled={loadingMore} onClick={loadMore}>
          {loadingMore ? 'Carregando…' : 'Carregar mais arquivos'}</button>}
        {canUpload && !loading && <form className="drive-upload" onSubmit={upload}>
          <div className="drive-upload-title"><CloudUpload size={21}/><div><strong>Enviar arquivo</strong>
            <p>Destino: {company} / {folders.find(item => item.id === folder)?.label}</p></div></div>
          <div className="drive-upload-actions"><input type="file" ref={fileInput} required
            disabled={sending} aria-label="Selecionar arquivo"/>
            <button type="submit" disabled={sending}>{sending ? 'Enviando…' : 'Enviar para o Drive'}</button></div>
          <small>Limite de 10 MB por arquivo. Nenhuma tarefa é aprovada automaticamente.</small>
        </form>}
      </main>
    </div>
  </div></div>;
}
