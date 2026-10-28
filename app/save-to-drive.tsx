'use client';
import {useEffect,useRef,useState} from 'react';
import type {Attachment} from './model';
import {driveConfig,artworkLabels,type ArtworkKind} from './drive-config';
import {prepareDrive,authorizeDrive,getDriveToken,companyDriveFolder,exportAttachment,localAttachment} from './drive-client';
import {ColorSelect} from './color-select';

export function SaveToDrive({attachment,company,disabled,onBusy,onSaved}:{attachment:Attachment,company:string,disabled:boolean,onBusy:(busy:boolean)=>void,onSaved:(attachment:Attachment)=>void}){
  const [ready,setReady]=useState(false),[error,setError]=useState(''),[status,setStatus]=useState('');
  const [kind,setKind]=useState<ArtworkKind>(attachment.artworkKind||'reference');
  const button=useRef<HTMLButtonElement>(null),running=useRef(false);
  useEffect(()=>{let alive=true;if(false)prepareDrive().then(()=>{if(alive)setReady(true)}).catch(e=>{if(alive)setError(e.message)});return()=>{alive=false}},[]);
  if(driveConfig.enabled||!localAttachment(attachment))return null;
  async function save(){
    if(running.current||disabled||!ready)return;
    running.current=true;setError('');setStatus('Autorizando Google…');onBusy(true);
    // Native modal dialogs sit above Google Picker. Temporarily suspend the card,
    // preserving its draft, and restore the same dialog when folder choice ends.
    const dialog=button.current?.closest('dialog') as HTMLDialogElement|null;
    let token='';
    try{
      token=getDriveToken()||await authorizeDrive();
      const wasOpen=!!dialog?.open;if(wasOpen)dialog!.close();
      let folder;
      try{folder=await companyDriveFolder(token,company,kind)}finally{if(wasOpen&&dialog?.isConnected&&!dialog.open)dialog.showModal()}
      if(!folder){setStatus('Seleção cancelada. Nenhum arquivo enviado.');return}
      const drive=await exportAttachment(attachment,token,folder,kind,setStatus);
      onSaved({...attachment,artworkKind:kind,drive,backup:undefined});
      setStatus('Arquivo salvo em '+folder.name+'. Salve a tarefa para guardar o vínculo.');
    }catch(e){setStatus('');setError(e instanceof Error?e.message:'Não foi possível salvar no Drive.')}
    finally{token='';running.current=false;onBusy(false);button.current?.focus()}
  }
  return <details className="drive-export"><summary>{attachment.backup?'Tentar backup no Drive':'Salvar no Drive'}</summary><div className="drive-export-content">
    <label>Tipo de arquivo<ColorSelect label="Tipo de arquivo no Drive" value={kind} disabled={disabled} onChange={value=>setKind(value as ArtworkKind)} options={Object.entries(artworkLabels).map(([value,label])=>({value,label,color:'#579dff'}))}/></label>
    <small>O destino é definido pela empresa e pelo tipo de arquivo. O anexo original é preservado.</small>
    <button ref={button} type="button" disabled={disabled||!ready} onClick={save}>{running.current?'Salvando…':'Salvar na pasta da empresa'}</button>
    {!ready&&!error&&<small role="status">Carregando Google…</small>}
    {!ready&&error&&<button type="button" onClick={()=>{setError('');prepareDrive().then(()=>setReady(true)).catch(e=>setError(e.message))}}>Tentar carregar Google</button>}
    {status&&<p role="status">{status}</p>}{error&&<p role="alert">{error}</p>}
  </div></details>
}
