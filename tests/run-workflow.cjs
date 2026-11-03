const {buildSync}=require('esbuild');const {execFileSync}=require('node:child_process');const path=require('node:path');for(const name of ['purchase-routing','card-file-drop','purchase-flow','purchase-mirror','card-members-labels','seasonal-dates','task-links','profile-compression','art-flow','board-rebase','upload-async','upload-progress','background-storage','spelling','edit-history','board-sync','areas','workflow','interface','week','units','weekly','bulk','status-config','drive','drive-direct','drive-folders','drive-central','drive-central-storage','upload-artwork','approval','purchases']){const file=path.resolve('.sites-runtime/'+name+'-tests.mjs');buildSync({entryPoints:['tests/'+name+'.mjs'],bundle:true,platform:'node',format:'esm',outfile:file});execFileSync(process.execPath,[file],{stdio:'inherit'})}




execFileSync(process.execPath,['tests/approval-api.cjs'],{stdio:'inherit'});

execFileSync(process.execPath,['tests/team-auth.cjs'],{stdio:'inherit'});




execFileSync(process.execPath,['tests/spelling-api.cjs'],{stdio:'inherit'});

execFileSync(process.execPath,['tests/preferences-api.cjs'],{stdio:'inherit'});
execFileSync(process.execPath,['tests/production-entry.cjs'],{stdio:'inherit'});

execFileSync(process.execPath,['tests/upload-enqueue.cjs'],{stdio:'inherit'});

execFileSync(process.execPath,['tests/profiles-api.cjs'],{stdio:'inherit'});

execFileSync(process.execPath,['tests/password-api.cjs'],{stdio:'inherit'});

execFileSync(process.execPath,['tests/personal-notifications.cjs'],{stdio:'inherit'});

execFileSync(process.execPath,['tests/approved-edit-dialog.cjs'],{stdio:'inherit'});

execFileSync(process.execPath,['tests/spelling-recovery.cjs'],{stdio:'inherit'});

execFileSync(process.execPath,['tests/comments-api.cjs'],{stdio:'inherit'});
execFileSync(process.execPath,['tests/comment-composer.cjs'],{stdio:'inherit'});

execFileSync(process.execPath,['tests/media-navigation.cjs'],{stdio:'inherit'});

execFileSync(process.execPath,['tests/upload-kind-api.cjs'],{stdio:'inherit'});

execFileSync(process.execPath,['tests/calendar-cards.cjs'],{stdio:'inherit'});

execFileSync(process.execPath,['tests/attachment-formats.cjs'],{stdio:'inherit'});
execFileSync(process.execPath,['tests/central-media-formats.cjs'],{stdio:'inherit'});

execFileSync(process.execPath,['tests/background-performance.cjs'],{stdio:'inherit'});

execFileSync(process.execPath,['tests/captions.cjs'],{stdio:'inherit'});

execFileSync(process.execPath,['tests/caption-ui.cjs'],{stdio:'inherit'});
