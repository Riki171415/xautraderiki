const {test}=require('node:test');
const assert=require('node:assert/strict');
const {referenceOmDhan,referenceConfirmed,referenceTicket,referenceTuesday,referencePuzzle,referenceHsh,referenceSessions,buildReferenceAnalysis}=require('./reference_analysis');
const H=3600000,D=24*H,start=Date.UTC(2026,9,26),now=start+2*D+12*H;
const row=(t,o=100,h=120,l=80,c=105)=>[t,o,h,l,c,1];
const column={timeframe:'1d',periodStart:start+2*D,periodEnd:start+3*D,openN:100,openB:90,highN:120,lowN:90,closeN:105,sup2:80,sup1:90,pivot:100,res1:110,res2:120};
test('Om Dhan combinations are mirrored and NRL never becomes a big/small boat',()=>{
 for(const [w,d,h,side,tf] of [['BRK DWN','BRK UP',null,'BUY','1d'],['BRK UP','BRK DWN',null,'SELL','1d'],['BRK DWN','ANL UP',null,'SELL','1d'],['BRK UP','ANL DWN',null,'BUY','1d'],['BRK DWN','SDW UP',null,'SELL','1d'],['BRK UP','SDW DWN',null,'BUY','1d'],[null,'BRK UP','BRK DWN','BUY','4h'],[null,'BRK DWN','ANL UP','SELL','4h']]){
  const cs=referenceOmDhan(w,d,h);assert.ok(cs.some(c=>c.side===side&&c.timeframe===tf));
 }
 assert.equal(referenceOmDhan('BRK UP','NRL DWN','NEUTRAL').length,0);
 assert.equal(referenceOmDhan('NEUTRAL','NEUTRAL','NEUTRAL').length,0);
 assert.equal(referenceOmDhan('BRK UP','BRK UP','BRK UP').at(-1).side,'BUY');
 assert.equal(referenceOmDhan('BRK DWN','BRK DWN','BRK DWN').at(-1).side,'SELL');
 assert.ok(referenceOmDhan('BRK UP','BRK DWN','BRK UP').every(c=>c.side==='SELL'));
});
test('confirmations exclude unfinished and future candles, and skip weekend D1 comparisons',()=>{
 const histories={'1d':[row(start-3*D,90),row(start-D,95),row(start,100),row(start+D,105,999,1)]};
 const c=referenceConfirmed(histories,'1d',start+D+H);assert.equal(c.start,start);assert.equal(c.beforeStart,start-3*D);
 histories['1d'].at(-1)[2]=9999;assert.deepEqual(referenceConfirmed(histories,'1d',start+D+H),c);
});
test('reference tickets use source TF levels and reject chase, inversions and missing data',()=>{
 const buy=referenceTicket({side:'BUY',timeframe:'1d',reason:'test'},column,105,.0005);
 assert.equal(buy.action,'BUY LIMIT');assert.deepEqual([buy.entryPrice,buy.stopLoss,buy.tp1,buy.tp2,buy.tp3],[90,80,100,110,120]);
 const sell=referenceTicket({side:'SELL',timeframe:'1d'},column,105,.0005);assert.deepEqual([sell.entryPrice,sell.stopLoss,sell.tp1,sell.tp2,sell.tp3],[110,120,100,90,80]);
 assert.equal(referenceTicket({side:'BUY'},column,89,.0005).valid,false);
 assert.equal(referenceTicket({side:'SELL'},{...column,res2:105},105,.0005).valid,false);
 assert.equal(referenceTicket({side:'BUY'},{...column,pivot:null},105,.0005).valid,false);
});
test('Tuesday is unavailable before close; exact equality is not a break, Wednesday records both without order',()=>{
 const week={periodStart:start,periodEnd:start+7*D,openN:100,openB:90};
 const histories={'1d':[row(start),row(start+D,100,110,90,100),row(start+2*D,100,115,85,105)]};
 assert.equal(referenceTuesday(histories,week,start+D+H,100,.0005).status,'WAIT_TUESDAY');
 const equal=referenceTuesday({'1d':[...histories['1d'].slice(0,2),row(start+2*D,90,90,90,90)]},week,start+2*D,90,.0005);assert.equal(equal.lowerTaken,false);
 const r=referenceTuesday({'1d':[...histories['1d'],row(start+3*D,105,105,105,105)]},week,start+3*D,105,.0005);assert.equal(r.status,'INVALIDATED');assert.equal(r.wednesday.bothTaken,true);assert.equal(r.wednesday.direction,'UP');
 assert.equal(referenceTuesday(histories,{...week,periodStart:start+7*D,periodEnd:start+14*D},start+8*D,100,.0005).status,'WAIT_TUESDAY');
 const live=referenceTuesday({'1d':[row(start),row(start+D,100,110,90,100),row(start+2*D,100,105,95,100)]},week,start+2*D+H,100,.0005,{periodStart:start+2*D,highN:105,lowN:89});
 assert.equal(live.status,'INVALIDATED','observed tick excursion remains in live Daily range after price recovers');
});
test('RPS inversion and child conflicts are symmetric and Market is excluded from ladder',()=>{
 const child={pattern:'SDW UP',jika:'UP',end:now},down={...child,jika:'DOWN'};
 const over=referencePuzzle([{...column,res1:120,res2:110}],{'1h':down,'30m':down},105,1,.0005)[0];assert.equal(over.overbought,true);assert.equal(over.inversionConfirmed,true);
 const under=referencePuzzle([{...column,sup1:80,sup2:90}],{'1h':child,'30m':child},80,1,.0005)[0];assert.equal(under.oversold,true);assert.equal(under.inversionConfirmed,true);assert.equal(under.bow,'LOWER_BOW');
 assert.equal(referencePuzzle([column],{'1h':child,'30m':down},90,1,.0005)[0].conflict,true);
 assert.equal(referencePuzzle([{...column,res1:110,res2:110}],{},100,0,.0005)[0].overbought,false);
 assert.equal(referencePuzzle([{...column,timeframe:'market'}],{},100,0,.0005).length,0);
});
test('HSH requires a proved target before the finished ANL session, may coexist with BRK, and keeps macro Open',()=>{
 const c={...column,periodStart:start,periodEnd:start+7*D,timeframe:'1w',hshEligibility:{eligible:false},openN:100,res1:110};
 const histories={'1h':Array.from({length:11},(_,i)=>row(start+i*H,105,111,104,110))};
 const session={name:'USA',start:start+2*H,end:start+10*H,pattern:'ANL DWN',row:row(start+2*H,112,114,103,106)};
 const r=referenceHsh([c],histories,[session],start+11*H,106,.0005).find(x=>x.timeframe==='1w');assert.equal(r.status,'CONFIRMED');assert.equal(r.open,100);assert.equal(r.side,'SELL');
 assert.equal(referenceHsh([c],histories,[{...session,start:start}],start+11*H,106,.0005)[1].status,'UNCONFIRMED');
 assert.equal(referenceHsh([c],histories,[{...session,end:start+12*H}],start+11*H,106,.0005)[1].status,'UNCONFIRMED');
 assert.equal(referenceHsh([c],histories,[session],start+11*H,100,.0005)[1].status,'UNCONFIRMED');
 const gap={'1h':histories['1h'].filter(r=>r[0]!==start+H)};
 assert.equal(referenceHsh([c],gap,[session],start+11*H,106,.0005)[1].status,'UNCONFIRMED');
 const ambiguous={'1h':[row(start,105,111,99,110),...histories['1h'].slice(1)]};
 assert.equal(referenceHsh([c],ambiguous,[session],start+11*H,106,.0005)[1].status,'UNCONFIRMED');
});
test('scope, stale data and incomplete hierarchy fail closed',()=>{
 assert.equal(buildReferenceAnalysis({broker:'BINANCE',symbol:'XAUUSD'}).enabled,false);
 assert.equal(buildReferenceAnalysis({broker:'EXNESS',symbol:'BTCUSD'}).enabled,false);
 const m=buildReferenceAnalysis({broker:'EXNESS',symbol:'EURUSD',price:100,now,quoteTimestamp:now-20000});assert.equal(m.action,'WAIT');assert.equal(m.status,'WAIT_DATA');
});

function validFixture(){
 const time=start+12*H;
 const col={...column,periodStart:start,periodEnd:start+D,openN:100,openB:110};
 const week={...col,timeframe:'1w',periodStart:start,periodEnd:start+7*D,openN:90,openB:100,highN:115,lowN:70,closeN:105,highB:130,lowB:80,closeB:100,beforePeriodStart:start-7*D};
 const histories={'1d':[row(start-4*D,100,120,80),row(start-3*D,110,130,85),row(start,100,120,90)],'4h':[row(start,105,125,80),row(start+4*H,110,120,85),row(start+8*H,111,119,90,115)],'1h':[row(start+10*H,100,108,95,104),row(start+11*H,102,109,96,106),row(start+12*H,106,106,106,106)],'30m':[row(start+11*H,100,108,95,104),row(start+11.5*H,102,109,96,106),row(start+12*H,106,106,106,106)]};
 return {broker:'EXNESS',symbol:'XAUUSD',columns:[week,col,{...col,timeframe:'4h',periodStart:start+12*H,periodEnd:start+16*H}],histories,price:105,now:time,quoteTimestamp:time};
}
test('valid source-TF ticket, live chase, stale quote, and Wednesday conflict use the same decision',()=>{
 const input=validFixture(),m=buildReferenceAnalysis(input);assert.equal(m.status,'PLAN_VALID',JSON.stringify(m.reasons));assert.equal(m.plan.timeframe,'1d');assert.equal(m.plan.entryPrice,90);
 assert.equal(buildReferenceAnalysis({...input,price:89}).action,'WAIT');
 assert.equal(buildReferenceAnalysis({...input,quoteTimestamp:input.now-20000}).status,'WAIT_DATA');
 const late={...input,now:start+3*D+H,quoteTimestamp:start+3*D+H,columns:input.columns.map(c=>c.timeframe==='1d'?{...c,periodStart:start+3*D,periodEnd:start+4*D}:c.timeframe==='4h'?{...c,periodStart:start+3*D,periodEnd:start+3*D+4*H}:c),histories:{...input.histories,'1d':[...input.histories['1d'],row(start+D,110,130,90,120),row(start+2*D,120,140,95,100),row(start+3*D,100,110,95,105)]}};
 const r=buildReferenceAnalysis(late);assert.equal(r.action,'WAIT');assert.ok(r.conflicts.length>0);
});
test('future finished-candle edits cannot affect an earlier result',()=>{
 const input=validFixture(),before=buildReferenceAnalysis(input);
 const histories=JSON.parse(JSON.stringify(input.histories));histories['1d'].push(row(start+10*D,999,1000,1));histories['1h'].push(row(start+H*30,999,1000,1));
 assert.deepEqual(buildReferenceAnalysis({...input,histories}),before);
});

test('incomplete previous session cannot be silently replaced with an older full session',()=>{
 const histories={'1d':[row(start),row(start+D),row(start+2*D)],'1h':Array.from({length:72},(_,i)=>row(start+i*H,100+i*.1,120,80,105))};
 histories['1h']=histories['1h'].filter(r=>r[0]!==start+D+16*H);
 const sessions=referenceSessions(histories,start+3*D);
 const usa=sessions.find(s=>s.name==='USA'&&s.start===start+2*D+14*H);
 assert.ok(usa.coverage);assert.equal(usa.pattern,undefined);assert.equal(usa.beforeStart,start+D+14*H);
});

test('wall clock cannot promote a cached forming bar without its next source candle',()=>{
 const rows=[row(start,100),row(start+H,105),row(start+2*H,110)];
 const a=referenceConfirmed({'1h':rows},'1h',start+3*H);
 assert.equal(a.start,start+H);
 rows.push(row(start+3*H,111));assert.equal(referenceConfirmed({'1h':rows},'1h',start+3*H).start,start+2*H);
});
test('a Sunday native successor proves Friday closed without becoming the Daily comparison',()=>{
 const histories={'1d':[row(start-5*D,90),row(start-4*D,95),row(start-3*D,100),row(start-D,105)]};
 const c=referenceConfirmed(histories,'1d',start-D+H);assert.equal(c.start,start-3*D);assert.equal(c.beforeStart,start-4*D);
});
