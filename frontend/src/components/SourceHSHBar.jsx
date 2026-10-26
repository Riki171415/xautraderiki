import {activeSessionAt} from '../liveMatrix.mjs';
export default function SourceHSHBar({data,broker,onBrokerChange,now=Date.now()}) {
 const session=activeSessionAt(now),cycle=data?.marketCycle;
 const active=cycle?.activeSession===session?cycle.sessions?.find(s=>s.name===session):null;
 const reference=cycle?.activeSession===session?cycle.hshReference:null;
 const asia=cycle?.activeSession===session?cycle.sessions?.find(s=>s.name==='ASIA'):null;
 const referenceName=({ASIA:'EROPA',EROPA:'USA',USA:'ASIA'})[session];
 const referencePrice=reference?.name===referenceName?reference.hshOpen:null;
 const fmt=v=>Number.isFinite(v)?v.toFixed(data?.decimals??3):'Menunggu riwayat sesi';
 const date=t=>t?new Date(t).toLocaleString('id-ID',{timeZone:'Asia/Jakarta',day:'2-digit',month:'short',hour:'2-digit',minute:'2-digit'}):'';
 return <details className="source-hsh-bar session-disclosure" aria-label="Acuan sesi Market"><summary><span>Acuan sesi · {session} · {({ASIA:'06.00–14.00',EROPA:'14.00–20.00',USA:'20.00–04.00',TRANSISI:'04.00–06.00'})[session]} WIB</span>{referenceName?<span className="session-hsh-visible"><b>HSH {referenceName} sebelumnya</b><strong>{fmt(referencePrice)}</strong>{session==='EROPA'&&<><b>HSH ASIA</b><strong>{fmt(asia?.open)}</strong></>}</span>:<span>Transisi · menunggu sesi berikutnya</span>}</summary><div className="session-disclosure-values"><div><small>HSH MARKET · {session}</small><strong>{fmt(active?.open)}</strong><span>{Number.isFinite(active?.open)?date(active.start)+' WIB':'Candle pembukaan sesi belum tersedia'}</span></div><div><small>HSH {referenceName||'PEMBANDING'} SEBELUMNYA</small><strong>{fmt(referencePrice)}</strong><span>{Number.isFinite(referencePrice)?date(reference.start)+' WIB'+(!reference.coverage?' · Open tersedia; rentang sesi belum lengkap':''):'Candle pembukaan sesi pembanding belum tersedia'}</span></div><p>Jendela metode dalam WIB: Asia 06.00–14.00 · Eropa 14.00–20.00 · USA 20.00–04.00 · Transisi 04.00–06.00. Ini pembagian sesi COP TAH, bukan jadwal buka/tutup instrumen; BTC tetap mencakup akhir pekan. Open sesi adalah acuan rumah HSH; pada Perahu BRK UP/BRK DWN, HSH dinonaktifkan. Entry/TP memakai rencana H4 yang sama; sentuhan level bukan bukti transaksi.</p></div></details>;
}
