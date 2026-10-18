import {sessionNarrative} from '../sessionNarrative.mjs';
export default function MarketSessionCycle({cycle,decimals=3}) {
  const reading=sessionNarrative(cycle,decimals);
  const number=n=>Number.isFinite(n)?n.toFixed(decimals):'—';
  const states={pending:'Belum mulai',unavailable:'Data belum tersedia',incomplete:'Riwayat belum lengkap',active:'Berjalan · sementara',completed:'Selesai · teramati'};
  return <div className="space-y-4">
    <div className="p-4 rounded-xl border border-slate-700 bg-slate-900/70">
      <p className="text-xs text-slate-400">{cycle?.source || 'Sumber belum tersedia'} · hari siklus {cycle?.tradingDay || '—'} · {cycle?.wibTime || '—'}</p>
      <h3 className="text-lg font-bold mt-2 text-slate-100">{reading.title}</h3>
      <p className="text-sm text-slate-300 leading-relaxed mt-2">{reading.summary}</p>
      <p className="text-xs text-slate-400 mt-2">JIKA D1: {cycle?.dailyJika || '—'} · Bias harga terhadap Open D1: {cycle?.bias || '—'} · Rumah HSH: Open N D1 {number(cycle?.hshOpen)}</p>
      <p className="text-sm text-cyan-200 mt-2">{reading.next}</p>
    </div>
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-3">
      {cycle?.sessions?.map(session=><div key={session.key} className="p-4 rounded-xl border border-slate-700 bg-slate-900/50">
        <div className="flex justify-between items-center gap-2"><strong className="text-sm">{session.name}</strong><span className={`text-[10px] ${session.status==='completed'?'text-emerald-300':session.status==='active'?'text-amber-200':'text-slate-400'}`}>{states[session.status]}</span></div>
        <p className="text-xs text-slate-400 mt-2">{session.hours}</p>
        <dl className="grid grid-cols-2 gap-2 my-4 text-xs tabular-nums">{[['Open',session.open],['High',session.high],['Low',session.low],['Close',session.close]].map(([name,value])=><div key={name}><dt className="text-slate-400">{name}</dt><dd className="text-slate-100 mt-1">{number(value)}</dd></div>)}</dl>
        <p className="text-[11px] text-slate-400">Candle H1: {session.bars} / {session.expectedBars} · hilang {session.missingBars}</p>
        {session.coverageNote && <p className="text-[10px] text-slate-400 mt-1">{session.coverageNote}</p>}
        <details className="mt-3 space-y-2"><summary className="cursor-pointer text-xs text-cyan-200">Rincian perkembangan sesi</summary>{cycle.steps?.filter(s=>s.session===session.name).map(step=><div key={step.step} className="border-t border-slate-700 pt-2"><div className="flex justify-between text-xs gap-2"><span>{step.title}</span><strong>{number(step.value)}</strong></div><p className="text-[10px] text-slate-400 mt-1">{states[step.status]}</p></div>)}</details>
      </div>)}
    </div>
    <div className="p-4 rounded-xl border border-slate-700 text-xs text-slate-300 leading-relaxed">
      <strong>Yang terlihat dari pergerakan sesi</strong>
      {reading.facts.length?reading.facts.map((line,i)=><p key={i} className="mt-2">{line}</p>):<p className="mt-2">Belum ada dua sesi dengan data yang cukup untuk dibandingkan.</p>}
      <p className="mt-3 text-cyan-200">{reading.next}</p>
      <details className="mt-3"><summary className="cursor-pointer text-slate-200">Lihat angka & bukti perhitungan</summary>{cycle?.evidence?.map((line,i)=><p key={i} className="mt-2">{line}</p>)}<p className="mt-2 text-slate-300">{cycle?.sessionConvention}</p><p className="mt-2">Jika High dan Low terbentuk dalam candle H1 yang sama, urutan kejadiannya belum dapat dipastikan.</p></details>

    </div>
  </div>;
}
