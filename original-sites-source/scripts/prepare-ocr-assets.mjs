import fs from 'node:fs';
import path from 'node:path';
import {createRequire} from 'node:module';
const require=createRequire(import.meta.url);const root=path.dirname(require.resolve('tesseract.js/package.json'));const dependency=createRequire(path.join(root,'package.json'));const core=path.dirname(dependency.resolve('tesseract.js-core/package.json'));
fs.mkdirSync('public/ocr/core',{recursive:true});fs.mkdirSync('public/ocr/lang',{recursive:true});fs.copyFileSync(path.join(root,'dist/worker.min.js'),'public/ocr/worker.min.js');
for(const file of fs.readdirSync(core))if(/^tesseract-core-(?:(?:relaxedsimd|simd)-)?lstm\.(?:js|wasm|wasm\.js)$/.test(file))fs.copyFileSync(path.join(core,file),path.join('public/ocr/core',file));
for(const lang of ['eng','urd']){const data=path.dirname(require.resolve('@tesseract.js-data/'+lang+'/package.json'));fs.copyFileSync(path.join(data,'4.0.0',lang+'.traineddata.gz'),'public/ocr/lang/'+lang+'.traineddata.gz');fs.copyFileSync(path.join(data,'README.md'),'public/ocr/lang/'+lang+'-README.md');}
fs.copyFileSync(path.join(root,'LICENSE.md'),'public/ocr/LICENSE-tesseract.md');fs.copyFileSync(path.join(core,'LICENSE'),'public/ocr/LICENSE-core');console.log('Same-origin OCR worker, core and English/Urdu language assets prepared.');
