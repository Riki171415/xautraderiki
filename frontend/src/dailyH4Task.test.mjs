import {test} from 'node:test';import assert from 'node:assert/strict';import {dailyH4Task} from './dailyH4Task.mjs';
const H=3600000,context={daily:{timestamp:0,periodEnd:24*H,open:100},rows:[[12*H,100,120,90],[16*H,100,110,95],[20*H,105,115,99]]};
test('only final two broker H4 windows count',()=>{assert.equal(dailyH4Task(context,120,23*H).hit,false);assert.equal(dailyH4Task(context,110,19*H).hit,true);assert.equal(dailyH4Task(context,115,19*H).hit,false);assert.equal(dailyH4Task(context,115,23*H).hit,true);});
test('missing rows or expired daily never invent task completion',()=>{assert.equal(dailyH4Task({...context,rows:[]},110,23*H).hit,false);assert.equal(dailyH4Task(context,110,24*H).available,false);});
