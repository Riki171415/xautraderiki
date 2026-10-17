import {test} from 'node:test';
import assert from 'node:assert/strict';
import {createServer} from 'vite';
import React from 'react';
import {renderToString} from 'react-dom/server';
import {readFileSync} from 'node:fs';
import {fileURLToPath} from 'node:url';
test('all restored terminal tabs render full context without hiding navigation or inventing orders',async()=>{
 const server=await createServer({configFile:fileURLToPath(new URL('../vite.config.js',import.meta.url)),root:fileURLToPath(new URL('..',import.meta.url)),server:{middlewareMode:true,hmr:false},appType:'custom'});
 try {
 const {default:Terminal}=await server.ssrLoadModule('/src/components/TimeframeTerminal.jsx');
 const {default:Container}=await server.ssrLoadModule('/src/components/Leak4RegTable.jsx');
 const now=Date.now();
 const h={timeframe:'4h',label:'HOUR_4',periodStart:now-1000,periodEnd:now+100000,openN:101,openB:99,highN:110,highB:120,lowN:90,lowB:80,closeN:105,res4:140,res3:130,res2:120,res1:110,pivot:100,sup1:90,sup2:80,sup3:70,sup4:60,plan:{action:'BUY LIMIT',stopLoss:80},touchedLevels:{pivot:true,sup1:true}};
 const day={...h,timeframe:'1d',label:'DAILY',res1:90.2,pivot:100.1,sup1:70};
 const week={...day,timeframe:'1w',label:'WEEK'};
 const micro={...h,timeframe:'5m',label:'M5'};
 const columns=[h,day,week,micro],rows=columns.map(c=>({...c,direct:'UP',pattern:'NRM UP',move:'UP',track:'TARGET UP'}));
 const data={symbol:'BTCUSD',broker:{id:'EXNESS',name:'Exness'},decimals:3,dataSource:'MT5 BTCUSDc',timestamp:now,leak4RegMatrix:{tableRows:rows,rsColumns:columns,currentPrice:105}};
 const props={data,rows,columns,price:105,decimals:3,tolerance:.5,now,focusedTf:'4h'};
 for(const section of ['summary','analysis','weekly']) {
 const html=renderToString(React.createElement(Terminal,{...props,initialSection:section}));
 for(const label of ['Ringkasan','Analisis &amp; Risiko','Plan Mingguan'])assert.ok(html.includes(label),section+' missing '+label);
 if(section==='summary') {assert.ok(html.includes('Rencana Entry'));assert.ok(html.includes('Penanda Harga'));assert.ok(html.includes('90.000'));assert.ok(html.includes('TERSENTUH'));}
 else {assert.ok(html.includes('90.000'));assert.ok(html.includes('1 · JIKA'));assert.ok(html.includes('Risiko, rasio'));assert.ok(html.includes('belum terverifikasi'));}
 if(section==='weekly')assert.ok(html.includes('Skenario mingguan dua arah'));
 }
 const html=renderToString(React.createElement(Container,{data,tolerance:.5,focusedTf:'4h'}));
 assert.ok(!html.includes('terminal-screen-fit'));assert.ok(!html.includes('↙ Kembali'));
 const microHtml=renderToString(React.createElement(Terminal,{...props,focusedTf:'5m'}));assert.ok(microHtml.includes('PENANDA SAJA'));assert.ok(microHtml.includes('tidak memiliki entry')||microHtml.includes('Tidak memiliki entry'));
 const missing=renderToString(React.createElement(Terminal,{...props,columns:[h],rows:[rows[0]],initialSection:'weekly'}));assert.ok(missing.includes('Riwayat timeframe ini belum lengkap'));
 } finally {await server.close();}
});

test('one terminal render branch and one registered menu; no legacy planner branch',()=>{
 const app=readFileSync(new URL('./App.jsx',import.meta.url),'utf8');
 const navigation=readFileSync(new URL('./navigation.mjs',import.meta.url),'utf8');
 assert.equal((app.match(/<Leak4RegTable\s/g)||[]).length,1);
 assert.equal((navigation.match(/id:'entries'/g)||[]).length,1);
 assert.ok(!navigation.includes("id:'table'"));
 assert.ok(!app.includes('<WeeklyTradingPlan'));
 assert.ok(!app.includes('<MultiTimeframeEntryPlanner'));
 assert.ok(app.includes("['table','terminal','weekly'].includes(id)?'entries':id"));
});
