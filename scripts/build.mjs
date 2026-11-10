import {mkdir,copyFile,cp} from 'node:fs/promises';
await mkdir('dist',{recursive:true});
for(const f of ['index.html','app.js','style.css','sw.js','manifest.webmanifest','icon.svg']) await copyFile(f,`dist/${f}`);
await cp('data','dist/data',{recursive:true});
await copyFile('.nojekyll','dist/.nojekyll');
