import {mkdir,copyFile,cp} from 'node:fs/promises';
await mkdir('dist',{recursive:true});
for(const f of ["cloud-bridge.js","cloud-sync.js","cloud-sync-core.js","cloud-config.json","supabase.js",'SUPABASE-LICENSE.txt','index.html','app.js','external-search.js','style.css','sw.js','manifest.webmanifest','icon.svg','journey-map.js','journey-map.css','leaflet.js','leaflet.css','positions.json','LEAFLET-LICENSE.txt','icon-180.png','icon-192.png','icon-512.png']) await copyFile(f,`dist/${f}`);
await cp('data','dist/data',{recursive:true});
await copyFile('.nojekyll','dist/.nojekyll');
