import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
import ts from 'typescript';

// Uses only mocked Google API responses, never the customer's Drive.
const source = fs.readFileSync(new URL('../lib/google-drive.ts', import.meta.url), 'utf8');
const compiled = ts.transpileModule(source, {
  fileName: 'google-drive.ts',
  compilerOptions: {target: ts.ScriptTarget.ES2022, module: ts.ModuleKind.CommonJS},
}).outputText;

const env = {
  GOOGLE_DRIVE_CLIENT_ID: 'mock-client',
  GOOGLE_DRIVE_CLIENT_SECRET: 'mock-secret',
  GOOGLE_DRIVE_REFRESH_TOKEN: 'mock-refresh',
  GOOGLE_DRIVE_ROOT_FOLDER_ID: 'root_123456789',
};
const requests = [];
let outOfScope = false;
async function fakeFetch(value, init = {}) {
  const url = String(value);
  requests.push({url, method: init.method || 'GET'});
  if (url.includes('oauth2.googleapis.com/token')) {
    assert.equal(init.method, 'POST');
    return Response.json({access_token: 'mock-token'});
  }
  if (url.includes('/upload/drive/v3/files')) {
    assert.equal(init.method, 'POST');
    assert.match(init.headers['Content-Type'], /^multipart\/related;/);
    return Response.json({id: 'uploaded_123', name: 'imagem.png'});
  }
  if (url.includes('/drive/v3/files/file_123456?alt=media')) return new Response('conteudo');
  if (url.includes('/drive/v3/files/file_123456?')) {
    return Response.json({id: 'file_123456', name: 'imagem.png', mimeType: 'image/png',
      parents: [outOfScope ? 'outside_folder' : 'references_123'], trashed: false});
  }
  if (url.includes('/drive/v3/files?')) {
    const q = new URL(url).searchParams.get('q') || '';
    if (q.includes("'root_123456789' in parents") && q.includes('FIBROPLAST'))
      return Response.json({files: [{id: 'company_123', name: 'FIBROPLAST',
        mimeType: 'application/vnd.google-apps.folder'}]});
    if (q.includes("'company_123' in parents") && q.includes('REFERÊNCIAS'))
      return Response.json({files: [{id: 'references_123', name: 'REFERÊNCIAS',
        mimeType: 'application/vnd.google-apps.folder'}]});
    if (q.includes("'references_123' in parents"))
      return Response.json({files: [{id: 'file_123456', name: 'imagem.png',
        mimeType: 'image/png', parents: ['references_123']}], nextPageToken: null});
    return Response.json({files: []});
  }
  throw new Error('Chamada inesperada: ' + url);
}

const module = {exports: {}};
vm.runInNewContext(compiled, {
  module, exports: module.exports,
  require(name) {if (name === 'cloudflare:workers') return {env}; throw Error(name);},
  fetch: fakeFetch, Response, Request, URL, URLSearchParams, Headers, Blob, File, crypto: globalThis.crypto,
}, {filename: 'google-drive.js'});
const drive = module.exports;
assert.equal(drive.isDriveUnit('FIBROPLAST'), true);
assert.equal(drive.isDriveUnit('../FIBROPLAST'), false);
assert.equal(drive.isDriveFolder('references'), true);
assert.equal(drive.isDriveFolder('unknown'), false);
assert.equal(drive.canBrowseDrive('visualizador', 'farias'), false);
assert.equal(drive.canBrowseDrive('editor', ''), false);
assert.equal(drive.canUploadDrive('editor', 'luiz'), true);
assert.equal(drive.canBrowseDrive('administrador', ''), true);

const listed = await drive.listDriveFiles('FIBROPLAST', 'references');
assert.equal(listed.files.length, 1);
assert.equal(listed.files[0].name, 'imagem.png');
await assert.rejects(
  () => drive.uploadDriveFile('FIBROPLAST', 'references', new File([], 'vazio.png')),
  error => error.status === 413,
);
const saved = await drive.uploadDriveFile('FIBROPLAST', 'references',
  new File(['mock'], 'imagem.png', {type: 'image/png'}));
assert.equal(saved.id, 'uploaded_123');

outOfScope = true;
await assert.rejects(
  () => drive.openDriveFile('FIBROPLAST', 'references', 'file_123456'),
  error => error.status === 403,
);
outOfScope = false;
const response = await drive.openDriveFile('FIBROPLAST', 'references', 'file_123456');
assert.equal(response.status, 200);
assert.equal(await response.text(), 'conteudo');
assert.match(response.headers.get('Content-Disposition'), /^attachment;/);
assert.equal(response.headers.get('Cache-Control'), 'private, no-store');
assert.equal(requests.some(request => request.method === 'POST' && request.url.includes('oauth2.googleapis.com')), true);
console.log('PASS: unidades, autorização, listagem, upload, download e bloqueio de arquivo fora da pasta (simulado).');
