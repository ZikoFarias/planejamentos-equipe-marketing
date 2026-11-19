import {createRemoteJWKSet, jwtVerify} from 'jose';
import {loginAccount} from './profiles';
import {newToken, SESSION_SECONDS, sessionCookie, teamAccounts, tokenHash, validTeamRole, validToken} from './team-auth';

const keys = createRemoteJWKSet(new URL('https://www.googleapis.com/oauth2/v3/certs'), {timeoutDuration: 5000});
const denied = 'Use a conta Google cadastrada para você na equipe.';

export async function handleGoogleTeamLogin(request: Request, env: Cloudflare.Env) {
 const json = (body: unknown, status = 200, headers: Record<string, string> = {}) =>
  Response.json(body, {status, headers: {'Cache-Control': 'no-store', ...headers}});
 if (request.method !== 'POST') return json({error: 'Método inválido.'}, 405, {Allow: 'POST'});
 if (request.headers.get('origin') !== new URL(request.url).origin) return json({error: 'Origem inválida.'}, 403);

 const db = env.DB;
 const clientId = env.GOOGLE_DRIVE_CLIENT_ID;
 if (!db || !clientId) return json({error: 'Login com Google indisponível.'}, 503);
 const secure = new URL(request.url).protocol === 'https:' ? '; Secure' : '';
 if (Number(request.headers.get('content-length') || 0) > 10000) return json({error: 'Solicitação inválida.'}, 400);
 const nonceCookie = (value: string, age: number) => `marketing_google_nonce=${value}; Path=/api/auth/google; HttpOnly; SameSite=Strict; Max-Age=${age}${secure}`;
 try {
  const body = await request.json() as {credential?: string; action?: string; administrator?:boolean};
  const now = Date.now();
  if (body?.action === 'start') {
   const nonce = newToken();
   await db.batch([
    db.prepare('DELETE FROM marketing_login_challenges WHERE expires_at<=?').bind(now),
    db.prepare('INSERT INTO marketing_login_challenges(token_hash,email,expires_at) VALUES(?,?,?)').bind(await tokenHash(nonce), '_google', now + 600000),
   ]);
   return json({clientId, nonce}, 200, {'Set-Cookie': nonceCookie(nonce, 600)});
  }
  const nonce = request.headers.get('cookie')?.match(/(?:^|;\s*)marketing_google_nonce=([a-f0-9]{64})(?:;|$)/)?.[1];
  if (!nonce || !validToken(nonce) || typeof body?.credential !== 'string' || body.credential.length > 8192) return json({error: denied}, 401);
  const verified = await jwtVerify(body.credential, keys, {
   algorithms: ['RS256'], audience: clientId, issuer: ['https://accounts.google.com', 'accounts.google.com'],
   requiredClaims: ['sub', 'iat', 'exp'], maxTokenAge: '10m',
  }).catch(() => null);
  const claims = verified?.payload;
  const email = typeof claims?.email === 'string' ? claims.email.toLowerCase() : '';
  if (!claims || claims.nonce !== nonce || claims.email_verified !== true || (!email.endsWith('@gmail.com') && !claims.hd)) return json({error: denied}, 401);
  const row = await db.prepare('SELECT data FROM marketing_preferences WHERE email=?').bind('_profiles').first<{data: string}>();
  const account = loginAccount(email, row ? JSON.parse(row.data) : {});
  if (!account) return json({error: denied}, 401);
  const member = await db.prepare('SELECT role,persona FROM marketing_members WHERE email=?').bind(account).first<{role: string; persona: string}>();
  if (!member || !validTeamRole(account, member.role) || member.persona !== teamAccounts[account]) return json({error: denied}, 401);

  if(member.role==='administrador'&&body.administrator!==true)return json({error:'Use Acesso do administrador para entrar com esta conta.'},403);
  if(member.role!=='administrador'&&body.administrator===true)return json({error:'Esta conta deve entrar pelo acesso da equipe.'},403);
  const challenge = await db.prepare('DELETE FROM marketing_login_challenges WHERE token_hash=? AND email=? AND expires_at>? RETURNING token_hash').bind(await tokenHash(nonce), '_google', now).first();
  if (!challenge) return json({error: 'Recarregue a página para entrar com Google novamente.'}, 401);
  const token = newToken();
  await db.prepare('INSERT INTO marketing_sessions(token_hash,email,expires_at) VALUES(?,?,?)').bind(await tokenHash(token), account, now + SESSION_SECONDS * 1000).run();
  const response = json({ok: true});
  response.headers.append('Set-Cookie', sessionCookie(token, !!secure));
  response.headers.append('Set-Cookie', nonceCookie('', 0));
  return response;
 } catch(error) {
  if(String(error).includes('daily row read limit'))return json({error:'O limite diário do banco gratuito foi atingido. O acesso volta às 21h (horário de Brasília).'},503);
  return json({error: 'Não foi possível entrar com Google. Tente novamente.'}, 500);
 }
}
