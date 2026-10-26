import {test} from 'node:test';
import assert from 'node:assert/strict';
import {normalizeNotice,h4Notice,strongNotice,hshNoticeKey,dailyNoticeKey} from './notificationCopy.mjs';
test('notices provide title, context, next action and correct destination',()=>{
 const event={key:'pivot',type:'AT',value:100};
 const n=normalizeNotice('warning',h4Notice([event],{symbol:'BTCUSD',source:'Exness',price:100,decimals:2}));
 assert.equal(n.page,'h4');assert.ok(n.details[0].includes('menyentuh Pivot 100.00'));
 assert.equal(n.symbol,'BTCUSD');assert.ok(n.next);assert.ok(n.caution.includes('belum membuktikan'));
 const info=normalizeNotice('info','Analisis diperbarui',{symbol:'XAUUSD',broker:'EXNESS'});
 assert.equal(info.title,'Informasi aplikasi');assert.equal(info.symbol,'XAUUSD');
});
test('strong notice identifies small TF and preserves conflict without claiming an order',()=>{
 const n=strongNotice([{side:'SELL',timeframe:'5m',warnings:[{}],target:{h4Key:'res1',h4Value:110,timeframe:'1w',level:'pivot',value:110}}],{decimals:2});
 assert.equal(n.title,'Gerak turun memenuhi syarat kuat');assert.ok(n.next.includes('konflik'));assert.ok(n.caution.includes('bukan order'));
});
test('HSH identity ignores countdown; Daily touch identity ignores session change',()=>{
 const data={broker:{id:'EXNESS'},symbol:'BTCUSD',timeframe:'4h',ohlcv_N:{timestamp:1000},hsh:{hshMessage:'5 min'}};
 assert.equal(hshNoticeKey(data),hshNoticeKey({...data,hsh:{hshMessage:'4 min'}}));
 assert.notEqual(hshNoticeKey(data),hshNoticeKey({...data,ohlcv_N:{timestamp:2000}}));
 const note={id:'daily:1000:target:res1'};
 assert.equal(dailyNoticeKey(note,{tradingDay:'day',activeSession:'ASIA'}),dailyNoticeKey(note,{tradingDay:'day',activeSession:'USA'}));
 assert.notEqual(dailyNoticeKey({id:'habit'},{tradingDay:'day',activeSession:'ASIA'}),dailyNoticeKey({id:'habit'},{tradingDay:'day',activeSession:'USA'}));
});

test('support notices explain reaction or uncertainty without declaring a confirmed reversal',async()=>{
 const {supportNotice}=await import('./notificationCopy.mjs');
 const event={value:100,low:100,high:100,members:[{timeframe:'1h',label:'S1',value:100}]};
 const bounce=supportNotice([{...event,stage:'BOUNCE'}],{price:102});
 assert.equal(bounce.statusLabel,'MEMANTUL NAIK');assert.ok(bounce.caution.includes('belum membuktikan tren berbalik'));
 const touch=supportNotice([{...event,stage:'TOUCH'}],{price:100});
 assert.ok(touch.body.includes('belum terkonfirmasi'));
 const broken=supportNotice([{...event,stage:'BREAK'}],{price:98});assert.equal(broken.statusLabel,'TEMBUS TURUN');
});
test('H4 crossing direction is explicit while touches never imply a reversal',()=>{
 const down=h4Notice([{key:'sup1',type:'CROSSED',direction:'DOWN',value:100}],{price:99});
 assert.equal(down.statusLabel,'TEMBUS TURUN');assert.ok(down.title.includes('menembus turun'));
 const touch=h4Notice([{key:'res1',type:'AT',value:100}],{price:100});assert.ok(touch.body.includes('belum terkonfirmasi'));
});
