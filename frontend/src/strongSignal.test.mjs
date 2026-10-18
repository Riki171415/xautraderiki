import {after} from 'node:test';
import {createServer} from 'vite';
import {fileURLToPath} from 'node:url';
const server=await createServer({configFile:fileURLToPath(new URL('../vite.config.js',import.meta.url)),root:fileURLToPath(new URL('..',import.meta.url)),cacheDir:fileURLToPath(new URL('../node_modules/.vite-test-strongSignal',import.meta.url)),optimizeDeps:{noDiscovery:true,include:[]},server:{middlewareMode:true,hmr:false},appType:'custom'});
after(()=>server.close());
const {strongSignals}=await server.ssrLoadModule('/src/strongSignal.mjs');
import {test}from'node:test';import assert from'node:assert/strict';import{taskHierarchy}from'./taskHierarchy.mjs';
const base={periodStart:0,periodEnd:1000,openN:92,openB:90,closeN:95,lowN:80,highN:110,lowB:50,highB:150,sup1:90,sup2:80,pivot:100,res1:110,res2:120};
const columns=[{...base,timeframe:'4h',plan:{action:'BUY LIMIT',stopLoss:80}},{...base,timeframe:'market'},{...base,timeframe:'1d'},{...base,timeframe:'1m',openN:90,openB:80,res1:100}];
const opts={now:100,cycle:{marketType:'STRONG',verification:'OBSERVED',bias:'BULLISH'}};
const signal=(cols=columns,o=opts)=>strongSignals(cols,95,o).find(s=>s.side==='BUY'&&s.timeframe==='1m');
test('strong BUY requires every check and reports exact macro destination',()=>{const s=signal();assert.equal(s.strong,true);assert.equal(s.target.h4Value,100);assert.equal(s.target.timeframe,'1d');assert.ok(s.checks.every(c=>c.pass));});
test('each missing requirement suppresses strong signal',()=>{
 assert.equal(signal(columns,{...opts,stale:true}).strong,false);
 assert.equal(signal(columns,{...opts,cycle:{...opts.cycle,verification:'PROVISIONAL'}}).strong,false);
 assert.equal(signal(columns.filter(c=>c.timeframe!=='market')).strong,false);
 assert.equal(signal(columns.map(c=>c.timeframe==='1m'?{...c,openB:100}:c)).strong,false);
 assert.equal(signal(columns.map(c=>['market','4h'].includes(c.timeframe)?{...c,highB:51}:c)).strong,false);
 assert.equal(signal(columns.map(c=>c.timeframe==='4h'?{...c,plan:{action:'WAIT'}}:c)).strong,false);
});
test('hierarchy follows user references including Year Quarter and broker calendar week',()=>{
 const D=86400000,start=Date.UTC(2026,9,1);const month={...base,timeframe:'1M',periodStart:start,periodEnd:start+31*D};const week={...base,timeframe:'1w',periodStart:start+11*D,periodEnd:start+18*D};
 const h=taskHierarchy([month,week],'1M',{now:start+12*D});assert.equal(h.monthWeek.week,3);assert.equal(h.monthWeek.phase,'TARGET_DIRECTION');assert.deepEqual(taskHierarchy([],'1Y').references.map(r=>r.timeframe),['3M']);assert.deepEqual(taskHierarchy([],'1d').references.map(r=>r.timeframe),['4h','market']);
});
