import {test} from 'node:test';
import assert from 'node:assert/strict';
import {projectMatrix} from './liveMatrix.mjs';
const col={timeframe:'5m',periodStart:1000,periodEnd:2000,openN:'100',lowN:'99',highN:'101',res4:'120',res3:'115',res2:'110',res1:'102',pivot:'100',sup1:'98',sup2:'95',sup3:'90',sup4:'85'};
const matrix={rsColumns:[col],tableRows:[{...col,direct:'UP',rangeB:2}]};
test('live Bid updates only the correct period and range touches',()=>{
 const result=projectMatrix(matrix,{bid:103,timestamp:1500});assert.equal(result.rsColumns[0].touchedLevels.res1,true);assert.equal(result.rsColumns[0].touchedLevels.res2,false);assert.equal(result.tableRows[0].rangeN,4);assert.equal(col.highN,'101');
});
test('next-period tick cannot mark prior candle touched',()=>assert.equal(projectMatrix(matrix,{bid:120,timestamp:2000}).rsColumns[0],col));

test('expired USA market removed while waiting for Asia, even without ticks',()=>{
 const old={...col,timeframe:'market',label:'MARKET · USA'};
 const r=projectMatrix({rsColumns:[old],tableRows:[old]},null,3,2000);
 assert.equal(r.rsColumns.length,0);assert.equal(r.tableRows.length,0);
});

test('touches persist after price retreats and a lagging snapshot arrives',()=>{
 const first=projectMatrix(matrix,{bid:103,timestamp:1500});
 const next=projectMatrix(matrix,{bid:100,timestamp:1600},3,1600,first);
 assert.equal(next.rsColumns[0].touchedLevels.res1,true);
 assert.equal(next.tableRows[0].touchedSummary.includes('R1'),true);
 assert.equal(next.rsColumns[0].highN,'103.000');
});
test('touches reset on the next timeframe period',()=>{
 const first=projectMatrix(matrix,{bid:103,timestamp:1500});
 const nextCol={...col,periodStart:2000,periodEnd:3000};
 const next=projectMatrix({rsColumns:[nextCol],tableRows:[{...nextCol,direct:'UP',rangeB:2}]},{bid:100,timestamp:2100},3,2100,first);
 assert.equal(next.rsColumns[0].touchedLevels.res1,false);
});
test('each timeframe receives touches according to its own period and levels',()=>{
 const daily={...col,timeframe:'1d',periodStart:500,periodEnd:10000,res1:'104'};
 const both={rsColumns:[col,daily],tableRows:[{...col,direct:'UP',rangeB:2},{...daily,direct:'UP',rangeB:2}]};
 const result=projectMatrix(both,{bid:103,timestamp:1500},3,1500);
 assert.equal(result.rsColumns[0].touchedLevels.res1,true);
 assert.equal(result.rsColumns[1].touchedLevels.res1,false);
});

test('future and out-of-order ticks cannot overwrite observed close or add false touches',()=>{
 const future=projectMatrix(matrix,{bid:120,timestamp:1900},3,1800);
 assert.equal(future.rsColumns[0],col);
 const first=projectMatrix(matrix,{bid:103,timestamp:1700},3,1800);
 const late=projectMatrix(matrix,{bid:90,timestamp:1600},3,1800,first);
 assert.equal(late.rsColumns[0].closeN,'103.000');
 assert.equal(late.rsColumns[0].lowN,'99.000');
 assert.equal(late.rsColumns[0].lastTickTimestamp,1700);
});
