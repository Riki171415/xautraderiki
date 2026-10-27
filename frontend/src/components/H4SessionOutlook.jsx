import {btcWeeklySchedule} from '../btcWeeklySchedule.mjs';
import {quoteIsStale} from '../analysisState.mjs';
import {h4SessionOutlook} from '../h4SessionOutlook.mjs';
export default function H4SessionOutlook({columns=[],now=Date.now(),data}) {
 const stale=quoteIsStale(data,now);
 const weeklyTime=btcWeeklySchedule(columns.find(c=>c.timeframe==='1w'),{symbol:data?.symbol,now});
 const model=h4SessionOutlook(columns,{now,stale,cycle:data?.marketCycle});
 const fmt=n=>n!=null?Number(n).toFixed(data?.decimals??3):'—';
 const arrow=d=>d==='UP'?'↑ UP':d==='DOWN'?'↓ DOWN':'MENUNGGU';
 return <section className={`h4-session-outlook outlook-${model.direction.toLowerCase()}`} aria-label="Indikasi sesi H4 dan fase Weekly"><header><strong>H4 → {model.session} → WEEKLY</strong><b>{stale?'HARGA LAMA':`Indikasi sesi ${arrow(model.direction)}`}</b><span>Weekly {arrow(model.weeklyJika)} · {model.weeklyPhase==='BOW_DIRECTION'?'MEMBENTUK BUSUR':model.weeklyPhase==='TARGET_DIRECTION'?'SEARAH TARGET':'FASE BELUM DITENTUKAN'}</span>{weeklyTime?.available&&<span>Waktu BTC Weekly: {weeklyTime.phase==='BOW_DIRECTION'?'BUSUR':'TARGET'} · 3,5 + 3,5 hari · terpisah dari fase harga</span>}</header><details><summary>Dasar arah & perkembangan</summary><p>JIKA H4: Open N {fmt(model.open)} dibanding Open B {fmt(model.before)}. MOVE H4 {arrow(model.move)} berdasarkan Close {fmt(model.close)} terhadap Open N. {model.development==='ALIGNED'?'Gerak aktual mendukung arah JIKA H4.':model.development==='OPPOSED'?'Gerak aktual berlawanan JIKA H4; indikasi arah belum didukung perkembangannya.':'Perkembangan belum berarah atau data belum aktif.'}</p><p>Weekly: Open N {fmt(model.weeklyOpen)} / Open B {fmt(model.weeklyBefore)}. Searah JIKA Weekly = arah Target; berlawanan = arah Busur. Ini indikasi dari H4 aktif, bukan kepastian arah sesi mendatang, akhir Busur, atau sinyal entry. Evaluasi ulang saat H4 dan sesi berganti.</p></details></section>;
}
