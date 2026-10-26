const {test}=require('node:test'),assert=require('node:assert/strict');
const {normalizePositions,positionsView,isLocalPositionRequest}=require('./mt5_positions');
const now=100000,p={ticket:'90071992547409999',symbol:'XAUUSDc',side:'BUY',volume:.01,priceOpen:4100.123,priceCurrent:4110.123,sl:0,tp:4200,profit:10,swap:-.4,openedAt:50000,digits:3};
const payload={available:true,server:'Exness-Test',account:1,currency:'USC',timestamp:now,positions:[p]};
test('real MT5 values preserve cent currency, ticket precision, floating P/L and missing SL',()=>{
 const s=normalizePositions(payload,now);assert.equal(s.positions[0].ticket,p.ticket);assert.equal(s.positions[0].sl,null);assert.equal(s.currency,'USC');
 const v=positionsView({...s,sourceSession:'a',server:payload.server},'a',now);assert.equal(v.profit,10);assert.equal(v.swap,-.4);
});
test('empty account is distinguished from unavailable, stale and switched source',()=>{
 const empty=normalizePositions({...payload,positions:[]},now);assert.ok(positionsView({...empty,sourceSession:'a'},'a',now).available);
 const failed=normalizePositions({...payload,available:false,positions:[]},now);assert.equal(positionsView({...failed,sourceSession:'a'},'a',now).available,false);
 const snapshot={...normalizePositions(payload,now),sourceSession:'a'};
 assert.equal(positionsView(snapshot,'a',now+15001).available,false);assert.deepEqual(positionsView(snapshot,'b',now).positions,[]);
});
test('bad snapshots and duplicate/unsafe tickets are rejected rather than displayed as zero profit',()=>{
 for(const positions of [[{...p,profit:NaN}],[p,p],[{...p,ticket:123}],[{...p,side:'WAIT'}]])assert.throws(()=>normalizePositions({...payload,positions},now));
 assert.throws(()=>normalizePositions({...payload,timestamp:now-15001},now));
});
test('account position endpoint rejects remote origins and rebinding hosts',()=>{
 assert.ok(isLocalPositionRequest('127.0.0.1','127.0.0.1:3001',undefined));
 assert.ok(isLocalPositionRequest('::1','localhost:3001','http://localhost:5173'));
 assert.equal(isLocalPositionRequest('127.0.0.1','localhost:3001','https://evil.example'),false);
 assert.equal(isLocalPositionRequest('127.0.0.1','evil.example:3001',undefined),false);
 assert.equal(isLocalPositionRequest('192.168.1.2','localhost:3001',undefined),false);
});
