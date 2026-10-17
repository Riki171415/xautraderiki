const {test}=require('node:test');const assert=require('node:assert/strict');const {marketHabits}=require('./market_habits');
const H=3600000;const start=Date.UTC(2026,9,15,13),now=start+3.5*H;
const cycle={activeSession:'USA',sessions:[{name:'USA',start,end:start+8*H}]};
const rows=[];for(let d=0;d<2;d++)for(let i=0;i<8;i++)rows.push([start-d*24*H+i*H,100,110,90,105,1]);
test('session compares equal completed durations and excludes future/forming bars',()=>{const r=marketHabits({hourly:rows,cycle,now});assert.equal(r.current.bars,3);assert.equal(r.previous.bars,3);assert.equal(r.elapsedHours,3);assert.equal(r.available,true);});
test('missing history never fabricates weekly or previous-session stats',()=>{const r=marketHabits({hourly:rows.filter(x=>x[0]>=start),cycle,now});assert.equal(r.available,false);assert.equal(r.previous,null);assert.ok(r.weeks.every(w=>!w.previous.coverage));});
test('incomplete current session keeps comparison unavailable',()=>{const r=marketHabits({hourly:rows.filter(x=>x[0]!==start+H),cycle,now});assert.equal(r.available,false);});
