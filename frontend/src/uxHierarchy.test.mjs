import {test} from 'node:test';
import assert from 'node:assert/strict';
import {createServer} from 'vite';
import {fileURLToPath} from 'node:url';
import React from 'react';
import {renderToString} from 'react-dom/server';
import {readFileSync} from 'node:fs';

test('unified header exposes one source selector, accessible controls and honest empty price',async()=>{
 const server=await createServer({configFile:fileURLToPath(new URL('../vite.config.js',import.meta.url)),root:fileURLToPath(new URL('..',import.meta.url)),optimizeDeps:{noDiscovery:true,include:[]},server:{middlewareMode:true,hmr:false},appType:'custom'});
 try {
 const {default:Header}=await server.ssrLoadModule('/src/components/Header.jsx');
 const {default:Session}=await server.ssrLoadModule('/src/components/SourceHSHBar.jsx');
 const {default:Notice}=await server.ssrLoadModule('/src/components/NotificationCard.jsx');
 const card=renderToString(React.createElement(Notice,{notice:{type:'warning',title:'Area H4 tersentuh',body:'Pivot 100',next:'Pantau reaksi',details:['H4 Pivot'],symbol:'BTCUSD',source:'Exness'},onClose:()=>{},onOpen:()=>{}}));
 assert.ok(card.includes('Tutup notifikasi'));assert.ok(card.includes('Berikutnya:'));assert.ok(card.includes('Buka rincian'));assert.ok(card.includes('<details'));

 const {default:Decision}=await server.ssrLoadModule('/src/components/DecisionSummary.jsx');
 for(const broker of ['EXNESS','BINANCE']){
 const html=renderToString(React.createElement(Header,{broker,symbol:broker==='EXNESS'?'BTCUSD':'BTC/USDC',timeframe:'4h'})).replace(/<!--.*?-->/g,'');
 assert.equal((html.match(/aria-label="Pilih sumber data"/g)||[]).length,1);
 assert.ok(html.includes('Pilih instrumen'));assert.ok(html.includes('Pilih timeframe utama'));
 assert.ok(html.includes('Harga acuan —'));assert.ok(!html.includes('TICK 1S'));
 }
 const session=renderToString(React.createElement(Session,{}));
 assert.ok(!session.includes('<select'));assert.ok(session.includes('<details'));assert.ok(!session.includes(' open=""'));
 const {default:Markers}=await server.ssrLoadModule('/src/components/H4MarkerDetails.jsx');
 const base={timeframe:'4h',label:'H4',pivot:100,sup1:90,res4:140,sup4:60};
 const wait={action:'WAIT',reason:'Harga belum segar',attentionAreas:[],areas:[]};
 const empty=renderToString(React.createElement(Markers,{plan:wait,columns:[base],timeframe:'4h',level:'pivot'})).replace(/<!--.*?-->/g,'');
 assert.ok(empty.includes('100.000'));assert.ok(empty.includes('140.000'));assert.ok(empty.includes('60.000'));
 assert.ok(empty.includes('Belum ada penanda'));assert.ok(empty.includes('Harga belum segar'));
 const plan={...wait,attentionAreas:[{key:'pivot',value:100,role:'AREA H4',matches:[{timeframe:'1d',level:'sup1'}]}]};
 const matching=renderToString(React.createElement(Markers,{plan,columns:[base,{timeframe:'1d',label:'Daily',sup1:100.1}],timeframe:'1d',level:'sup1'})).replace(/<!--.*?-->/g,'');
 assert.ok(matching.includes('AREA H4'));assert.ok(matching.includes('0.100'));
 const summary=renderToString(React.createElement(Decision,{}));
 assert.ok(summary.includes('WAIT'));assert.ok(summary.includes('Menunggu data sumber'));
 assert.ok(summary.includes('Lihat rencana &amp; syarat'));
 }finally{await server.close();}
});
test('palette key foregrounds meet normal text contrast against panel background',()=>{
 const rgb=hex=>hex.match(/[a-f0-9]{2}/gi).map(h=>{const x=parseInt(h,16)/255;return x<=.04045?x/12.92:((x+.055)/1.055)**2.4;});
 const lum=hex=>rgb(hex).reduce((v,x,i)=>v+x*[.2126,.7152,.0722][i],0);
 for(const text of ['b8c8db','9fb2c9','bfd1e1','f2e0ae'])assert.ok((lum(text)+.05)/(lum('142a3c')+.05)>=4.5,text);
 const source=readFileSync(new URL('./App.jsx',import.meta.url),'utf8');
 assert.ok(!source.includes('feed-health-fresh'));assert.ok(!source.includes('<DataQualityBar'));
});

test('mobile matrix provides readable horizontal scrolling and separates direction from entry labels',()=>{
 const css=readFileSync(new URL('./index.css',import.meta.url),'utf8');
 const slide=readFileSync(new URL('./components/MatrixSlideshow.jsx',import.meta.url),'utf8');
 assert.ok(css.includes('min-width:1748px!important'));
 assert.ok(css.includes('position:sticky; left:0'));
 assert.ok(slide.includes('Geser tabel ↔'));
 assert.ok(!slide.includes('JIKA ↑ BUY'));assert.ok(!slide.includes('JIKA ↓ SELL'));
});
