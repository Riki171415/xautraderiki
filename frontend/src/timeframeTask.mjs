import {h4LevelMatches,h4MicroMatches,levelName} from './h4LevelMatches.mjs';
export const TASK_FRAMES=[['4h','H4'],['1h','H1'],['30m','M30'],['15m','M15'],['market','Market'],['1d','Daily'],['1w','Week'],['1M','Month'],['3M','Quarter'],['6M','Semester'],['1Y','Year']];
const numeric=v=>v!=null&&v!==''&&Number.isFinite(Number(v))?Number(v):null;
export function timeframeTask(column,{now=Date.now(),stale=false,additionalTarget='AUTO'}={}) {
 const c=column,open=numeric(c?.openN),before=numeric(c?.openB),close=numeric(c?.closeN),low=numeric(c?.lowN),high=numeric(c?.highN);
 const active=!!c&&(!Number.isFinite(c.periodEnd)||Number.isFinite(c.periodStart)&&c.periodStart<=now&&now<c.periodEnd);
 const jika=open==null||before==null?'UNAVAILABLE':open>before?'UP':open<before?'DOWN':'NEUTRAL';
 const move=open==null||close==null?'UNAVAILABLE':close>open?'UP':close<open?'DOWN':'FLAT';
 const observable=active&&!stale&&low!=null&&high!=null&&low<=high;
 const level=key=>{const value=numeric(c?.[key]);return {key,value,touched:observable&&value!=null?low<=value&&value<=high:null};};
 const directional=['UP','DOWN'].includes(jika),up=jika==='UP';
 const bow=directional?{...level(up?'sup1':'res1'),direction:up?'DOWN':'UP',continuations:[2,3,4].map(i=>level((up?'sup':'res')+i))}:null;
 const target=directional?{...level(up?'res1':'sup1'),direction:jika,continuations:[2,3,4].map(i=>level((up?'res':'sup')+i))}:null;
 const phase=!active||stale||!directional||!['UP','DOWN'].includes(move)?'UNDETERMINED':move===jika?'TARGET_DIRECTION':'BOW_DIRECTION';
 const warnings=[];
 for(const [name,area] of [['Busur',bow],['Target',target]])if(area?.value!=null&&open!=null&&!(area.direction==='UP'?area.value>open:area.value<open))warnings.push(`${name} ${levelName(area.key)} berada di sisi yang tidak sesuai arah terhadap Open N. Nilai asli dipertahankan.`);
 if(c?.anomalies?.length)warnings.push('Urutan R/S anomali; periksa nilai asli sebelum menyimpulkan perjalanan harga.');
 const allowed=['res1','res2','res3','res4','sup1','sup2','sup3','sup4'];
 const additional=allowed.includes(additionalTarget)?level(additionalTarget):null;
 const highB=numeric(c?.highB),lowB=numeric(c?.lowB);
 const rangeN=low!=null&&high!=null&&low<=high?high-low:null;
 const rangeB=lowB!=null&&highB!=null&&lowB<=highB?highB-lowB:null;
 const range={current:rangeN,before:rangeB,expansion:rangeN!=null&&rangeB!=null?rangeN-rangeB:null,ratio:rangeN!=null&&rangeB>0?rangeN/rangeB:null};
 const reference=rangeB>0?rangeB:null;
 const distance=area=>area?.value!=null&&close!=null?Math.abs(area.value-close):null;
 for(const area of [bow,target,additional])if(area){area.distance=distance(area);area.rangeRatio=area.distance!=null&&reference!=null?area.distance/reference:null;area.rangeContext=area.rangeRatio==null?'UNAVAILABLE':area.rangeRatio<=1?'WITHIN_PREVIOUS_RANGE':'BEYOND_PREVIOUS_RANGE';}
 const status=!active?'INACTIVE':stale?'STALE':!directional?'WAIT_DIRECTION':bow?.value==null||target?.value==null?'INCOMPLETE':warnings.length?'ANOMALY':'OBSERVING';
 const model={range,timeframe:c?.timeframe,jika,move,phase,open,before,close,low,high,active,observable,status,bow,target,additional,warnings,bowConfirmed:false,transactionVerified:false,periodStart:c?.periodStart,periodEnd:c?.periodEnd};
 return {...model,sequenceStatus:'UNVERIFIED',progress:taskProgress(model)};
}
export function taskProgress(model) {
 const valid=model.active&&model.observable&&['UP','DOWN'].includes(model.jika)&&model.close!=null&&model.open!=null&&model.bow?.value!=null&&model.target?.value!=null&&!model.warnings.length;
 const areaStatus=area=>!valid||area?.touched==null?'UNVERIFIED':area.touched?'REACHED':'PENDING';
 let zone='UNVERIFIED';
 if(valid){const up=model.jika==='UP',price=model.close,open=model.open,bow=model.bow.value,target=model.target.value;
 zone=price===open?'AT_HSH':(up?price<open:price>open)?(up?price>=bow:price<=bow)?'IN_BOW':'BEYOND_BOW':(up?price<=target:price>=target)?'IN_TARGET':'BEYOND_TARGET';}
 return {zone,bow:areaStatus(model.bow),target:areaStatus(model.target),sequenceStatus:'UNVERIFIED',completionVerified:false};
}
export function taskNarrative(model,label,decimals=3) {
 const fmt=n=>n==null?'belum tersedia':n.toFixed(decimals);
 if(model.jika==='UNAVAILABLE')return `Data Open N/B ${label} belum lengkap; Busur dan Target belum dapat ditentukan.`;
 if(model.jika==='NEUTRAL')return `Open N sama dengan Open B ${label}: JIKA netral. Busur dan Target belum ditentukan; HSH tetap Open N ${fmt(model.open)}.`;
 const direction=d=>d==='UP'?'naik':'turun';
 return `JIKA ${label} ${direction(model.jika)}. Busur mengarah ${direction(model.bow.direction)} dengan acuan ${levelName(model.bow.key)} ${fmt(model.bow.value)}. Target mengarah ${direction(model.target.direction)} dengan acuan ${levelName(model.target.key)} ${fmt(model.target.value)}. Arah saat ini tidak membuktikan urutan Busur → Target; sentuhan kedua level dari OHLC juga belum membuktikan urutannya. ${model.status==='INACTIVE'?'Periode belum aktif.':model.status==='STALE'?'Harga lama; gerak live belum dinilai.':`Gerak ${model.move==='UP'?'naik':model.move==='DOWN'?'turun':model.move==='FLAT'?'datar':'belum tersedia'} berdasarkan Close N ${fmt(model.close)} terhadap Open N ${fmt(model.open)}: ${model.phase==='BOW_DIRECTION'?'searah Busur':model.phase==='TARGET_DIRECTION'?'searah Target':'belum berarah'}.`}`;
}
export function taskH4Bridges(columns,price,timeframe,options={}) {
 const comparison=h4LevelMatches(columns,Number(price),options),micro=h4MicroMatches(columns,Number(price),options);
 return comparison.groups.flatMap(g=>g.matches.filter(m=>m.timeframe===timeframe).map(match=>({...g,match,microMatches:micro.groups.find(x=>x.key===g.key)?.matches||[]})));
}
