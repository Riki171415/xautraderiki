import {test} from 'node:test';
import assert from 'node:assert/strict';
import {sessionNarrative} from './sessionNarrative.mjs';
const sessions=[{name:'ASIA',coverage:true,status:'completed',high:81975.08,low:81107.74},{name:'EROPA',coverage:true,status:'active',high:82185.78,low:81506.75}];
test('narrative explains actual highs/lows without pasting the method discussion',()=>{
 const r=sessionNarrative({sessions,activeSession:'EROPA',marketType:'MIXED',verification:'PROVISIONAL'},2);
 assert.ok(r.facts[0].includes('Eropa 82185.78 lebih tinggi dari Asia 81975.08'));
 assert.ok(r.facts[1].includes('Eropa 81506.75 lebih tinggi dari Asia 81107.74'));
 assert.ok(r.next.includes('masih berjalan'));assert.ok(!r.summary.includes('NORMAL bearish:'));
});
test('incomplete and same-candle order never claim a confirmed pattern',()=>{
 assert.ok(sessionNarrative({marketType:'INSUFFICIENT'}).title.includes('belum lengkap'));
 const r=sessionNarrative({marketType:'NORMAL',verification:'ORDER_UNVERIFIED'});assert.ok(r.title.includes('belum terbukti'));
 assert.ok(sessionNarrative({marketType:'STRONG',verification:'PROVISIONAL'}).title.startsWith('Indikasi'));
 assert.ok(sessionNarrative({marketType:'STRONG',verification:'OBSERVED'}).title.startsWith('Pola'));
});
test('missing sessions do not invent comparisons and display precision avoids apparent inequality',()=>{
 assert.equal(sessionNarrative({sessions:[{...sessions[0],coverage:false},sessions[1]]}).facts.length,0);
 const r=sessionNarrative({sessions:[{...sessions[0],high:100.001},{...sessions[1],high:100.002}]},2);
 assert.ok(r.facts[0].includes('sama pada presisi tampilan'));
});
