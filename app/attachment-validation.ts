// Accept legacy attachments without assigning a new category or moving a file.
export function validAttachmentMetadata(a:any){
  if(!a||typeof a!=='object')return false;
  if(a.artworkKind!==undefined&&!['reference','final'].includes(a.artworkKind))return false;
  if(a.drive!==undefined){const d=a.drive,id=(value:unknown)=>typeof value==='string'&&/^[a-zA-Z0-9_-]{10,200}$/.test(value);
    if(!d||!id(d.fileId)||!id(d.folderId)||typeof d.folderName!=='string'||d.folderName.length>1000||d.url!=='https://drive.google.com/file/d/'+d.fileId+'/view'||typeof d.savedAt!=='string'||!Number.isFinite(Date.parse(d.savedAt)))return false;
  }
  return true;
}
