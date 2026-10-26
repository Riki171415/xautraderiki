import {test} from 'node:test';
import assert from 'node:assert/strict';
import {acceptsExnessSource,matchesFeed,sourceIdentity} from './sourceIdentity.mjs';
import {scopedTick} from './analysisState.mjs';
const a={symbol:'XAUUSD',broker:{id:'EXNESS',server:'Exness-ServerA',sourceSession:'account-a'}};
const tick={symbol:'XAUUSD',broker:'EXNESS',server:'Exness-ServerA',sourceSession:'account-a',bid:100};
test('automatic server follows actual connection and manual selection never relabels another server',()=>{
 assert.ok(acceptsExnessSource(a,''));assert.ok(acceptsExnessSource(a,'Exness-ServerA'));
 assert.equal(acceptsExnessSource(a,'Exness-ServerB'),false);
 assert.equal(acceptsExnessSource(a,'',{server:'Exness-ServerB',sourceSession:'account-b'}),false);
});
test('account change on the same server separates ticks and state identity',()=>{
 const b={...a,broker:{...a.broker,sourceSession:'account-b'}};
 assert.ok(matchesFeed(a,tick));assert.equal(scopedTick(b,tick),null);
 assert.notEqual(sourceIdentity(a),sourceIdentity(b));
 assert.equal(matchesFeed(a,{...tick,server:'Exness-ServerB'}),false);
});
