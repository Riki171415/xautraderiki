import {test} from 'node:test';
import assert from 'node:assert/strict';
import {nextH4Alerts} from './h4Alerts.mjs';
const g={key:'res1',value:100,distance:.5,matches:[{timeframe:'1d',level:'pivot',value:100,periodStart:1}]};
test('approach alerts once, then crossing alerts separately',()=>{const a=nextH4Alerts(null,'A',[g],99.5);assert.equal(a.events[0].type,'NEAR');const b=nextH4Alerts(a.state,'A',[g],99.7);assert.equal(b.events.length,0);const c=nextH4Alerts(b.state,'A',[g],100.1);assert.equal(c.events[0].type,'CROSSED');assert.equal(nextH4Alerts(c.state,'A',[g],99.8).events.length,0);});
test('initial load does not claim historical crossing',()=>{assert.equal(nextH4Alerts(null,'A',[g],102).events.length,0);assert.equal(nextH4Alerts(null,'A',[g],100).events[0].type,'AT');});
test('symbol or new period resets notification context',()=>{const a=nextH4Alerts(null,'A',[g],99.5);assert.equal(nextH4Alerts(a.state,'B',[g],99.5).events.length,1);});
test('invalid quote never emits',()=>{assert.equal(nextH4Alerts(null,'A',[g],NaN).events.length,0);});
