export default function GlobalStoryline({data}) {
 const compass=data?.h4Compass;
 const rows=data?.leak4RegMatrix?.tableRows || [];
 const years=data?.yearlyCandles || [];
 const fmt=n=>Number.isFinite(Number(n))?Number(n).toFixed(data?.decimals ?? 3):'—';
 return <section className="cop-panel space-y-4">
   <div><p className="workspace-eyebrow">CERITA GLOBAL · DATA BROKER</p><h2 className="text-lg font-bold mt-2">10 tahun → tahunan → H4 → timeframe kecil</h2><p className="text-xs text-slate-400 mt-2">JIKA membandingkan Open N dan Open B. Gerak membandingkan Close N dan Open N. Busur/Target menunjukkan arah gerakan, bukan konfirmasi hasil.</p></div>
   <div className="grid grid-cols-1 md:grid-cols-3 gap-3">{(compass?.macro || []).map(f=><div key={f.timeframe} className="p-4 rounded-xl border border-slate-700 bg-slate-900/50"><strong>{f.timeframe} · JIKA {f.jika}{f.referenceOpenBSource ? ' · B arsip' : f.partialBefore ? ' · B parsial' : ''}</strong><p className="text-xs text-slate-400 mt-2">{f.available?`Open N ${fmt(f.openN)} · Open B ${fmt(f.openB)}`:'Data asli belum tersedia'}</p><p className="text-xs text-slate-300 mt-2">Gerak {f.move} · {f.phase==='BOW_DIRECTION'?'BUSUR':f.phase==='TARGET_DIRECTION'?'SEARAH TARGET':'TUNGGU'}</p>{f.referenceOpenBSource && <p className="text-xs text-amber-200 mt-2">{f.referenceOpenBSource}</p>}<p className="text-xs text-amber-200 mt-2">Rumah HSH = Open N {f.available?fmt(f.openN):'—'}</p></div>)}</div>
   {!compass && <p className="text-sm text-slate-400">Menunggu Kompas H4 dari backend terbaru.</p>}
   <div className="p-4 rounded-xl border border-slate-700"><strong>Posisi H4 dalam cerita global</strong><p className="text-sm text-slate-300 mt-2">{compass?.label || 'Belum tersedia'}</p><p className="text-xs text-slate-400 mt-2">{compass?.description}</p>{compass?.warnings?.map((w,i)=><p key={i} className="text-xs text-amber-200 mt-2">{w}</p>)}</div>
   <div className="overflow-x-auto"><table className="w-full text-xs text-left"><caption className="text-left text-slate-400 mb-3">Riwayat tahunan dari sumber data broker · tahun berjalan belum final</caption><thead><tr>{['Tahun','Open','High','Low','Close','JIKA'].map(h=><th key={h} className="p-2 border-b border-slate-700">{h}</th>)}</tr></thead><tbody>{years.map((y,i)=><tr key={y.year}>{[y.year,fmt(y.open),fmt(y.high),fmt(y.low),fmt(y.close),i?y.open>years[i-1].open?'UP':y.open<years[i-1].open?'DOWN':'NEUTRAL':'—'].map((v,j)=><td key={j} className="p-2 border-b border-slate-800">{v}</td>)}</tr>)}</tbody></table></div>
   {!years.length && <p className="text-xs text-slate-400">Riwayat tahunan belum tersedia. Tidak menampilkan proyeksi sebagai data aktual.</p>}
   <p className="text-[11px] text-slate-400">{data?.dataSource} · {rows.length} periode tersedia. Tidak ada asumsi harga masa depan atau kepastian harga akan pulang ke Open N.</p>
 </section>;
}
