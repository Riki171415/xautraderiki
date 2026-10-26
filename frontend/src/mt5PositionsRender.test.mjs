import {test} from 'node:test';
import assert from 'node:assert/strict';
import {createServer} from 'vite';
import React from 'react';
import {renderToString} from 'react-dom/server';
import {fileURLToPath} from 'node:url';
test('position panel preserves actual currency and hides stale or wrong-account rows',async()=>{
 const oldLocation=globalThis.location;
 globalThis.location={protocol:'http:',host:'127.0.0.1:5173',hostname:'127.0.0.1'};
 const server=await createServer({configFile:fileURLToPath(new URL('../vite.config.js',import.meta.url)),root:fileURLToPath(new URL('..',import.meta.url)),cacheDir:fileURLToPath(new URL('../node_modules/.vite-test-positions',import.meta.url)),optimizeDeps:{noDiscovery:true,include:[]},server:{middlewareMode:true,hmr:false},appType:'custom'});
 try{
  const {Mt5PositionsView:View}=await server.ssrLoadModule('/src/components/Mt5PositionsPanel.jsx');
  const now=100000,snapshot={success:true,available:true,updatedAt:now,server:'Exness-Test',sourceSession:'a',currency:'USC',profit:12.3,swap:-.4,positions:[{ticket:'90071992547409999',symbol:'XAUUSDc',side:'BUY',volume:.01,priceOpen:4100.123,priceCurrent:4110.123,sl:null,tp:4200,profit:12.3,swap:-.4,digits:3,openedAt:50000}]};
  const render=extra=>renderToString(React.createElement(View,{snapshot,now,...extra}));
  const html=render({});assert.ok(html.includes('USC'));assert.ok(html.includes('90071992547409999'));assert.ok(html.includes('4100.123'));
  assert.ok(!render({now:now+16000}).includes('90071992547409999'));
  assert.ok(!render({sourceSession:'b'}).includes('90071992547409999'));
  assert.ok(!render({selectedServer:'Exness-Other'}).includes('90071992547409999'));
  assert.ok(render({snapshot:{...snapshot,positions:[]}}).includes('Tidak ada posisi terbuka'));
 }finally{await server.close();globalThis.location=oldLocation;}
});
