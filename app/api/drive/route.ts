import {getActor} from '../../access';
import {
  canBrowseDrive, canUploadDrive, DriveError, isDriveFolder, isDriveUnit,
  listDriveFiles, MAX_UPLOAD_BYTES, uploadDriveFile,
} from '../../../lib/google-drive';

export const dynamic = 'force-dynamic';
const json = (data: unknown, status = 200) => Response.json(data, {status, headers: {'Cache-Control': 'no-store'}});
const error = (reason: unknown) => reason instanceof DriveError
  ? json({error: reason.message}, reason.status)
  : json({error: 'Falha temporária ao acessar o Google Drive.'}, 502);

export async function GET(req: Request) {
  try {
    const actor = await getActor();
    if (!actor) return json({error: 'Entre novamente.'}, 401);
    if (!canBrowseDrive(actor.role, actor.persona)) return json({error: 'Acesso não liberado para arquivos.'}, 403);
    const url = new URL(req.url);
    const company = url.searchParams.get('company');
    const folder = url.searchParams.get('folder');
    const pageToken = url.searchParams.get('pageToken') || undefined;
    if (!isDriveUnit(company) || !isDriveFolder(folder) || (pageToken && pageToken.length > 1500)) {
      return json({error: 'Empresa ou pasta inválida.'}, 400);
    }
    const result = await listDriveFiles(company, folder, pageToken);
    return json({...result, canUpload: canUploadDrive(actor.role, actor.persona)});
  } catch (reason) { return error(reason); }
}

export async function POST(req: Request) {
  try {
    if (req.headers.get('origin') !== new URL(req.url).origin) return json({error: 'Origem inválida.'}, 403);
    const actor = await getActor();
    if (!actor) return json({error: 'Entre novamente.'}, 401);
    if (!canUploadDrive(actor.role, actor.persona)) return json({error: 'Seu perfil não permite enviar arquivos.'}, 403);
    const length = Number(req.headers.get('content-length') || 0);
    if (length > MAX_UPLOAD_BYTES + 1024 * 1024) return json({error: 'Arquivo acima de 10 MB.'}, 413);
    if (!req.headers.get('content-type')?.toLowerCase().startsWith('multipart/form-data')) return json({error: 'Formulário inválido.'}, 400);
    const form = await req.formData();
    const company = form.get('company');
    const folder = form.get('folder');
    const file = form.get('file');
    if (!isDriveUnit(company) || !isDriveFolder(folder) || !(file instanceof File)) return json({error: 'Selecione uma empresa, pasta e arquivo válidos.'}, 400);
    if (!file.size || file.size > MAX_UPLOAD_BYTES) return json({error: 'Escolha um arquivo de até 10 MB.'}, 413);
    const saved = await uploadDriveFile(company, folder, file);
    return json(saved, 201);
  } catch (reason) { return error(reason); }
}
