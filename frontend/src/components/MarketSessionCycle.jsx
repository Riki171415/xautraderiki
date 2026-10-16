export default function MarketSessionCycle({cycle,decimals=3}) {
  const number=n=>Number.isFinite(n)?n.toFixed(decimals):'—';
  const states={pending:'Belum mulai',unavailable:'Data belum tersedia',incomplete:'Riwayat belum lengkap',active:'Berjalan · sementara',completed:'Selesai · teramati'};
  return <div className="space-y-4">
    <div className="p-4 rounded-xl border border-slate-700 bg-slate-900/70">
      <p className="text-xs text-slate-400">{cycle?.source || 'Sumber belum tersedia'} · hari siklus {cycle?.tradingDay || '—'} · {cycle?.wibTime || '—'}</p>
      <h3 className="text-lg font-bold mt-2 text-slate-100">{cycle?.label || 'Menunggu data sesi'}</h3>
      <p className="text-sm text-slate-300 leading-relaxed mt-2">{cycle?.description}</p>
      <p className="text-xs text-slate-400 mt-2">JIKA D1: {cycle?.dailyJika || '—'} · Bias harga terhadap Open D1: {cycle?.bias || '—'} · Rumah HSH: Open N D1 {number(cycle?.hshOpen)}</p>
      <p className="text-xs text-slate-400 mt-2">{cycle?.sessionConvention}</p>
    </div>
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-3">
      {cycle?.sessions?.map(session=><div key={session.key} className="p-4 rounded-xl border border-slate-700 bg-slate-900/50">
        <div className="flex justify-between items-center gap-2"><strong className="text-sm">{session.name}</strong><span className={`text-[10px] ${session.status==='completed'?'text-emerald-300':session.status==='active'?'text-amber-200':'text-slate-400'}`}>{states[session.status]}</span></div>
        <p className="text-xs text-slate-400 mt-2">{session.hours}</p>
        <dl className="grid grid-cols-2 gap-2 my-4 text-xs tabular-nums">{[['Open',session.open],['High',session.high],['Low',session.low],['Close',session.close]].map(([name,value])=><div key={name}><dt className="text-slate-400">{name}</dt><dd className="text-slate-100 mt-1">{number(value)}</dd></div>)}</dl>
        <p className="text-[11px] text-slate-400">Candle H1: {session.bars} / {session.expectedBars} · hilang {session.missingBars}</p>
        {session.coverageNote && <p className="text-[10px] text-slate-400 mt-1">{session.coverageNote}</p>}
        <div className="mt-3 space-y-2">{cycle.steps?.filter(s=>s.session===session.name).map(step=><div key={step.step} className="border-t border-slate-700 pt-2"><div className="flex justify-between text-xs gap-2"><span>{step.step}. {step.title}</span><strong>{number(step.value)}</strong></div><p className="text-[10px] text-slate-400 mt-1">{states[step.status]}</p></div>)}</div>
      </div>)}
    </div>
    <div className="p-4 rounded-xl border border-slate-700 text-xs text-slate-300 leading-relaxed">
      <strong>Dasar klasifikasi</strong>
      {cycle?.evidence?.length ? cycle.evidence.map((line,i)=><p key={i} className="mt-1">{line}</p>):<p className="mt-1">Belum ada perbandingan sesi yang cukup untuk menentukan pola.</p>}
      <p className="mt-2 text-slate-400">NORMAL: rentang Eropa melewati kedua sisi Asia, lalu USA melanjutkan arah tanpa melampaui ekstrem lawannya. STRONG: Eropa dan USA melanjutkan satu arah sambil mempertahankan ekstrem sisi sebaliknya. Jika kondisi berbeda, tampil MIXED. Selama sesi belum selesai, klasifikasi masih sementara.</p>
      <p className="mt-2 text-slate-400">High/Low berasal dari data aktual; urutan High dahulu atau Low dahulu dalam satu candle H1 tidak dapat dipastikan. Nomor langkah adalah pengelompokan pengamatan, bukan urutan kejadian yang dipaksakan jam.</p>
    </div>
  </div>;
}
