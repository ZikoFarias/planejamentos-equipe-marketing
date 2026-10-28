const {buildSync}=require('esbuild');const {execFileSync}=require('node:child_process');const path=require('node:path');for(const name of ['areas','workflow','interface','week','units','weekly','bulk','status-config','drive','upload-artwork','approval','purchases']){const file=path.resolve('.sites-runtime/'+name+'-tests.mjs');buildSync({entryPoints:['tests/'+name+'.mjs'],bundle:true,platform:'node',format:'esm',outfile:file});execFileSync(process.execPath,[file],{stdio:'inherit'})}




execFileSync(process.execPath,['tests/approval-api.cjs'],{stdio:'inherit'});

execFileSync(process.execPath,['tests/team-auth.cjs'],{stdio:'inherit'});
