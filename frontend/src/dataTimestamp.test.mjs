import {test} from 'node:test';
import assert from 'node:assert/strict';
import {formatDataTime,dataAge} from './dataTimestamp.mjs';
test('timestamps explicitly use WIB with calendar date and year',()=>{
 const text=formatDataTime(Date.UTC(2026,9,19,0,0,0));assert.match(text,/2026/);assert.match(text,/07[.:]00[.:]00/);assert.match(text,/WIB/);
 assert.equal(formatDataTime(null),'Belum tersedia');assert.equal(formatDataTime(0),'Belum tersedia');
});
test('age advances without refreshing the source timestamp',()=>{
 const time=100000;assert.equal(dataAge(time,time+5000),'5 detik lalu');assert.equal(dataAge(time,time+65000),'1 menit 5 detik lalu');assert.equal(dataAge(time,time+3600000),'1 jam 0 menit lalu');assert.equal(dataAge(time,time+86400000),'1 hari lalu');
 assert.equal(dataAge(null,time),'umur belum diketahui');assert.match(dataAge(time,time-1),/di depan/);
});
