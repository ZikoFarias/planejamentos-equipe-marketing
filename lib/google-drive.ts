import { env } from 'cloudflare:workers';

export const DRIVE_UNITS = [
  'LUKE GROUP', 'FIBROPLAST', 'POSTO-PS', 'POSTO-RV', 'POSTO-BRR',
  'ERVATEIRA', 'MATERIAIS-PS', 'MATERIAIS-SMO', 'CONCRETO',
] as const;
export type DriveUnit = (typeof DRIVE_UNITS)[number];
export type DriveFolder = 'references' | 'finalized';
const FOLDER_NAMES: Record<DriveFolder, string> = {
  references: 'REFERÊNCIAS',
  finalized: 'ARTES FINALIZADAS',
};
const FOLDER_MIME = 'application/vnd.google-apps.folder';
export const MAX_UPLOAD_BYTES = 10 * 1024 * 1024;

export class DriveError extends Error {
  constructor(message: string, public status = 502) { super(message); }
}
export function isDriveUnit(value: unknown): value is DriveUnit {
  return typeof value === 'string' && DRIVE_UNITS.some(unit => unit === value);
}
export function isDriveFolder(value: unknown): value is DriveFolder {
  return value === 'references' || value === 'finalized';
}
export function canBrowseDrive(role: string, persona: string) {
  return role === 'administrador' || (role === 'editor' && !!persona);
}
export function canUploadDrive(role: string, persona: string) {
  return canBrowseDrive(role, persona);
}
type DriveItem = {
  id: string;
  name: string;
  mimeType: string;
  size?: string;
  modifiedTime?: string;
  parents?: string[];
  trashed?: boolean;
};
type Listed = {files: DriveItem[]; nextPageToken?: string};

function config() {
  const e = env as unknown as Record<string, string | undefined>;
  const clientId = e.GOOGLE_DRIVE_CLIENT_ID;
  const clientSecret = e.GOOGLE_DRIVE_CLIENT_SECRET;
  const refreshToken = e.GOOGLE_DRIVE_REFRESH_TOKEN;
  const rootId = e.GOOGLE_DRIVE_ROOT_FOLDER_ID;
  if (!clientId || !clientSecret || !refreshToken || !rootId) {
    throw new DriveError('Google Drive ainda não está configurado na hospedagem.', 503);
  }
  if (!/^[a-zA-Z0-9_-]{10,200}$/.test(rootId)) {
    throw new DriveError('ID da pasta principal inválido na configuração.', 503);
  }
  return {clientId, clientSecret, refreshToken, rootId};
}
async function accessToken() {
  const cfg = config();
  const response = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: {'Content-Type': 'application/x-www-form-urlencoded'},
    body: new URLSearchParams({
      client_id: cfg.clientId,
      client_secret: cfg.clientSecret,
      refresh_token: cfg.refreshToken,
      grant_type: 'refresh_token',
    }),
  });
  if (!response.ok) throw new DriveError('Falha na autenticação privada do Google Drive.', 503);
  const data: unknown = await response.json();
  if (!data || typeof data !== 'object' || !('access_token' in data) || typeof data.access_token !== 'string') {
    throw new DriveError('Resposta inválida do Google OAuth.', 503);
  }
  return {token: data.access_token, rootId: cfg.rootId};
}
async function request(url: string, token: string, init?: RequestInit) {
  const response = await fetch(url, {
    ...init,
    headers: {...init?.headers, Authorization: 'Bearer ' + token},
  });
  if (!response.ok) {
    if (response.status === 401 || response.status === 403) throw new DriveError('Conta de integração sem permissão no Drive.', 403);
    if (response.status === 404) throw new DriveError('Arquivo ou pasta não encontrado.', 404);
    if (response.status === 429) throw new DriveError('Google Drive temporariamente indisponível por excesso de requisições.', 429);
    throw new DriveError('Erro ao acessar o Google Drive.', 502);
  }
  return response;
}
function query(parent: string, name?: string) {
  const escape = (s: string) => s.replace(/\\/g, '\\\\').replace(/'/g, "\\'");
  return "'" + escape(parent) + "' in parents and trashed = false" +
    (name ? " and mimeType = '" + FOLDER_MIME + "' and name = '" + escape(name) + "'" : '');
}
async function listByParent(parent: string, token: string, name?: string, pageToken?: string) {
  const params = new URLSearchParams({
    q: query(parent, name),
    fields: 'nextPageToken,files(id,name,mimeType,size,modifiedTime,parents,trashed)',
    pageSize: '100',
    supportsAllDrives: 'true',
    includeItemsFromAllDrives: 'true',
  });
  if (pageToken) params.set('pageToken', pageToken);
  const result = await request('https://www.googleapis.com/drive/v3/files?' + params, token);
  const json = (await result.json()) as Listed;
  if (!Array.isArray(json.files)) throw new DriveError('Resposta inesperada do Drive.');
  return json;
}
async function findFolder(parent: string, name: string, token: string) {
  const page = await listByParent(parent, token, name);
  const found = page.files.filter(f => f.name === name && f.mimeType === FOLDER_MIME);
  if (!found.length) throw new DriveError('Pasta ' + name + ' não localizada ou sem acesso.', 404);
  if (found.length !== 1 || page.nextPageToken) throw new DriveError('Pastas duplicadas com o nome ' + name + '.', 409);
  return found[0].id;
}
async function selectedFolder(company: DriveUnit, folder: DriveFolder) {
  const {token, rootId} = await accessToken();
  const companyId = await findFolder(rootId, company, token);
  const folderId = await findFolder(companyId, FOLDER_NAMES[folder], token);
  return {token, folderId};
}
export async function listDriveFiles(company: DriveUnit, folder: DriveFolder, pageToken?: string) {
  const {token, folderId} = await selectedFolder(company, folder);
  const page = await listByParent(folderId, token, undefined, pageToken);
  return {
    files: page.files.filter(f => !f.trashed).map(f => ({
      id: f.id, name: f.name, mimeType: f.mimeType,
      size: f.size, modifiedTime: f.modifiedTime,
    })),
    nextPageToken: page.nextPageToken || null,
  };
}
export async function uploadDriveFile(company: DriveUnit, folder: DriveFolder, file: File) {
  if (!file.size || file.size > MAX_UPLOAD_BYTES) throw new DriveError('Escolha um arquivo de até 10 MB.', 413);
  const name = file.name.replace(/[\\/\x00-\x1f\x7f]/g, '_').trim().slice(0, 200);
  if (!name) throw new DriveError('Nome inválido.', 400);
  const mime = /^[\w.+-]+\/[\w.+-]+$/.test(file.type) ? file.type : 'application/octet-stream';
  const {token, folderId} = await selectedFolder(company, folder);
  const boundary = 'marketing-' + crypto.randomUUID();
  const body = new Blob([
    '--' + boundary + '\r\nContent-Type: application/json; charset=UTF-8\r\n\r\n',
    JSON.stringify({name, parents: [folderId]}),
    '\r\n--' + boundary + '\r\nContent-Type: ' + mime + '\r\n\r\n',
    file,
    '\r\n--' + boundary + '--\r\n',
  ]);
  const response = await request('https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart&fields=id,name,mimeType', token, {
    method: 'POST', headers: {'Content-Type': 'multipart/related; boundary=' + boundary}, body,
  });
  const result = (await response.json()) as {id?: string; name?: string};
  if (!result.id) throw new DriveError('Envio não confirmado. Verifique a pasta antes de reenviar.');
  return {id: result.id, name: result.name || name};
}
export async function openDriveFile(company: DriveUnit, folder: DriveFolder, id: string) {
  if (!/^[a-zA-Z0-9_-]{8,200}$/.test(id)) throw new DriveError('ID do arquivo inválido.', 400);
  const {token, folderId} = await selectedFolder(company, folder);
  const prefix = 'https://www.googleapis.com/drive/v3/files/' + encodeURIComponent(id);
  const response = await request(prefix + '?fields=id,name,mimeType,parents,trashed&supportsAllDrives=true', token);
  const metadata = (await response.json()) as DriveItem;
  if (metadata.trashed || !metadata.parents?.includes(folderId) || metadata.mimeType === FOLDER_MIME) {
    throw new DriveError('Arquivo fora da pasta autorizada.', 403);
  }
  const native = metadata.mimeType.startsWith('application/vnd.google-apps.');
  const mediaUrl = native ? prefix + '/export?mimeType=application%2Fpdf' : prefix + '?alt=media';
  const file = await request(mediaUrl, token);
  const name = (native ? metadata.name + '.pdf' : metadata.name).replace(/[\\/\x00-\x1f\x7f]/g, '_');
  const headers = new Headers({
    'Content-Type': native ? 'application/pdf' : 'application/octet-stream',
    'Content-Disposition': "attachment; filename*=UTF-8''" + encodeURIComponent(name),
    'Cache-Control': 'private, no-store',
    'X-Content-Type-Options': 'nosniff',
  });
  const len = file.headers.get('content-length');
  if (len) headers.set('Content-Length', len);
  return new Response(file.body, {headers});
}
