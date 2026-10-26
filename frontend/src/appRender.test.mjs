import {test} from 'node:test';
import assert from 'node:assert/strict';
import {createServer} from 'vite';
import React from 'react';
import {renderToString} from 'react-dom/server';
import {PAGES} from './navigation.mjs';
import {fileURLToPath} from 'node:url';
test('every app page renders when feed is unavailable, including navigation icons',async()=>{
 const oldLocation=globalThis.location;
 globalThis.location={protocol:'http:',host:'127.0.0.1:5173',hostname:'127.0.0.1'};
 const mock={name:'render-regression',enforce:'pre',transform(code,id){
  if(id.includes('/hooks/useAnalysis.js'))return "export function useAnalysis(){return {data:globalThis.renderRegressionData||null,loading:false,error:'Feed unavailable',refetch:async()=>null};} export function resetTouches(){} export function updateModal(){}";
  if(id.includes('/hooks/useWebSocket.js'))return "export function useWebSocket(){return {data:null,liveTick:null,status:'disconnected',sendMessage:()=>{}}}";
  if(id.endsWith('/src/App.jsx'))return code.replace("useState('dashboard')","useState(globalThis.renderRegressionPage || 'dashboard')").replace("useState('global')","useState(globalThis.renderRegressionAnalysis || 'global')").replace("useState('summary')","useState(globalThis.renderRegressionSection || 'summary')").replace("useState(DEFAULT_BROKER==='BINANCE'?'PAXG/USDT':'XAUUSD')","useState(globalThis.renderRegressionSymbol || 'XAUUSD')");
 }};
 const server=await createServer({configFile:fileURLToPath(new URL('../vite.config.js',import.meta.url)),root:fileURLToPath(new URL('..',import.meta.url)),plugins:[mock],cacheDir:fileURLToPath(new URL('../node_modules/.vite-test-appRender',import.meta.url)),optimizeDeps:{noDiscovery:true,include:[]},server:{middlewareMode:true,hmr:false},appType:'custom'});
 try{const {default:App}=await server.ssrLoadModule('/src/App.jsx');for(const page of PAGES){globalThis.renderRegressionPage=page.id;const html=renderToString(React.createElement(App));assert.ok(html.replaceAll('&amp;','&').includes(page.title),page.id);}
 const sampleNow=Date.now(),D=86400000;
 const sampleBase={periodStart:sampleNow-6*D,periodEnd:sampleNow+D,openN:100,openB:90,closeN:95,highN:115,lowN:85,highB:120,lowB:80,pivot:100,sup1:90,sup2:80,sup3:70,sup4:60,res1:110,res2:120,res3:130,res4:140,plan:{action:'BUY LIMIT',stopLoss:80},touchedLevels:{sup1:true,pivot:true}};
 const sampleFrames=['1m','5m','15m','30m','1h','4h','market','1d','1w','1M','3M','6M','1Y'];
 const sampleColumns=sampleFrames.map(timeframe=>({...sampleBase,timeframe,label:timeframe}));
 for(const symbol of ['XAUUSD','BTCUSD','EURUSD','GBPUSD']){
  globalThis.renderRegressionSymbol=symbol;
  globalThis.renderRegressionData={timestamp:sampleNow,symbol,timeframe:'1h',broker:{id:'EXNESS',name:'Exness'},decimals:symbol.endsWith('USD')&&['EURUSD','GBPUSD'].includes(symbol)?5:2,leak4RegMatrix:{currentPrice:95,rsColumns:sampleColumns,tableRows:sampleColumns.map(c=>({...c,direct:'UP',pattern:'NRL UP',move:'DOWN',track:'BUSUR DOWN'}))}};
  for(const page of PAGES){globalThis.renderRegressionPage=page.id;assert.ok(renderToString(React.createElement(App)).includes('COP TAH'),symbol+' '+page.id);}
  globalThis.renderRegressionPage='analysis';for(const tab of ['global','h4','cycle']){globalThis.renderRegressionAnalysis=tab;assert.ok(renderToString(React.createElement(App)).length>0,symbol+' '+tab);}
  globalThis.renderRegressionPage='entries';for(const section of ['summary','analysis','weekly']){globalThis.renderRegressionSection=section;assert.ok(renderToString(React.createElement(App)).length>0,symbol+' '+section);}
 }
 delete globalThis.renderRegressionData;delete globalThis.renderRegressionSymbol;delete globalThis.renderRegressionAnalysis;delete globalThis.renderRegressionSection;
 const {default:Slide}=await server.ssrLoadModule('/src/components/MatrixSlideshow.jsx');
 const {default:ServerControl}=await server.ssrLoadModule('/src/components/ExnessServerControl.jsx');
 const serverHtml=renderToString(React.createElement(ServerControl,{selected:'Exness-ServerB',activeServer:'Exness-ServerA',onSelect:()=>{}}));
 assert.ok(serverHtml.includes('Pilih server Exness'));
 assert.ok(serverHtml.includes('Otomatis mengikuti MT5'));
 assert.ok(serverHtml.includes('Data server lain ditahan'));
 assert.ok(!serverHtml.includes('Exness-MT5Real36'));
 const {default:Tasks}=await server.ssrLoadModule('/src/components/TimeframeTasks.jsx');
 const now=Date.now(),base={periodStart:now-1000,periodEnd:now+86400000,openN:100,openB:90,closeN:95,lowN:85,highN:115,sup1:90,sup2:80,sup3:70,sup4:60,pivot:100,res1:110,res2:120,res3:130,res4:140,plan:{action:'BUY LIMIT',stopLoss:80}};
 const frames=['market','1d','1w','1M','3M','6M','1Y'];
 const taskColumns=[{...base,timeframe:'4h'},...frames.map(timeframe=>({...base,timeframe,label:timeframe}))];
 for(const timeframe of frames){
  const html=renderToString(React.createElement(Tasks,{columns:taskColumns,price:105,now,timeframe,decimals:2,dailyTarget:'sup4',data:{timestamp:now,symbol:'XAUUSD'}}));
  for(const word of ['Busur','Target','HSH','90.00','110.00','searah Busur','TP1 H4','BUY LIMIT · ENTRY','TP2 H4','TP3 H4','SL H4','BERSYARAT · BELUM SINYAL KUAT'])assert.ok(html.includes(word),timeframe+' '+word);
  assert.ok(html.includes('akhir Busur terkonfirmasi'));
  if(timeframe==='1d'){assert.ok(html.includes('Pantauan tambahan Daily'));assert.ok(html.includes('S4 60.00'));assert.ok(html.includes('Dua H4 terakhir'));}
 }

 const staleTask=renderToString(React.createElement(Tasks,{columns:taskColumns,price:105,now,timeframe:'1w',data:{timestamp:now-60000}}));
 assert.ok(staleTask.includes('MENUNGGU KONFIRMASI'));
 assert.ok(!staleTask.includes('BUY LIMIT · ENTRY'));
 const emptyTask=renderToString(React.createElement(Tasks,{columns:[],now,timeframe:'1Y',data:{timestamp:now}}));
 assert.ok(emptyTask.includes('BELUM ADA ENTRY VALID'));
 const keys=['res4','res3','res2','res1','pivot','sup1','sup2','sup3','sup4'];
 const tfs=['1m','5m','15m','30m','1h','4h','market','1d','1w','1M','3M','6M','1Y'];
 const columns=tfs.map((timeframe,i)=>({timeframe,label:'COL_'+i,periodStart:0,periodEnd:Number.MAX_SAFE_INTEGER,plan:{action:'WAIT'},...Object.fromEntries(keys.map((k,j)=>[k,100+i+j]))}));
 const slide=renderToString(React.createElement(Slide,{data:{symbol:'XAUUSD',broker:{name:'Exness'},decimals:3,leak4RegMatrix:{rsColumns:columns,tableRows:[],currentPrice:105}}}));
 const head=slide.match(/<thead>([\s\S]*?)<\/thead>/)[1],body=slide.match(/<tbody>([\s\S]*?)<\/tbody>/)[1];
 assert.equal((head.match(/<th(?:\s|>)/g)||[]).length,14,'all 13 timeframe columns plus level');
 assert.equal((body.match(/<tr(?:\s|>)/g)||[]).length,9,'all nine R4 to S4 rows');
 for(let i=0;i<13;i++)assert.ok(head.includes('COL_'+i),'column '+i);
 assert.ok(slide.includes('SATU LAYAR'));
 assert.ok(slide.includes('Trading Plan'));
 assert.ok(slide.includes('Tugas TF'));
 assert.ok(slide.includes('Panduan Warna'));
 assert.ok(!body.includes('BELUM'),'neutral cells use dots instead of repeated narrative');
 const {default:Panel}=await server.ssrLoadModule('/src/components/MatrixDetailPanel.jsx');
 const panelHtml=renderToString(React.createElement(Panel,{title:'Rincian level',onClose:()=>{}},'All marker details'));
 assert.ok(panelHtml.includes('<dialog'));assert.ok(panelHtml.includes('All marker details'));assert.ok(panelHtml.includes('Tutup panel rincian'));
 const {default:Range}=await server.ssrLoadModule('/src/components/TimeframeRangePopup.jsx');
 const embeddedHtml=renderToString(React.createElement(Range,{embedded:true,column:taskColumns[0],columns:taskColumns,now,onClose:()=>{}}));
 assert.ok(!embeddedHtml.includes('<dialog'),'embedded range does not create a second modal');
 assert.ok(embeddedHtml.includes('RVS LIMIT'));
 assert.ok(!slide.includes('id="matrix-info-panel"'),'bottom panel starts collapsed so matrix keeps its space');
 assert.ok(!slide.includes('h4-strip-items'),'matrix has no duplicated indication cards below table');
 assert.ok(body.includes('S4'),'last support row remains rendered');
 const strengthColumns=sampleColumns.map(c=>c.timeframe==='1M'?{...c,pivot:90}:c);
 const strengthHtml=renderToString(React.createElement(Slide,{data:{symbol:'XAUUSD',broker:{id:'EXNESS',name:'Exness'},timestamp:Date.now(),quoteTimestamp:Date.now(),decimals:3,leak4RegMatrix:{rsColumns:strengthColumns,tableRows:[],currentPrice:110}}}));
 const dailyPivot=strengthHtml.match(/<td[^>]*data-timeframe="1d"[^>]*data-level="pivot"[^>]*>([\s\S]*?)<\/td>/)?.[1];
 assert.ok(dailyPivot?.includes('SUP KUAT'),'strong Daily support badge stays visible even beside Pivot warnings');
 const multiColumns=strengthColumns.map(c=>c.timeframe==='4h'?{...c,pivot:90}:c);
 const multiHtml=renderToString(React.createElement(Slide,{data:{symbol:'XAUUSD',broker:{id:'EXNESS',name:'Exness'},timestamp:Date.now(),quoteTimestamp:Date.now(),decimals:3,leak4RegMatrix:{rsColumns:multiColumns,tableRows:[],currentPrice:110}}}));
 const microPivot=multiHtml.match(/<td[^>]*data-timeframe="1m"[^>]*data-level="pivot"[^>]*>([\s\S]*?)<\/td>/)?.[1];
 assert.ok(microPivot?.includes('SUP KUAT'),'M1 strong support is visible using its H4 reference');
 assert.ok(microPivot?.includes('Pivot H4'),'strong badge explains its actual reference');
 }
 finally{await server.close();globalThis.location=oldLocation;delete globalThis.renderRegressionPage;delete globalThis.renderRegressionData;delete globalThis.renderRegressionSymbol;delete globalThis.renderRegressionAnalysis;delete globalThis.renderRegressionSection;}
});
