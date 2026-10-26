const number=v=>v!=null&&v!==''&&Number.isFinite(Number(v))?Number(v):null;
export function rvsLimit(column,{now=Date.now(),stale=false}={}) {
 const high=number(column?.highB),low=number(column?.lowB),hn=number(column?.highN),ln=number(column?.lowN);
 const active=!!column&&(!Number.isFinite(column.periodEnd)||column.periodStart<=now&&now<column.periodEnd);
 const valid=high!=null&&low!=null&&high>=low;
 const observed=valid&&active&&!stale&&hn!=null&&ln!=null&&hn>=ln;
 const up=observed?hn>high:null,down=observed?ln<low:null;
 return {high,low,range:valid?high-low:null,up,down,status:!valid?'INCOMPLETE':!observed?'UNVERIFIED':up&&down?'BOTH':up?'UP':down?'DOWN':'WITHIN'};
}
export const STRENGTH_REFERENCES={'1m':'4h','5m':'4h','15m':'4h','30m':'4h','1h':'4h','4h':'1d','market':'1d','1d':'1M','1w':'1M','1M':'3M','3M':'6M','6M':'1Y','1Y':'10Y'};
export const STRENGTH_LABELS={'1m':'M1','5m':'M5','15m':'M15','30m':'M30','1h':'H1','4h':'H4','market':'Market','1d':'Daily','1w':'Week','1M':'Month','3M':'Quarter','6M':'Semester','1Y':'Year','10Y':'Dekade'};
export function timeframeLevelStrength(columns,timeframe,key,options={}) {
 const referenceTf=STRENGTH_REFERENCES[timeframe],timeframeLabel=STRENGTH_LABELS[timeframe]||timeframe,referenceLabel=STRENGTH_LABELS[referenceTf]||'TF pembanding';
 const daily=columns.find(c=>c.timeframe===timeframe),month=[...columns,...(options.referenceColumns||[])].find(c=>c.timeframe===referenceTf);
 const now=options.now??Date.now(),price=number(options.price),value=number(daily?.[key]),pivot=number(month?.pivot);
 const low=number(daily?.lowB),high=number(daily?.highB);
 const epsilon=10**(-(options.decimals??3))/2;
 const active=c=>!!c&&(!Number.isFinite(c.periodEnd)||Number.isFinite(c.periodStart)&&c.periodStart<=now&&now<c.periodEnd);
 const known=['pivot','sup1','sup2','sup3','sup4','res1','res2','res3','res4'].includes(key);
 const complete=known&&value!=null&&pivot!=null&&low!=null&&high!=null&&high>low;
 const valid=complete&&active(daily)&&active(month)&&!options.stale;
 const above=(a,b)=>a-b>epsilon,below=(a,b)=>b-a>epsilon;
 const role=!valid||price==null?'UNVERIFIED':above(value,price)?'RESISTANCE':below(value,price)?'SUPPORT':'AT';
 const supportFamily=key==='pivot'||key?.startsWith('sup'),resistanceFamily=key==='pivot'||key?.startsWith('res');
 const supportChecks=[{label:`Di atas Pivot ${referenceLabel}`,pass:valid?above(value,pivot):null,reference:pivot},{label:`Di atas Low B ${timeframeLabel}`,pass:valid?above(value,low):null,reference:low}];
 const resistanceChecks=[{label:`Di bawah Pivot ${referenceLabel}`,pass:valid?below(value,pivot):null,reference:pivot},{label:`Di bawah High B ${timeframeLabel}`,pass:valid?below(value,high):null,reference:high}];
 const contextSupport=valid&&supportFamily?supportChecks.every(c=>c.pass):null;
 const contextResistance=valid&&resistanceFamily?resistanceChecks.every(c=>c.pass):null;
 const support=role==='SUPPORT'&&contextSupport===true,resistance=role==='RESISTANCE'&&contextResistance===true;
 const checks=role==='SUPPORT'?supportChecks:role==='RESISTANCE'?resistanceChecks:[];
 let status,reason;
 if(!complete){status='INCOMPLETE';reason=`Level ${timeframeLabel}, Pivot ${referenceLabel} atau High/Low Before ${timeframeLabel} belum lengkap/valid.`;}
 else if(!active(daily)||!active(month)){status='INACTIVE';reason=`Periode ${timeframeLabel} atau ${referenceLabel} tidak aktif; tunggu data periode yang sesuai.`;}
 else if(options.stale){status='UNVERIFIED';reason='Kesegaran data belum memenuhi pemeriksaan; kekuatan aktif belum dinilai.';}
 else if(price==null){status='UNVERIFIED';reason='Harga acuan belum tersedia; peran support/resistance belum dinilai.';}
 else if(role==='AT'){status='AT';reason='Harga berada di level ini pada presisi instrumen; belum disebut support atau resistance aktif.';}
 else if(support||resistance){status='STRONG';reason='Posisi terhadap harga dan kedua pembanding COP TAH memenuhi.';}
 else if(role==='SUPPORT'&&!supportFamily||role==='RESISTANCE'&&!resistanceFamily){status='WRONG_SIDE';reason='Posisi level terhadap harga berlawanan dengan keluarga S/R aslinya. Nama level tidak ditukar; belum memenuhi kekuatan aktif.';}
 else {status='WEAK';reason=checks.filter(c=>!c.pass).map(c=>c.label+' belum terpenuhi').join('; ')+'.';}
 return {timeframe,referenceTf,timeframeLabel,referenceLabel,value,pivot,price,low,high,role,contextSupport,contextResistance,support,resistance,status,reason,checks,valid};
}

// Preserve the existing Daily/Month API and historical comparisons.
export function dailyLevelStrength(columns,key,options={}) {return timeframeLevelStrength(columns,'1d',key,options);}
