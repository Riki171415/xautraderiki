export function nextH4Alerts(previous,scope,groups,price,{distance=1,epsilon=.0005}={}) {
 if(!Number.isFinite(price))return {state:previous,events:[]};
 const same=previous?.scope===scope;
 const state={scope,price,seen:same?{...previous.seen}:{}};
 const events=[];
 for(const g of [...groups].sort((a,b)=>a.distance-b.distance)) {
  const key=`${g.key}|${g.value}|${g.matches.map(m=>`${m.timeframe}:${m.periodStart}:${m.level}:${m.value}`).sort().join(';')}`;
  const last=same?previous.price:NaN;
  const crossed=Number.isFinite(last)&&Math.abs(last-g.value)>epsilon&&(last<g.value&&price>=g.value||last>g.value&&price<=g.value);
  const type=crossed?'CROSSED':Math.abs(price-g.value)<=epsilon?'AT':Math.abs(price-g.value)<=distance?'NEAR':null;
  if(!type)continue;
  const seen=new Set(state.seen[key]||[]);
  if(seen.has(type))continue;
  // Never downgrade an alert after a touch/cross within the same level context.
  if(type==='NEAR'&&(seen.has('AT')||seen.has('CROSSED')))continue;
  seen.add(type);state.seen[key]=[...seen];events.push({...g,type,direction:crossed?(price>last?'UP':'DOWN'):null});
 }
 return {state,events};
}
