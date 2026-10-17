import {activeSessionAt} from '../liveMatrix.mjs';
export default function SourceHSHBar({data,broker,onBrokerChange,now=Date.now()}) {
 const session=activeSessionAt(now),cycle=data?.marketCycle;
 const active=cycle?.activeSession===session?cycle.sessions?.find(s=>s.name===session):null;
 const reference=cycle?.activeSession===session?cycle.hshReference:null;
 const fmt=v=>Number.isFinite(v)?v.toFixed(data?.decimals??3):'Menunggu riwayat sesi';
 const date=t=>t?new Date(t).toLocaleString('id-ID',{timeZone:'Asia/Jakarta',day:'2-digit',month:'short',hour:'2-digit',minute:'2-digit'}):'';
 return <section className="source-hsh-bar" aria-label="Sumber data dan HSH Market"><label>Sumber <select aria-label="Pilih sumber termasuk Binance" value={broker||data?.broker?.id||'EXNESS'} onChange={e=>onBrokerChange?.(e.target.value)}><option value="EXNESS">Exness MT5</option><option value="BINANCE">Binance Spot</option><option value="TWELVE">Twelve Data</option></select></label><div><small>HSH MARKET · {session}</small><strong>{fmt(active?.coverage?active.open:null)}</strong><span>{active?.coverage?date(active.start)+' WIB':'Sesi aktif belum memiliki candle lengkap'}</span></div><div><small>HSH {reference?.name||'PEMBANDING'} SEBELUMNYA</small><strong>{fmt(reference?.coverage&&reference.status==='completed'?reference.hshOpen:null)}</strong><span>{reference?.coverage?date(reference.start)+' WIB':'Menunggu sesi pembanding lengkap'}</span></div><p>HSH = Open sesi. Entry/TP memakai rencana H4 yang sama; sentuhan level bukan bukti transaksi.</p></section>;
}
