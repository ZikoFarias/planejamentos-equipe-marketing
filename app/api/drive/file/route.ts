import {getActor} from '../../../access';
import {canBrowseDrive, DriveError, isDriveFolder, isDriveUnit, openDriveFile} from '../../../../lib/google-drive';

export const dynamic = 'force-dynamic';
const json = (reason: string, status: number) =>
  Response.json({error: reason}, {status, headers: {'Cache-Control': 'no-store'}});
export async function GET(req: Request) {
  try {
    const actor = await getActor();
    if (!actor) return json('Entre novamente.', 401);
    if (!canBrowseDrive(actor.role, actor.persona)) return json('Acesso não liberado para arquivos.', 403);
    const url = new URL(req.url);
    const company = url.searchParams.get('company');
    const folder = url.searchParams.get('folder');
    const id = url.searchParams.get('id') || '';
    if (!isDriveUnit(company) || !isDriveFolder(folder)) return json('Empresa ou pasta inválida.', 400);
    return await openDriveFile(company, folder, id);
  } catch (reason) {
    return reason instanceof DriveError ? json(reason.message, reason.status) : json('Falha ao baixar arquivo do Google Drive.', 502);
  }
}
