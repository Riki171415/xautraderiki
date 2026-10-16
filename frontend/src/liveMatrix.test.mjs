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
