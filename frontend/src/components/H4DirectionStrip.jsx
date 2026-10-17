import H4PlanMarkers from './H4PlanMarkers';
import {useLiveMatrix} from '../hooks/useLiveMatrix';
import {h4MicroMatches,levelName} from '../h4LevelMatches.mjs';
const frames=[['1m','M1'],['5m','M5'],['15m','M15'],['30m','M30'],['1h','H1']];
export default function H4DirectionStrip({data,liveTick,tolerance=0,now=Date.now(),expanded=false,onExpanded}) {
 const matrix=useLiveMatrix(data,liveTick,now);
 const tick=liveTick?.symbol===data?.symbol&&liveTick?.broker===data?.broker?.id?liveTick:null;
 const price=Number(tick?.bid??matrix?.currentPrice),decimals=data?.decimals??3;
 const result=h4MicroMatches(matrix?.rsColumns,price,{tolerance,decimals,now});
 const stale=data?.marketDataStatus==='STALE_QUOTE'||!data?.timestamp||now-data.timestamp>45000;
 return <section className="h4-direction-strip" aria-label="Penanda arah TF kecil ke H4"><header><strong>◈ PENANDA H4</strong><span>{data?.symbol||'Menunggu instrumen'} · selisih ≤ {tolerance}</span><small>{stale?'Harga/snapshot belum segar · indikasi ditahan':'Indikasi gerak · bukan sinyal entry'}</small><button className="chart-toggle" aria-expanded={expanded} onClick={()=>onExpanded?.(!expanded)}>{expanded?'Tutup penanda':'Lihat penanda H4'}</button></header>{expanded&&<><div className="h4-strip-items">{frames.map(([tf,label])=>{
 const options=result.groups.flatMap(g=>g.matches.filter(m=>m.timeframe===tf).map(m=>({g,m}))).sort((a,b)=>(a.m.toward==='MENUJU'?0:a.m.toward==='DI AREA'?1:2)-(b.m.toward==='MENUJU'?0:b.m.toward==='DI AREA'?1:2)||a.g.distance-b.g.distance||a.m.delta-b.m.delta);
 const choice=options[0],g=choice?.g,m=choice?.m;
 const state=stale?'DATA LAMA':!result.available?'TUNGGU H4':!m?'BELUM COCOK':m.toward;
 const arrow=m?.direction==='UP'?'↑':m?.direction==='DOWN'?'↓':'·';
 return <div key={tf} className={`h4-strip-item ${!stale&&m?.toward==='MENUJU'?'is-toward':!stale&&m?.toward==='MENJAUH'?'is-away':!stale&&m?.toward==='DI AREA'?'is-at':''}`} title={m?`${label} ${levelName(m.level)} ${m.value.toFixed(decimals)} · selisih ${m.delta.toFixed(decimals)}; ${options.length} pasangan cocok`:'Belum ada pasangan level aktif pada toleransi ini'}><b>{label}</b><strong>{!stale&&m?arrow+' ':''}{state}</strong><span>{g&&!stale?`H4 ${levelName(g.key)} · ${g.value.toFixed(decimals)}`:'—'}</span>{m&&!stale&&<small>{levelName(m.level)} {m.touched?'✓ tersentuh':'belum tersentuh'}</small>}</div>;
 })}</div><H4PlanMarkers columns={matrix?.rsColumns} price={price} tolerance={tolerance} decimals={decimals} now={now} stale={stale}/><small className="h4-strip-note">Hijau: menuju · merah muda: menjauh · emas: di area · abu: belum cocok/berarah. Semua pasangan tersedia di Analisis H4; sentuhan bukan bukti TP transaksi.</small></>}</section>;
}
