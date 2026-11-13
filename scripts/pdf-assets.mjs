import fs from 'node:fs/promises';
import path from 'node:path';
import {build} from 'esbuild';
export async function preparePdfAssets(directory){await fs.mkdir(directory,{recursive:true});await build({entryPoints:['app/pdf-renderer.ts'],bundle:true,platform:'browser',format:'esm',minify:true,target:'es2022',outfile:path.join(directory,'pdf-renderer.mjs')});await fs.copyFile('node_modules/pdfjs-dist/build/pdf.worker.min.mjs',path.join(directory,'pdf.worker.min.mjs'))}
