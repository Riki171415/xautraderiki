import {useH4Plan} from '../hooks/useH4Plan';
import {dataQuality,quoteIsStale} from '../analysisState.mjs';
import {h4SessionOutlook} from '../h4SessionOutlook.mjs';
export default function DecisionSummary({data,liveTick,now=Date.now(),tolerance=0,onPlan,onAnalysis}) {
 const anchored=useH4Plan(data,liveTick,tolerance,now),plan=anchored.plan;
 const outlook=h4SessionOutlook(anchored.matrix?.rsColumns||[],{now,stale:quoteIsStale(data,now),cycle:data?.marketCycle});
 const quality=dataQuality(data,now),wait=plan.action==='WAIT';
 const direction=outlook.direction==='UP'?'↑ NAIK':outlook.direction==='DOWN'?'↓ TURUN':'Belum terverifikasi';
 const move=outlook.move==='UP'?'naik':outlook.move==='DOWN'?'turun':'belum berarah';
 return <section className="decision-summary" aria-label="Ringkasan arah dan rencana">
  <div><span>Arah acuan · JIKA H4</span><strong>{direction}</strong><small>MOVE H4: {move}</small></div>
  <div><span>Hubungan ke Weekly</span><strong>{outlook.weeklyPhase==='BOW_DIRECTION'?'Di arah Busur':outlook.weeklyPhase==='TARGET_DIRECTION'?'Di arah Target':'Menunggu data'}</strong><small>Arah JIKA H4 dibanding JIKA Weekly; bukan bukti akhir tugas.</small></div>
  <div className="decision-plan"><span>Rencana H4</span><strong>{wait?'WAIT · Menunggu konfirmasi':plan.action+' · BERSYARAT'}</strong><small>{quality.status!=='FRESH'?quality.reason:plan.reason||'Periksa seluruh syarat TF kecil sebelum membaca sinyal kuat.'}</small></div>
  <div className="decision-actions"><button type="button" onClick={onPlan}>Lihat rencana & syarat →</button><button type="button" onClick={onAnalysis}>Alur TF besar → kecil</button></div>
 </section>;
}
