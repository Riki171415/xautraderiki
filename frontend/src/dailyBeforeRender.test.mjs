import test from 'node:test';
import assert from 'node:assert/strict';
import {createServer} from 'vite';
import {fileURLToPath} from 'node:url';
import React from 'react';
import {renderToString} from 'react-dom/server';
test('Daily details expose the actual Friday comparison date and weekday policy',async()=>{
 const server=await createServer({configFile:fileURLToPath(new URL('../vite.config.js',import.meta.url)),root:fileURLToPath(new URL('..',import.meta.url)),optimizeDeps:{noDiscovery:true,include:[]},server:{middlewareMode:true,hmr:false},appType:'custom'});
 try{
  const {default:Details}=await server.ssrLoadModule('/src/components/TimeframeRangePopup.jsx');
  const column={timeframe:'1d',label:'DAILY',periodStart:Date.UTC(2026,9,26),beforePeriodStart:Date.UTC(2026,9,23),beforePolicy:'PREVIOUS_WEEKDAY',highN:4022,lowN:3978,highB:4034.421,lowB:3975.365};
  const html=renderToString(React.createElement(Details,{column,symbol:'XAUUSD',embedded:true,now:Date.UTC(2026,9,26,12)}));
  for(const text of ['Daily Before:','Jumat','23 Okt','4034.421','3975.365','Candle akhir pekan dilewati'])assert.ok(html.includes(text),text);
  const btc=renderToString(React.createElement(Details,{column:{...column,beforePeriodStart:Date.UTC(2026,9,25),beforePolicy:'PREVIOUS_CANDLE'},symbol:'BTCUSD',embedded:true}));
  assert.ok(btc.includes('Minggu'));assert.ok(!btc.includes('Candle akhir pekan dilewati'));
 }finally{await server.close();}
});
