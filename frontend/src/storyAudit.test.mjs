import {test} from 'node:test';
import assert from 'node:assert/strict';
import {createServer} from 'vite';
import {fileURLToPath} from 'node:url';
import React from 'react';
import {renderToString} from 'react-dom/server';
test('new global story and direction details render from the same current scoped models',async()=>{
 const server=await createServer({configFile:fileURLToPath(new URL('../vite.config.js',import.meta.url)),root:fileURLToPath(new URL('..',import.meta.url)),cacheDir:fileURLToPath(new URL('../node_modules/.vite-test-storyAudit',import.meta.url)),optimizeDeps:{noDiscovery:true,include:[]},server:{middlewareMode:true,hmr:false},appType:'custom'});
 try {
  const {directionContext}=await server.ssrLoadModule('/src/directionContext.mjs');
  const {default:Story}=await server.ssrLoadModule('/src/components/CoptahStory.jsx');
  const {default:Sesi}=await server.ssrLoadModule('/src/components/MarketCycleAnalysis.jsx');
  const now=Date.now(),base={momentumSamples:Array.from({length:13},(_,i)=>({time:now-60000+i*5000,price:80+(i<=6?i*10/6:10+(i-6)*5/6)})),periodStart:now-120000,periodEnd:now+100000,openN:100,openB:90,closeN:95,highN:120,lowN:85,highB:110,lowB:80,pivot:105,sup1:90,sup2:80,sup3:70,sup4:60,res1:110,res2:120,res3:130,res4:140,plan:{action:'BUY LIMIT',stopLoss:80}};
  const frames=['1Y','6M','3M','1M','1w','1d','market','4h','1h','30m','15m','5m','1m'];
  const columns=frames.map(timeframe=>({...base,timeframe,label:timeframe}));
  const context=directionContext(columns,'1d',{now});assert.equal(context.mixed,true);assert.ok(context.flags.includes('NAIK MELEMAH'));assert.ok(context.scenarios.some(s=>s.label.includes('PIVOT WEEK')));
  assert.equal(directionContext(columns,'1d',{now,stale:true}).mixed,false);
  const data={timestamp:now,symbol:'BTCUSD',broker:{id:'EXNESS',name:'Exness'},decimals:2,leak4RegMatrix:{rsColumns:columns,tableRows:columns,currentPrice:95}};
  const html=renderToString(React.createElement(Story,{columns,price:95,data,now,mapView:true}));
  for(const text of ['Tugas TF besar','Daily &amp; Market','H4 · jembatan level','TF kecil · konfirmasi arah','Range &amp; batas RVS','ESTIMASI JANGKAUAN DAILY'])assert.ok(html.includes(text),text);
  const sessionHtml=renderToString(React.createElement(Sesi,{data,now}));
  assert.ok(sessionHtml.includes('Sesi Market &amp; hubungan tugas Daily'));
  assert.ok(!sessionHtml.includes('RENCANA H4 · KONFIRMASI LINTAS TIMEFRAME'),'session default does not render a duplicate ticket');
  assert.ok(!sessionHtml.includes('aria-label="Alur cerita utuh COP TAH"'),'session does not duplicate Global story');
  const {default:Ticket}=await server.ssrLoadModule('/src/components/TaskTradeAdvice.jsx');
  const ticketHtml=renderToString(React.createElement(Ticket,{columns,price:95,data,now,tolerance:0,decimals:2,stale:false,timeframe:'4h',label:'H4'}));
  assert.ok(!ticketHtml.includes('ALUR COP TAH'),'ticket is focused on entry and contains no embedded Global story');
  const {default:Habits}=await server.ssrLoadModule('/src/components/MarketHabitPanel.jsx');
  const habitsHtml=renderToString(React.createElement(Habits,{data,now,contextOnly:true}));
  assert.ok(!habitsHtml.includes('Dua H4 terakhir · penyelesaian'),'habit tab does not duplicate Daily evidence');
  const {default:Tasks}=await server.ssrLoadModule('/src/components/TimeframeTasks.jsx');
  const {default:Outlook}=await server.ssrLoadModule('/src/components/H4SessionOutlook.jsx');
  const {default:Guide}=await server.ssrLoadModule('/src/components/AnalysisGuide.jsx');
  const {default:TerminalDetails}=await server.ssrLoadModule('/src/components/TerminalAnalysisDetails.jsx');
  const D=86400000,start=now-6*D;
  const btcCols=columns.map(c=>c.timeframe==='1w'?{...c,periodStart:start,periodEnd:start+7*D}:c);
  const btcData={...data,leak4RegMatrix:{...data.leak4RegMatrix,rsColumns:btcCols,tableRows:btcCols}};
  const views=[
   React.createElement(Tasks,{columns:btcCols,data:btcData,now,price:95,timeframe:'1w'}),
   React.createElement(Outlook,{columns:btcCols,data:btcData,now}),
   React.createElement(Guide,{data:btcData,now}),
   React.createElement(Story,{columns:btcCols,price:95,data:btcData,now,mapView:true}),
   React.createElement(TerminalDetails,{columns:btcCols,price:95,data:btcData,now,decimals:2,weekly:true,model:{row:btcCols[0],column:btcCols.find(c=>c.timeframe==='1w'),plan:{action:'WAIT'},hsh:{},targets:[],warnings:[],active:false}})
  ];
  for(const [i,element] of views.entries()){const html=renderToString(element).replace(/<!--.*?-->/g,'');assert.ok(html.includes('WAKTU TARGET')||html.includes('Waktu BTC Weekly: TARGET'),`BTC schedule shared view ${i}`);}
  const forexHtml=renderToString(React.createElement(Tasks,{columns:btcCols,data:{...btcData,symbol:'EURUSD'},now,price:95,timeframe:'1w'}));
  assert.ok(!forexHtml.includes('BTC · JADWAL WEEKLY'),'forex does not receive BTC schedule');
 } finally {await server.close();}
});
