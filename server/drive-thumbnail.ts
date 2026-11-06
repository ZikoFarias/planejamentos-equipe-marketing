// Proxy Drive thumbnails so private image previews never expose the access token.
export async function driveThumbnail(id:string,token:string,size:number):Promise<Response|null>{
 try{
  const headers={Authorization:'Bearer '+token};
  const metadata=await fetch('https://www.googleapis.com/drive/v3/files/'+id+'?fields=thumbnailLink,mimeType&supportsAllDrives=true',{headers});
  if(!metadata.ok)return null;
  const file=await metadata.json() as {thumbnailLink?:string,mimeType?:string};
  if(!file.mimeType?.startsWith('image/')||!file.thumbnailLink)return null;
  const url=new URL(file.thumbnailLink);
  if(url.protocol!=='https:'||!url.hostname.endsWith('.googleusercontent.com'))return null;
  url.pathname=url.pathname.replace(/=s\d+[^/]*$/,'=s'+size);
  const thumbnail=await fetch(url.toString(),{headers});
  if(!thumbnail.ok||!/^image\/(png|jpeg|webp|gif|avif)(;|$)/.test(thumbnail.headers.get('Content-Type')||''))return null;
  return new Response(thumbnail.body,{headers:{'Content-Type':thumbnail.headers.get('Content-Type')!,'Cache-Control':'private, max-age=300','Vary':'Cookie','X-Content-Type-Options':'nosniff'}});
 }catch{return null}
}
