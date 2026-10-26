import {test} from 'node:test';
import assert from 'node:assert/strict';
import {createServer} from 'vite';
import React from 'react';
import {renderToString} from 'react-dom/server';
import {fileURLToPath} from 'node:url';
test('support panel preserves instrument precision and separates broken, testing and stale states',async()=>{
 const server=await createServer({configFile:fileURLToPath(new URL('../vite.config.js',import.meta.url)),root:fileURLToPath(new URL('..',import.meta.url)),cacheDir:fileURLToPath(new URL('../node_modules/.vite-test-supportWatch',import.meta.url)),optimizeDeps:{noDiscovery:true,include:[]},server:{middlewareMode:true,hmr:false},appType:'custom'});
 try{
  const {default:Panel}=await server.ssrLoadModule('/src/components/SupportWatchPanel.jsx');
  const {SupportWatchContext}=await server.ssrLoadModule('/src/hooks/SupportWatchContext.jsx');
  const area={id:'x',value:1.12345,low:1.12345,high:1.12345,members:[{timeframe:'1h',label:'S1',value:1.12345}]};
  const render=(phase,available=true)=>renderToString(React.createElement(SupportWatchContext.Provider,{value:{available,price:1.1235,distance:.0001,decimals:5,notificationsEnabled:true,state:{levels:{x:{area,phase,fromAbove:false}}}}},React.createElement(Panel)));
  assert.ok(render('BROKEN').includes('DITEMBUS'));assert.ok(render('BROKEN').includes('1.12345'));
  assert.ok(render('TESTING').includes('Arah kedatangan belum diketahui'));
  assert.ok(render('BOUNCE',false).includes('DATA TERTUNDA'));
 }finally{await server.close();}
});
