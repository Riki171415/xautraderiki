import test from 'node:test';
import assert from 'node:assert/strict';
import {activeSessionAt,sessionHoursAt} from './liveMatrix.mjs';
const start=Date.UTC(2026,9,27),H=3600000;
const cycle={clockMode:'BROKER_DAILY',sessions:[['ASIA',0,8,'07:00–15:00 WIB'],['EROPA',8,14,'15:00–21:00 WIB'],['USA',14,22,'21:00–05:00 WIB'],['TRANSISI',22,24,'05:00–07:00 WIB']].map(([name,a,b,hours])=>({name,start:start+a*H,end:start+b*H,hours}))};
test('all UI session labels use broker boundaries, including midnight and expired D1',()=>{
 for(const [offset,name] of [[0,'ASIA'],[7.9,'ASIA'],[8,'EROPA'],[14,'USA'],[20,'USA'],[22,'TRANSISI']])assert.equal(activeSessionAt(start+offset*H,cycle),name);
 assert.equal(sessionHoursAt(start,cycle),'07:00–15:00 WIB');
 assert.equal(activeSessionAt(start+24*H,cycle),'MENUNGGU D1');
 assert.equal(sessionHoursAt(start+24*H,cycle),'Menunggu waktu broker');
});
