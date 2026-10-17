import {h4LevelMatches,h4MicroMatches} from './h4LevelMatches.mjs';
export const MICRO_TIMEFRAMES=new Set(['1m','5m','15m','30m','1h']);
export function microH4Guide(column,columns,price,{tolerance=0,decimals=3,now=Date.now()}={}){
 const base={action:'PENANDA H4',observerOnly:true,reason:'TF kecil hanya penanda gerak; entry dan TP mengacu H4.',direction:'WAIT',target:null};
 if(!MICRO_TIMEFRAMES.has(column?.timeframe))return null;
 const h4=columns?.find(c=>c.timeframe==='4h');
 if(!h4||!Number.isFinite(price)||(Number.isFinite(h4.periodEnd)&&!(now>=h4.periodStart&&now<h4.periodEnd)))return {...base,reason:'Menunggu data H4 aktif; tidak membuat sasaran dari TF kecil.'};
 if(Number.isFinite(column.periodEnd)&&!(column.periodStart<=now&&now<column.periodEnd))return {...base,reason:'Periode TF kecil sudah berakhir; menunggu candle baru.'};
 const microClose=Number(column.closeN),microOpen=Number(column.openN);
 const move=microClose>microOpen?'UP':microClose<microOpen?'DOWN':'FLAT';
 if(move==='FLAT')return {...base,reason:'Gerak TF kecil masih di Open N; arah menuju area H4 belum terbaca.'};
 const macro=h4LevelMatches(columns,price,{tolerance,decimals,now}).groups;
 const micro=h4MicroMatches(columns,price,{tolerance,decimals,now}).groups.filter(g=>g.matches.some(m=>m.timeframe===column.timeframe));
 const groups=[...macro,...micro.filter(g=>!macro.some(m=>m.key===g.key))];
 const epsilon=10**(-decimals)/2;
 const candidates=groups.filter(g=>move==='UP'?g.value>price+epsilon:g.value<price-epsilon).sort((a,b)=>Math.abs(a.value-price)-Math.abs(b.value-price));
 const target=candidates[0];
 if(!target)return {...base,direction:move,reason:`Gerak TF kecil ${move}; belum ada area H4 ekuivalen di arah geraknya pada toleransi ini.`};
 return {...base,direction:move,target:target.value,anchorKey:target.key,matches:target.matches,distance:Math.abs(target.value-price),reason:`Gerak ${move} pada TF kecil mengarah ke area H4 ${target.key.toUpperCase()} ${target.value.toFixed(decimals)} yang bertemu ${[...new Set(target.matches.map(m=>m.label))].join(', ')}. Perbandingan dapat berasal dari TF kecil atau besar; kecocokan TF kecil tidak mengaktifkan entry. Ini petunjuk arah teramati, bukan kepastian sasaran atau sinyal order baru.`};
}
