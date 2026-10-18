import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readdirSync,readFileSync} from 'node:fs';
import {fileURLToPath} from 'node:url';
import {join} from 'node:path';
test('user-facing components do not contain discussion notes or development explanations',()=>{
 const root=fileURLToPath(new URL('./components',import.meta.url));
 const banned=['Definisi pengguna:','Harga 4199 pada contoh Jumat','NORMAL bearish: Asia Low','H4Route membandingkan','ambang implementasi saat ini','proyeksi jangkauan pengguna','dari backend terbaru'];
 for(const file of readdirSync(root).filter(f=>f.endsWith('.jsx'))){const text=readFileSync(join(root,file),'utf8');for(const phrase of banned)assert.ok(!text.includes(phrase),file+': '+phrase);}
 const guide=readFileSync(join(root,'AnalysisGuide.jsx'),'utf8');
 assert.ok(guide.includes('ILUSTRASI EDUKASI · BUKAN PREDIKSI HARGA'));
 assert.ok(guide.includes('Perahu BRK UP/BRK DWN'));
});
