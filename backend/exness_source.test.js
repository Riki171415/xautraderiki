const test=require('node:test'),assert=require('node:assert/strict'),net=require('node:net');
const {spawn}=require('node:child_process');
const path=require('node:path');
test('switching MT5 server/account clears every symbol history before accepting the new source',async()=>{
 const probe=net.createServer();await new Promise(resolve=>probe.listen(0,'127.0.0.1',resolve));const port=probe.address().port;await new Promise(resolve=>probe.close(resolve));
 const child=spawn(process.execPath,[path.join(__dirname,'server.js')],{env:{...process.env,COPTAH_PORT:String(port),COPTAH_HOST:'127.0.0.1',COPTAH_DISABLE_MT5:'1'},windowsHide:true,stdio:['ignore','ignore','pipe']});
 let startupError='';child.stderr.on('data',chunk=>{startupError=(startupError+chunk.toString()).slice(-2000);});
 const origin=`http://127.0.0.1:${port}`;
 const call=async(url,body)=>{const res=await fetch(origin+url,body?{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(body)}:{});return {status:res.status,data:await res.json()};};
 try{
  let ready=false;for(let i=0;i<300;i++){try{if((await fetch(origin+'/api/health')).ok){ready=true;break;}}catch{}await new Promise(r=>setTimeout(r,100));}assert.ok(ready,'isolated test server started: '+startupError);
  const now=Date.now(),t=Math.floor(now/3600000)*3600000;
  const history=[[t-3600000,100,105,95,101,10],[t,101,106,96,102,12]];
  const quote=(server,account,symbol,timeframes)=>({server,account,symbol,bid:102,ask:102.1,price:102.05,digits:3,tickTimestamp:now,...(timeframes?{timeframes}:{} )});
  assert.equal((await call('/api/mt5/tick',quote('Exness-TestA',1,'XAUUSDc',{'1h':history}))).status,200);
  const friday=[Date.UTC(2026,9,23),100,120,90,105,10],sunday=[Date.UTC(2026,9,25),105,106,104,105,1],monday=[Date.UTC(2026,9,26),107,115,101,110,10];
  await call('/api/mt5/tick',quote('Exness-TestA',1,'XAUUSDc',{'1d':[friday,sunday,monday]}));
  for(const timeframe of ['1d','1h']){
   const analysis=await call(`/api/analysis?symbol=XAUUSD&broker=EXNESS&timeframe=${timeframe}`);
   assert.equal(analysis.status,200,JSON.stringify(analysis.data));
   const result=analysis.data.data,daily=result.leak4RegMatrix.rsColumns.find(c=>c.timeframe==='1d');
   assert.equal(daily.beforePeriodStart,friday[0]);assert.equal(Number(daily.highB),120);assert.equal(Number(daily.lowB),90);
   assert.equal(daily.beforePolicy,'PREVIOUS_WEEKDAY');
   if(timeframe==='1d'){assert.equal(result.ohlcv_B.timestamp,friday[0]);assert.equal(result.ohlcv_B.open,100);}
  }
  assert.equal((await call('/api/mt5/positions',{server:'Exness-TestA',account:1,currency:'USC',timestamp:Date.now(),available:true,positions:[]})).status,200);
  assert.equal((await call('/api/mt5/positions')).data.available,true);
  assert.equal((await fetch(origin+'/api/mt5/positions',{headers:{Origin:'https://other.example'}})).status,403);
  let state=(await call('/api/mt5/status')).data;assert.equal(state.server,'Exness-TestA');assert.equal(state.timeframes['1h'].bars,2);
  assert.equal((await call('/api/mt5/tick',quote('Exness-TestB',2,'EURUSDc',{'1h':history}))).status,200);
  state=(await call('/api/mt5/status')).data;assert.equal(state.connected,false);assert.deepEqual(state.timeframes,{});
  assert.equal((await call('/api/mt5/positions')).data.available,false,'account change clears positions too');
  state=(await call('/api/mt5/status?symbol=EURUSD')).data;assert.equal(state.server,'Exness-TestB');assert.equal(state.connected,true);
  await call('/api/mt5/tick',quote('Exness-TestB',3,'EURUSDc'));
  state=(await call('/api/mt5/status?symbol=EURUSD')).data;assert.deepEqual(state.timeframes,{},'same-server account change also clears history');
  assert.equal((await call('/api/mt5/tick',quote('',3,'EURUSDc'))).status,400,'source server is mandatory');
 }finally{child.kill();await new Promise(resolve=>{if(child.exitCode!==null)resolve();else child.once('exit',resolve);});}
});
