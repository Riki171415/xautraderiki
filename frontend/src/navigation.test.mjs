import {test} from 'node:test';
import assert from 'node:assert/strict';
import {PAGES,resolveNavigation} from './navigation.mjs';
test('exactly six primary menus and three supporting destinations',()=>{
 assert.deepEqual(PAGES.filter(p=>p.group==='utama').map(p=>p.id),['dashboard','analysis','entries','candles','ohlc','levels']);
 assert.deepEqual(PAGES.filter(p=>p.group==='pendukung').map(p=>p.id),['history','guide','sources']);
 assert.equal(new Set(PAGES.map(p=>p.id)).size,PAGES.length);
});
test('legacy destinations select the appropriate consolidated tab',()=>{
 for(const id of ['global','h4','cycle'])assert.deepEqual(resolveNavigation(id),{page:'analysis',analysisTab:id});
 for(const id of ['table','terminal'])assert.deepEqual(resolveNavigation(id),{page:'entries',terminalSection:'summary'});
 assert.deepEqual(resolveNavigation('weekly'),{page:'entries',terminalSection:'weekly'});
 assert.deepEqual(resolveNavigation('entries'),{page:'entries'});
 assert.deepEqual(resolveNavigation('invalid'),{page:'dashboard'});
});
