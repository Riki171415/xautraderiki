const {test}=require('node:test');
const assert=require('node:assert/strict');
const {historicalHsh,clarifyHistoricalDataset}=require('./historical_observation');
test('close between opens does not establish HSH reversion',()=>{
 const h=historicalHsh({open:100,close:95},{open:90});
 assert.equal(h.closeBetweenOpens,true);
 assert.equal(h.isRevertedToOpen,null);
 assert.equal(h.sequenceStatus,'UNVERIFIED');
 assert.equal(historicalHsh({open:100,close:100},{open:90}).isRevertedToOpen,null);
});
test('legacy cached success labels are cleared without losing observations',()=>{
 const ds=clarifyHistoricalDataset({candles:[{open:90,close:95},{open:100,close:95,hsh:{isRevertedToOpen:true}}],summary:{jikaUpPercent:60}});
 assert.equal(ds.candles[1].hsh.isRevertedToOpen,null);
 assert.equal(ds.candles[1].hsh.closeBetweenOpens,true);
 assert.equal(ds.summary.jikaUpPercent,60);
 assert.equal(ds.summary.predictionWinRate,null);
});
