import {activeSessionAt} from '../liveMatrix.mjs';
export default function SourceHSHBar({data,broker,onBrokerChange,now=Date.now()}) {
 const session=activeSessionAt(now),cycle=data?.marketCycle;
 const active=cycle?.activeSession===session?cycle.sessions?.find(s=>s.name===session):null;
 const reference=cycle?.activeSession===session?cycle.hshReference:null;
 const fmt=v=>Number.isFinite(v)?v.toFixed(data?.decimals??3):'Menunggu riwayat sesi';
 const date=t=>t?new Date(t).toLocaleString('id-ID',{timeZone:'Asia/Jakarta',day:'2-digit',month:'short',hour:'2-digit',minute:'2-digit'}):'';
 return <details className="source-hsh-bar session-disclosure" aria-label="Acuan sesi Market"><summary>Acuan sesi · {session} · Open & pembanding</summary><div className="session-disclosure-values"><div><small>HSH MARKET · {session}</small><strong>{fmt(active?.coverage?active.open:null)}</strong><span>{active?.coverage?date(active.start)+' WIB':'Sesi aktif belum memiliki candle lengkap'}</span></div><div><small>HSH {reference?.name||'PEMBANDING'} SEBELUMNYA</small><strong>{fmt(reference?.coverage&&reference.status==='completed'?reference.hshOpen:null)}</strong><span>{reference?.coverage?date(reference.start)+' WIB':'Menunggu sesi pembanding lengkap'}</span></div><p>Open sesi adalah acuan rumah HSH; pada Perahu BRK UP/BRK DWN, HSH dinonaktifkan. Entry/TP memakai rencana H4 yang sama; sentuhan level bukan bukti transaksi.</p></div></details>;
}
