import {timeframeTask} from './timeframeTask.mjs';
import {taskHierarchy} from './taskHierarchy.mjs';
import {directionContext} from './directionContext.mjs';
import {rvsLimit} from './rvsLimit.mjs';
import {h4ConfluencePlan} from './h4ConfluencePlan.mjs';
import {h4MicroMatches,levelName} from './h4LevelMatches.mjs';
import {strongSignals} from './strongSignal.mjs';
const frames=[['1Y','Year'],['6M','Semester'],['3M','Quarter'],['1M','Month'],['1w','Week'],['1d','Daily'],['market','Market'],['4h','H4'],['1h','H1'],['30m','M30'],['15m','M15'],['5m','M5'],['1m','M1']];
const name=tf=>frames.find(x=>x[0]===tf)?.[1]||tf;
export function coptahStory(columns=[],price,{now=Date.now(),stale=false,tolerance=0,decimals=3,cycle}={}) {
 const options={now,stale,tolerance,decimals},fmt=v=>v!=null&&Number.isFinite(v)?v.toFixed(decimals):'belum tersedia';
 const plan=h4ConfluencePlan(columns,Number(price),options),micro=h4MicroMatches(columns,Number(price),options),signals=strongSignals(columns,Number(price),{...options,cycle});
 const nodes=frames.map(([tf,label])=>{
 const column=columns.find(c=>c.timeframe===tf),task=timeframeTask(column,options),hierarchy=taskHierarchy(columns,tf,options),context=directionContext(columns,tf,options),rvs=rvsLimit(column,options);
 const available=task.active&&!stale&&['UP','DOWN','NEUTRAL'].includes(task.jika);
 const phase=task.phase==='BOW_DIRECTION'?'Busur':task.phase==='TARGET_DIRECTION'?'Target':'belum berarah';
 const area=task.phase==='BOW_DIRECTION'?task.bow:task.phase==='TARGET_DIRECTION'?task.target:null;
 const references=hierarchy.references.map(r=>`${name(r.timeframe)} ${r.move} ${r.phase==='BOW_DIRECTION'?'searah Busur':r.phase==='TARGET_DIRECTION'?'searah Target':'belum memverifikasi fase'} ${label}`);
 const h4pairs=plan.comparison.groups.flatMap(g=>g.matches.filter(m=>m.timeframe===tf).map(m=>`H4 ${levelName(g.key)} ${fmt(g.value)} ↔ ${label} ${levelName(m.level)} ${fmt(m.value)} (selisih ${fmt(m.delta)})`));
 const microPairs=micro.groups.flatMap(g=>g.matches.filter(m=>m.timeframe===tf).map(m=>({g,m}))).sort((a,b)=>a.m.delta-b.m.delta||a.g.distance-b.g.distance);
 const pair=microPairs[0],ownSignals=signals.filter(s=>s.timeframe===tf&&s.strong);
 let text=available?`${label}: JIKA ${task.jika}, MOVE ${task.move}; sedang searah ${phase}${area?` menuju acuan ${levelName(area.key)} ${fmt(area.value)}`:''}.`:`${label}: ${stale?'harga lama':'data/periode belum lengkap'}; hubungan alur belum terverifikasi.`;
 if(available&&task.bow&&task.target)text+=` Busur ${levelName(task.bow.key)} ${fmt(task.bow.value)}, Target ${levelName(task.target.key)} ${fmt(task.target.value)}; HSH ${fmt(task.open)}.`;
 if(available&&references.length)text+=` Penghubung tugas: ${references.join('; ')}.`;
 if(available&&hierarchy.monthWeek)text+=` Week ${hierarchy.monthWeek.week} kalender broker: waktu ${hierarchy.monthWeek.phase==='BOW_DIRECTION'?'Busur':'Target'}, gerak aktual tetap diperiksa.`;
 if(tf==='market'&&available){const h=timeframeTask(columns.find(c=>c.timeframe==='4h'),options);text+=` Indikasi sesi memakai JIKA H4 ${h.active&&!stale?h.jika:'belum tersedia'}; MOVE H4 adalah perkembangan.`;}
 if(available&&pair)text+=` ${label} ${levelName(pair.m.level)} ${fmt(pair.m.value)} ↔ H4 ${levelName(pair.g.key)} ${fmt(pair.g.value)}: ${pair.m.toward}.`;
 if(available&&['UP','DOWN','BOTH'].includes(rvs.status))text+=` RVS ${rvs.status==='UP'?'High B':rvs.status==='DOWN'?'Low B':'High B dan Low B'} ditembus: indikasi mengerjakan tugas TF lebih besar; tujuan tidak otomatis terbukti.`;
 if(context.flags.length)text+=` Perhatian: ${context.flags.join(', ')}.`;
 if(ownSignals.length)text+=` ${ownSignals.map(s=>`STRONG ${s.side}${s.warnings?.length?' dengan peringatan konflik':''}`).join('; ')}: seluruh syarat model terpenuhi pada TF kecil ini.`;
 return {tf,label,text,available,phase,area,jika:task.jika,move:task.move,bow:task.bow,target:task.target,references,h4pairs,microPairs,context,rvs,range:task.range,signals:ownSignals};
 });
 const ready=signals.filter(s=>s.strong),missing=nodes.filter(n=>!n.available).map(n=>n.label);
 const summary=stale?'Harga lama: cerita hanya menjadi konteks, belum dapat dibaca sebagai kondisi live.':ready.length?`${ready.map(s=>`${name(s.timeframe)} STRONG ${s.side} → H4 → ${name(s.target?.timeframe)}`).join('; ')}. ${ready.some(s=>s.warnings?.length)?'Ada konflik arah; periksa rencana cadangan.':''}`:'Belum ada konfirmasi STRONG BUY/SELL TF kecil; baca tugas TF besar dan area H4 sebagai pantauan.';
 const closing=!stale&&plan.action!=='WAIT'?`${plan.action} H4: entry ${fmt(plan.entryPrice)}, ${plan.areas.filter(a=>a.role.startsWith('TP')).map(a=>`${a.role} ${fmt(a.value)}`).join(', ')}, SL ${fmt(plan.stopLoss)}. Rencana bersyarat; sentuhan belum membuktikan urutan entry → TP.`:`Entry H4 menunggu konfirmasi. ${stale?'Menunggu harga segar.':plan.reason}`;
 return {nodes,summary,closing,missing,ready,plan};
}
