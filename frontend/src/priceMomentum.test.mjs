import {test} from 'node:test';import assert from 'node:assert/strict';
import {sampleMomentum,priceMomentum} from './priceMomentum.mjs';
const rows=(sign=1,rate=.4)=>Array.from({length:61},(_,i)=>({time:100000+i*1000,price:100+sign*(i<=30?i:30+(i-30)*rate)}));
test('same direction slowing in equal windows is weakening, mirrored both ways',()=>{for(const sign of [1,-1]){const r=priceMomentum(rows(sign),{now:160000});assert.equal(r.status,'WEAKENING');assert.equal(r.direction,sign===1?'UP':'DOWN');assert.ok(Math.abs(r.ratio-.4)<1e-8);}});
test('continuation and reversal never share a weakening label',()=>{assert.equal(priceMomentum(rows(1,1),{now:160000}).status,'NO_WEAKENING');assert.equal(priceMomentum(rows(1,-.5),{now:160000}).status,'DIRECTION_CHANGED');});
test('insufficient stale gapped observations cannot establish momentum',()=>{for(const [r,now] of [[rows().slice(20),160000],[rows(),180000],[rows().filter((_,i)=>i<10||i>25),160000]])assert.equal(priceMomentum(r,{now}).status,'UNAVAILABLE');});
test('sampling rejects duplicates and old ticks and starts empty on period change',()=>{const a=sampleMomentum([],100000,10);assert.equal(sampleMomentum(a,100000,11),a);assert.equal(sampleMomentum(a,90000,11),a);assert.equal(sampleMomentum([],101000,11).length,1);});
test('flat and forex precision are respected',()=>{assert.equal(priceMomentum(rows(1,0),{now:160000}).status,'FLAT');const fx=rows().map(p=>({...p,price:1+p.price/100000}));assert.equal(priceMomentum(fx,{now:160000,precision:5}).status,'WEAKENING');});
