import {test} from 'node:test';
import assert from 'node:assert/strict';
import {timeframeTask,TASK_FRAMES} from './timeframeTask.mjs';
const base={timeframe:'4h',periodStart:0,periodEnd:1000,openN:100,openB:90,closeN:95,highN:105,lowN:94,pivot:100,sup1:90,sup2:80,sup3:70,sup4:60,res1:110,res2:120,res3:130,res4:140};
test('task selector includes H4 H1 M30 M15 and macro tasks',()=>{for(const tf of ['4h','1h','30m','15m','1d','1w','1Y'])assert.ok(TASK_FRAMES.some(([id])=>id===tf));});
test('UP H4 falling price between Open and S1 remains within bow',()=>{const m=timeframeTask(base,{now:100});assert.equal(m.progress.zone,'IN_BOW');assert.equal(m.progress.bow,'PENDING');assert.equal(m.progress.target,'PENDING');});
test('both touched levels are reached but never verified completion or transaction',()=>{const m=timeframeTask({...base,lowN:85,highN:115},{now:100});assert.equal(m.progress.bow,'REACHED');assert.equal(m.progress.target,'REACHED');assert.equal(m.progress.completionVerified,false);assert.equal(m.transactionVerified,false);});
test('DOWN mirrors bow and target, stale and new period reset evidence',()=>{assert.equal(timeframeTask({...base,openB:110,closeN:105},{now:100}).progress.zone,'IN_BOW');assert.equal(timeframeTask({...base,closeN:85,lowN:85},{now:100}).progress.zone,'BEYOND_BOW');assert.equal(timeframeTask(base,{now:100,stale:true}).progress.bow,'UNVERIFIED');assert.equal(timeframeTask({...base,periodStart:1000,periodEnd:2000,lowN:99,highN:101,closeN:100},{now:1100}).progress.bow,'PENDING');});
