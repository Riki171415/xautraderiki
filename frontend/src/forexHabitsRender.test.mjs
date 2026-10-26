import test from 'node:test';
import assert from 'node:assert/strict';
import {createServer} from 'vite';
import {fileURLToPath} from 'node:url';
import React from 'react';
import {renderToString} from 'react-dom/server';
test('forex habits and Market Berbisik stay visible without anomalies; BTC receives no forex rules',async()=>{
 const server=await createServer({configFile:fileURLToPath(new URL('../vite.config.js',import.meta.url)),root:fileURLToPath(new URL('..',import.meta.url)),optimizeDeps:{noDiscovery:true,include:[]},server:{middlewareMode:true,hmr:false},appType:'custom'});
 try{
  const {default:Summary}=await server.ssrLoadModule('/src/components/ForexHabitSummary.jsx');
  const {default:Session}=await server.ssrLoadModule('/src/components/MarketCycleAnalysis.jsx');
  const now=Date.now(),base={periodStart:now-1000,periodEnd:now+100000,openN:100,openB:90,highN:120,lowN:95,res1:110,res2:120,res3:130,res4:140,sup1:80,sup2:70,sup3:60,sup4:50};
  const columns=['1d','market'].map(timeframe=>({...base,timeframe,anomalies:[]}));
  const data={symbol:'XAUUSD',broker:{id:'EXNESS'},timestamp:now,quoteTimestamp:now,marketCycle:{activeSession:'USA'},leak4RegMatrix:{rsColumns:columns,tableRows:columns,currentPrice:105}};
  const html=renderToString(React.createElement(Summary,{data,columns,price:105,now}));
  for(const text of ['Market Berbisik','Syarat belum muncul','Karakter pekan','USA sekarang vs USA sebelumnya','dua H4 terakhir','Urutan ini belum diverifikasi'])assert.ok(html.includes(text),text);
  const sessionHtml=renderToString(React.createElement(Session,{data,now}));
  assert.ok(sessionHtml.includes('Market Berbisik'),'visible on default session tab');
  assert.equal(renderToString(React.createElement(Summary,{data:{...data,symbol:'BTCUSD'},columns,now})), '');
 }finally{await server.close();}
});
