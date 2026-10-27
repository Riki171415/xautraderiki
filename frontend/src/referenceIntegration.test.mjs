import test from 'node:test';
import assert from 'node:assert/strict';
import {createServer} from 'vite';
import {fileURLToPath} from 'node:url';
import React from 'react';
import {renderToString} from 'react-dom/server';
test('shared reference decision controls table, ticket, terminal, signals and Puzzle rendering',async()=>{
 const server=await createServer({configFile:fileURLToPath(new URL('../vite.config.js',import.meta.url)),root:fileURLToPath(new URL('..',import.meta.url)),optimizeDeps:{noDiscovery:true,include:[]},server:{middlewareMode:true,hmr:false},appType:'custom'});
 try{
  const {buildReferenceAnalysis}=await server.ssrLoadModule('virtual:coptah/reference_analysis');
  const {createRequire}=await import('node:module');const backend=createRequire(import.meta.url)('../../backend/reference_analysis.js');
  const input={broker:'EXNESS',symbol:'EURUSD',price:1.08,now:1000,quoteTimestamp:1000};
  assert.deepEqual(buildReferenceAnalysis(input),backend.buildReferenceAnalysis(input));
  const {h4ConfluencePlan,confluenceCell}=await server.ssrLoadModule('/src/h4ConfluencePlan.mjs');
  const {matrixPlan}=await server.ssrLoadModule('/src/matrixPlan.mjs');
  const {terminalAnalysis}=await server.ssrLoadModule('/src/terminalAnalysis.mjs');
  const {strongSignals}=await server.ssrLoadModule('/src/strongSignal.mjs');
  const {default:Panel}=await server.ssrLoadModule('/src/components/ReferencePuzzle.jsx');
  const m=buildReferenceAnalysis(input);
  const plan={source:'REFERENCE',action:'BUY LIMIT',timeframe:'1d',entryPrice:90,stopLoss:80,tp1:100,tp2:110,tp3:120,entryKey:'sup1',areas:[{timeframe:'1d',key:'sup1',value:90,role:'BUY LIMIT',matches:[],microMatches:[]}],attentionAreas:[],comparison:{available:true,groups:[]}};
  const reference={...m,status:'PLAN_VALID',action:'BUY LIMIT',side:'BUY',plan,strong:false};
  const columns=['1d','4h','1h'].map(timeframe=>({timeframe,periodStart:0,periodEnd:2000,referenceAnalysis:reference,openN:100,openB:90,lowN:95,highN:110}));
  assert.deepEqual(h4ConfluencePlan(columns,105,{now:1000}),plan);
  assert.equal(matrixPlan(columns[2],null,{columns,price:105,options:{now:1000}}).entryPrice,90);
  assert.equal(confluenceCell(plan,columns[0],'sup1')[0].role,'BUY LIMIT');
  assert.equal(confluenceCell(plan,columns[1],'sup1').length,0);
  const data={symbol:'EURUSD',broker:{id:'EXNESS'},timestamp:1000,quoteTimestamp:1000,decimals:3,referenceAnalysis:reference};
  const terminal=terminalAnalysis({data,columns,rows:columns,selected:'4h',price:105,now:1000});assert.equal(terminal.plan.timeframe,'1d');assert.equal(terminal.plan.entryPrice,90);
  assert.ok(strongSignals(columns,105,{now:1000}).every(s=>!s.strong));
  const conflicted={...reference,status:'CONFLICT',plan:{...plan,action:'WAIT',areas:[]},conflicts:['Daily dan Weekly berlawanan']};
  assert.equal(h4ConfluencePlan(columns.map(c=>({...c,referenceAnalysis:conflicted})),105).action,'WAIT');
  const html=renderToString(React.createElement(Panel,{data,columns,price:105,now:1000}));for(const text of ['Puzzle COP TAH','RENCANA VALID','Selasa','HSH referensi','Kamus COP TAH'])assert.ok(html.includes(text),text);
  const btc=renderToString(React.createElement(Panel,{data:{symbol:'BTCUSD',broker:{id:'EXNESS'}},columns:[],now:1000}));assert.equal(btc,'');
 }finally{await server.close();}
});
