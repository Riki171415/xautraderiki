// Shared, deterministic reference rules. No orders and no data-source access.
const {calcHukumPerahu}=require('./rule_engine');
const {analyzeMarketSessions}=require('./market_cycle');
const {exnessSymbolKey}=require('./exness_symbols');
const REFERENCE_LADDER=['1Y','6M','3M','1M','1w','1d','4h','1h','30m','15m','5m','1m'];
const H=3600000,D=24*H;
const durations={'1m':60000,'5m':300000,'15m':900000,'30m':1800000,'1h':H,'4h':4*H,'1d':D,'1w':7*D};
const number=v=>v!==null&&v!==undefined&&v!==''&&Number.isFinite(Number(v))?Number(v):null;
function referenceEnabled(broker,symbol){return broker==='EXNESS'&&['XAUUSD','EURUSD','GBPUSD'].includes(exnessSymbolKey(symbol));}
function referenceEnd(row,tf){
 if(durations[tf])return row[0]+durations[tf];
 const d=new Date(row[0]),months={'1M':1,'3M':3,'6M':6,'1Y':12}[tf];
 return months?Date.UTC(d.getUTCFullYear(),d.getUTCMonth()+months,1):NaN;
}
function referenceRows(rows=[],tf,now){
 return rows.filter(r=>Array.isArray(r)&&r.length>=5&&r.slice(0,5).every(Number.isFinite)&&r[0]<=now&&r[2]>=Math.max(r[1],r[4])&&r[3]<=Math.min(r[1],r[4])&&r[3]>0).sort((a,b)=>a[0]-b[0]).filter((r,i,a)=>!i||r[0]!==a[i-1][0]).filter(r=>tf!=='1d'||![0,6].includes(new Date(r[0]).getUTCDay()));
}
function referencePattern(a,b){
 if(!a||!b||![...a.slice(1,5),...b.slice(1,5)].every(Number.isFinite))return null;
 const pattern=calcHukumPerahu({open:a[1],high:a[2],low:a[3]},{open:b[1],high:b[2],low:b[3]}).pattern;
 return {pattern,jika:a[1]>b[1]?'UP':a[1]<b[1]?'DOWN':'NEUTRAL',move:a[4]>a[1]?'UP':a[4]<a[1]?'DOWN':'FLAT',start:a[0]};
}
function referenceConfirmed(histories,tf,now){
 const proof=referenceRows(histories?.[tf],tf==='1d'?'4h':tf,now);
 const source=tf==='1d'?proof.filter(r=>![0,6].includes(new Date(r[0]).getUTCDay())):proof;
 // A cached last bar is still N until the source supplies its successor.
 // Wall-clock expiry alone cannot turn a pre-close snapshot into confirmation.
 const rows=source.filter(r=>referenceEnd(r,tf)<=now&&proof.some(next=>next[0]>=referenceEnd(r,tf)));
 const a=rows.at(-1),b=rows.at(-2),end=a?referenceEnd(a,tf):null;
 return a&&b?{...referencePattern(a,b),end,beforeStart:b[0],row:a}:null;
}
function referenceOmDhan(week,day,h4){
 const candidates=[];
 const add=(id,side,timeframe,reason)=>candidates.push({id,side,timeframe,reason,kind:'OM_DHAN'});
 if(week==='BRK DWN'&&day==='BRK UP')add('week-down-day-big-up','BUY','1d','Week Titanic DOWN, Daily Titanic UP');
 if(week==='BRK DWN'&&['ANL UP','SDW UP'].includes(day))add('week-down-day-small-up','SELL','1d','Week Titanic DOWN, Daily anomali/sekoci UP');
 if(week==='BRK UP'&&day==='BRK DWN')add('week-up-day-big-down','SELL','1d','Week Titanic UP, Daily Titanic DOWN');
 if(week==='BRK UP'&&['ANL DWN','SDW DWN'].includes(day))add('week-up-day-small-down','BUY','1d','Week Titanic UP, Daily anomali/sekoci DOWN');
 if(day==='BRK UP'&&['BRK DWN','ANL DWN'].includes(h4))add('day-up-h4-down','BUY','4h','Daily Titanic UP, H4 Titanic/anomali DOWN');
 if(day==='BRK DWN'&&['BRK UP','ANL UP'].includes(h4))add('day-down-h4-up','SELL','4h','Daily Titanic DOWN, H4 Titanic/anomali UP');
 const direction=p=>p?.endsWith(' UP')?'UP':p?.endsWith(' DWN')?'DOWN':null;
 if(direction(week)&&direction(week)===direction(day)&&direction(day)===direction(h4))add('aligned-week-day-h4',direction(week)==='UP'?'BUY':'SELL','4h','Week–Daily–H4 searah'+([week,day,h4].every(p=>p.startsWith('BRK'))?' · tiga Titanic':''));
 return candidates;
}
function referenceSessions(histories,now){
 const daily=referenceRows(histories['1d'],'1d',now),rawHours=referenceRows(histories['1h'],'1h',now);
 const hourly=rawHours.filter((r,i)=>i<rawHours.length-1&&rawHours[i+1][0]>=r[0]+H&&r[0]+H<=now);
 const all=[];
 for(const row of daily.slice(-12)){
  const cycle=analyzeMarketSessions({hourly,daily:{timestamp:row[0],periodEnd:row[0]+D,open:row[1],close:row[4]},clockMode:'BROKER_DAILY',now:Math.min(now,row[0]+D-1),symbol:'XAUUSD'});
  for(const s of cycle.sessions||[])if(['ASIA','EROPA','USA'].includes(s.name)&&s.end<=now){
   const bars=hourly.filter(r=>r[0]>=s.start&&referenceEnd(r,'1h')<=s.end&&referenceEnd(r,'1h')<=now);
   if(bars.length!==(s.end-s.start)/H||bars.some((r,i)=>r[0]!==s.start+i*H)){
    all.push({name:s.name,start:s.start,end:s.end,row:null,coverage:false});continue;
   }
   const a=[s.start,bars[0][1],Math.max(...bars.map(r=>r[2])),Math.min(...bars.map(r=>r[3])),bars.at(-1)[4],0];
   const before=all.filter(x=>x.name===s.name).at(-1);
   all.push({name:s.name,start:s.start,end:s.end,row:a,coverage:true,...(before?.row?referencePattern(a,before.row):{}),beforeStart:before?.start});
  }
 }
 return all;
}
function referenceTuesday(histories,week,now,price,epsilon,currentDaily){
 const start=week?.periodStart,end=week?.periodEnd;
 if(!Number.isFinite(start)||!Number.isFinite(end)||now<start||now>=end)return {status:'WAIT_DATA',reason:'Periode Week broker belum tersedia.'};
 const days=referenceRows(histories['1d'],'1d',now).filter(r=>r[0]>=start&&r[0]<end);
 const tue=days.find((r,i)=>new Date(r[0]).getUTCDay()===2&&r[0]+D<=now&&days[i+1]?.[0]>=r[0]+D);
 if(!tue)return {status:'WAIT_TUESDAY',reason:'Menunggu Daily Selasa selesai dalam Week aktif.'};
 const later=days.filter(r=>r[0]>=tue[0]+D);
 if(currentDaily?.periodStart>=tue[0]+D&&currentDaily.periodStart<=now&&[number(currentDaily.highN),number(currentDaily.lowN)].every(v=>v!=null))later.push([currentDaily.periodStart,0,Number(currentDaily.highN),Number(currentDaily.lowN)]);
 const high=Math.max(price,...later.map(r=>r[2])),low=Math.min(price,...later.map(r=>r[3]));
 const up=high>tue[2]+epsilon,down=low<tue[3]-epsilon,jika=number(week.openN)>number(week.openB)?'UP':number(week.openN)<number(week.openB)?'DOWN':'NEUTRAL';
 const wed=days.find(r=>new Date(r[0]).getUTCDay()===3),closed=!!wed&&wed[0]+D<=now&&days.some(r=>r[0]>=wed[0]+D);
 const afterWednesday=closed&&now>=wed[0]+D&&now<wed[0]+3*D;
 const wedUp=!!wed&&wed[2]>tue[2]+epsilon,wedDown=!!wed&&wed[3]<tue[3]-epsilon;
 return {status:(jika==='UP'&&down||jika==='DOWN'&&up)?'INVALIDATED':'WATCHING',reason:'Batas Selasa memakai wick/harga, bukan Close; urutan dua penembusan belum dibuktikan.',start:tue[0],high:tue[2],low:tue[3],upperTaken:up,lowerTaken:down,weekJika:jika,protectedLevel:jika==='UP'?tue[3]:jika==='DOWN'?tue[2]:null,wednesday:{start:wed?.[0]??null,closed,upperTaken:wedUp,lowerTaken:wedDown,bothTaken:wedUp&&wedDown,direction:afterWednesday&&wedUp||afterWednesday&&wedDown?(wed[4]>wed[1]?'UP':wed[4]<wed[1]?'DOWN':'NEUTRAL'):null,close:closed?wed[4]:null,open:wed?.[1]??null}};
}
function referencePuzzle(columns,confirmed,price,tolerance,epsilon){
 return columns.flatMap(c=>{
  const i=REFERENCE_LADDER.indexOf(c.timeframe);if(i<0)return [];
  const children=REFERENCE_LADDER.slice(i+2,i+4).map(tf=>({timeframe:tf,...confirmed[tf]})).filter(x=>x.pattern&&x.end>=c.periodStart);
  const directions=new Set(children.map(x=>x.jika).filter(x=>['UP','DOWN'].includes(x))),conflict=directions.size>1;
  const r1=number(c.res1),r2=number(c.res2),s1=number(c.sup1),s2=number(c.sup2);
  const jika=number(c.openN)==null||number(c.openB)==null?'UNAVAILABLE':Number(c.openN)>Number(c.openB)?'UP':Number(c.openN)<Number(c.openB)?'DOWN':'NEUTRAL';
  const overbought=r1!=null&&r2!=null&&r1>r2+epsilon,oversold=s1!=null&&s2!=null&&s1<s2-epsilon;
  const area=jika==='UP'?s1:jika==='DOWN'?r1:null;
  return [{timeframe:c.timeframe,overbought,oversold,children,conflict,requiredDirection:overbought&&oversold?'CONFLICT':overbought?'DOWN':oversold?'UP':null,inversionConfirmed:!conflict&&(overbought&&directions.has('DOWN')||oversold&&directions.has('UP')),bow:area!=null&&Math.abs(price-area)<=tolerance+epsilon&&!conflict&&directions.has(jika)?jika==='UP'?'LOWER_BOW':'UPPER_BOW':null}];
 });
}
function referenceHsh(columns,histories,sessions,now,price,epsilon){
 return ['1d','1w'].map(tf=>{
  const c=columns.find(c=>c.timeframe===tf),open=number(c?.openN),before=number(c?.openB);
  const wait=reason=>({timeframe:tf,status:'UNCONFIRMED',reason,open});
  if(!c||open==null||before==null||open===before)return wait('Arah dan periode TF belum cukup.');
  const target=number(c[open>before?'res1':'sup1']);if(target==null)return wait('Target R1/S1 belum tersedia.');
  const sourceHours=referenceRows(histories['1h'],'1h',now);
  const rows=sourceHours.filter((r,i)=>r[0]>=c.periodStart&&r[0]+H<=now&&sourceHours[i+1]?.[0]>=r[0]+H);
  const touch=rows.find(r=>r[3]<=target&&target<=r[2]);
  if(!touch)return wait('Urutan sentuhan Target sebelum sesi konfirmasi belum terbukti.');
  if(touch[3]<=open&&open<=touch[2])return wait('Target dan Open berada pada candle H1 yang sama; urutannya belum terbukti.');
  if(rows.some(r=>r[0]>=touch[0]+H&&r[3]<=open&&open<=r[2]))return wait('Open sudah tersentuh setelah Target; tidak mengulang atau mengejar HSH lama.');
  const direction=price>open+epsilon?'DOWN':price<open-epsilon?'UP':null;
  if(!direction)return wait('Harga sudah di Open acuan; tidak mengejar HSH.');
  const s=sessions.filter(s=>['EROPA','USA'].includes(s.name)&&s.start>=touch[0]+H&&s.start>=c.periodStart&&s.end<=now&&s.pattern===(direction==='UP'?'ANL UP':'ANL DWN')&&(direction==='UP'?s.row[4]>s.row[1]:s.row[4]<s.row[1])).at(-1);
  if(!s)return {...wait('Target teramati; menunggu ANL sesi selesai searah kembali Open.'),touchBy:touch[0]+H,target};
  const sequence=rows.filter(r=>r[0]>=touch[0]&&r[0]<s.end);
  if(sequence.length!==(s.end-touch[0])/H||sequence.some((r,i)=>r[0]!==touch[0]+i*H))return wait('Riwayat antara Target dan konfirmasi sesi terputus; urutan HSH ditahan.');
  return {timeframe:tf,status:'CONFIRMED',direction,side:direction==='UP'?'BUY':'SELL',open,target,touchBy:touch[0]+H,session:{name:s.name,start:s.start,end:s.end,pattern:s.pattern},reason:'Jalur HSH referensi: Target lalu ANL sesi; boleh pada BRK. Open acuan tetap TF asal.'};
 });
}
function referenceTicket(candidate,column,price,epsilon){
 const buy=candidate.side==='BUY',entryKey=buy?'sup1':'res1',stopKey=buy?'sup2':'res2',keys=buy?['pivot','res1','res2']:['pivot','sup1','sup2'];
 const entryPrice=number(column?.[entryKey]),stopLoss=number(column?.[stopKey]),values=keys.map(k=>number(column?.[k]));
 const ordered=[entryPrice,stopLoss,...values].every(v=>v!=null)&&(buy?stopLoss<entryPrice-epsilon&&entryPrice<price-epsilon:stopLoss>entryPrice+epsilon&&entryPrice>price+epsilon)&&values.every((v,i)=>buy?v>(i?values[i-1]:entryPrice)+epsilon:v<(i?values[i-1]:entryPrice)-epsilon);
 const areas=[{key:entryKey,value:entryPrice,role:`${candidate.side} LIMIT`},...keys.map((key,i)=>({key,value:values[i],role:`TP${i+1}`}))].map(a=>({...a,matches:[],microMatches:[],count:1,timeframe:candidate.timeframe}));
 return {valid:ordered,action:ordered?`${candidate.side} LIMIT`:'WAIT',source:'REFERENCE',timeframe:candidate.timeframe,periodStart:column?.periodStart,periodEnd:column?.periodEnd,entryPrice,stopLoss,entryKey,stopKey,tp1:values[0],tp2:values[1],tp3:values[2],areas,attentionAreas:[],comparison:{available:true,groups:[],missing:[]},reason:ordered?candidate.reason:'Urutan level atau sisi limit tidak valid; tidak mengubah ke market order.'};
}
function buildReferenceAnalysis({broker,symbol,columns=[],histories={},now=Date.now(),price,quoteTimestamp,decimals=3,tolerance=0}={}){
 if(!referenceEnabled(broker,symbol))return {version:1,enabled:false,status:'NOT_APPLICABLE',action:'WAIT'};
 price=number(price);const epsilon=10**(-decimals)/2;
 const fresh=price!=null&&price>0&&Number.isFinite(quoteTimestamp)&&quoteTimestamp<=now+5000&&now-quoteTimestamp<=10000;
 const active=columns.filter(c=>!c.unavailable&&Number.isFinite(c.periodStart)&&c.periodStart<=now&&now<c.periodEnd);
 const confirmed=Object.fromEntries(REFERENCE_LADDER.map(tf=>[tf,referenceConfirmed(histories,tf,now)]));
 const week=active.find(c=>c.timeframe==='1w');
 const w=week?referencePattern([week.periodStart,...['openN','highN','lowN','closeN'].map(k=>Number(week[k]))],[week.beforePeriodStart,...['openB','highB','lowB','closeB'].map(k=>Number(week[k]))]):null;
 const sessions=referenceSessions(histories,now),day=active.find(c=>c.timeframe==='1d');
 const currentSessions=sessions.filter(s=>day&&s.start>=day.periodStart&&s.start<day.periodEnd);
 const habitDirections=['ASIA','EROPA','USA'].map(name=>currentSessions.find(s=>s.name===name)?.jika||null);
 const complete=habitDirections.every(x=>['UP','DOWN'].includes(x)),habitMatch=complete&&['DOWN,DOWN,UP','UP,UP,DOWN','DOWN,UP,DOWN','UP,DOWN,UP'].includes(habitDirections.join(','));
 const puzzle=referencePuzzle(active,confirmed,price,Math.max(0,tolerance),epsilon);
 const tuesday=referenceTuesday(histories,week,now,price,epsilon,day),hsh=referenceHsh(active,histories,sessions,now,price,epsilon);
 const candidates=referenceOmDhan(w?.pattern,confirmed['1d']?.pattern,confirmed['4h']?.pattern);
 for(const h of hsh.filter(h=>h.status==='CONFIRMED'))candidates.push({id:`hsh-${h.timeframe}`,kind:'HSH_REFERENCE',side:h.side,timeframe:h.timeframe,reason:h.reason});
 const conflicts=[];
 if(new Set(candidates.map(c=>c.side)).size>1)conflicts.push('Aturan referensi aktif memberi arah BUY dan SELL berlawanan.');
 if(hsh.every(h=>h.status==='CONFIRMED')&&hsh[0].direction!==hsh[1].direction)conflicts.push('HSH Daily dan Weekly bertentangan.');
 for(const candidate of candidates){
  const p=puzzle.find(p=>p.timeframe===candidate.timeframe),direction=candidate.side==='BUY'?'UP':'DOWN';
  candidate.confirmation=confirmed[candidate.timeframe];
  candidate.evidence=(p?.children||[]).filter(x=>x.jika===direction);
  candidate.confirmed=candidate.kind==='HSH_REFERENCE'||candidate.evidence.length>0;
  if(p?.conflict)conflicts.push(`Konfirmasi TF adik ${candidate.timeframe} berlawanan.`);
  if(p?.requiredDirection&&p.requiredDirection!==direction)conflicts.push(`Inversi RPS ${candidate.timeframe} meminta konfirmasi arah lain.`);
  if(p?.requiredDirection&&!p.inversionConfirmed)candidate.confirmed=false;
  if(tuesday.wednesday?.direction&&tuesday.wednesday.direction!=='NEUTRAL'&&tuesday.wednesday.direction!==direction)conflicts.push('Arah Close Rabu bertentangan dengan kandidat entry.');
  if(tuesday.status==='INVALIDATED'&&candidate.side===(tuesday.weekJika==='UP'?'BUY':'SELL'))conflicts.push('Batas Selasa arah Weekly telah dibatalkan.');
  candidate.plan=referenceTicket(candidate,active.find(c=>c.timeframe===candidate.timeframe),price,epsilon);
 }
 // Same direction: prefer a valid, confirmed H4 ticket, then Daily, then Weekly.
 const eligible=candidates.filter(c=>c.confirmed&&c.plan.valid).sort((a,b)=>['4h','1d','1w'].indexOf(a.timeframe)-['4h','1d','1w'].indexOf(b.timeframe));
 const selected=eligible[0]||null;
 const hasData=!!w&&!!week&&!!day&&!!active.find(c=>c.timeframe==='4h')&&!!confirmed['1d']&&!!confirmed['4h'];
 const status=!fresh||!hasData?'WAIT_DATA':conflicts.length?'CONFLICT':!candidates.length?'NO_CANDIDATE':!selected?'WAIT_CONFIRMATION':'PLAN_VALID';
 const areaConfirmed=selected?.evidence.some(e=>e.row&&e.row[3]<=selected.plan.entryPrice+Math.max(0,tolerance)+epsilon&&e.row[2]>=selected.plan.entryPrice-Math.max(0,tolerance)-epsilon&&e.move===(selected.side==='BUY'?'UP':'DOWN'));
 const strong=status==='PLAN_VALID'&&complete&&habitMatch&&!!areaConfirmed;
 const finalStatus=strong?'STRONG':status;
 const reasons=!fresh?['Harga sumber belum segar.']:!hasData?['Riwayat Week, Daily atau H4 belum lengkap.']:conflicts.length?[...new Set(conflicts)]:!candidates.length?['Belum ada kombinasi referensi yang berlaku.']:!selected?['Menunggu konfirmasi TF adik atau urutan level/sisi limit yang valid.']:[selected.reason];
 const plan=selected&&['PLAN_VALID','STRONG'].includes(finalStatus)?{...selected.plan,status:finalStatus,reason:reasons.join(' ')}:{action:'WAIT',status:finalStatus,source:'REFERENCE',areas:[],attentionAreas:[],comparison:{available:false,groups:[],missing:[]},reason:reasons.join(' ')};
 return {version:1,enabled:true,evaluatedAt:now,quoteTimestamp,scope:`${broker}|${symbol}`,status:finalStatus,action:plan.action,side:selected?.side??null,plan,candidates,conflicts:[...new Set(conflicts)],reasons,patterns:{week:w?{...w,provisional:true}:null,daily:confirmed['1d'],h4:confirmed['4h']},confirmed,puzzle,tuesday,hsh,hshAligned:hsh.every(h=>h.status==='CONFIRMED')&&hsh[0].direction===hsh[1].direction,habit:{status:complete?habitMatch?'MATCH':'NO_MATCH':'FORMING',directions:habitDirections,sessions:currentSessions},strong,weekProvisional:true,transactionVerified:false};
}
module.exports={REFERENCE_LADDER,referenceEnabled,referenceEnd,referenceRows,referencePattern,referenceConfirmed,referenceOmDhan,referenceSessions,referenceTuesday,referencePuzzle,referenceHsh,referenceTicket,buildReferenceAnalysis};
