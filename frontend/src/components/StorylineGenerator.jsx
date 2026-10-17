import {useState} from 'react';
import {BookOpen,Copy,Check,ChevronDown} from 'lucide-react';
export default function StorylineGenerator({data}) {
 const [copied,setCopied]=useState(false),[copyError,setCopyError]=useState(false);
 if(!data)return <section className="cop-panel text-sm text-slate-400">Analisis menunggu sumber data.</section>;
 const cards=[
  {label:'01 · Arah periode',title:`JIKA ${data.jika?.trend||'—'}`,text:`Open N ${data.ohlcv_N?.open??'—'} dibanding Open B ${data.ohlcv_B?.open??'—'}. ${data.jika?.trend==='UP'?'Arah JIKA naik.':data.jika?.trend==='DOWN'?'Arah JIKA turun.':'Tunggu arah; data belum menentukan skenario.'}`},
  {label:'02 · Kondisi harga',title:data.perahu?.pattern||'—',text:data.perahu?.pattern?.includes('SDW')?'High dan Low masih di dalam rentang B; pantau perkembangan berikutnya.':data.perahu?.pattern?.includes('BRK')?'Ada penembusan batas B. Cocokkan dengan konteks timeframe besar.':data.perahu?.pattern?.includes('ANL')?'Penembusan berlawanan arah JIKA. Pantau risiko perubahan skenario.':'Periksa perbandingan High dan Low terhadap periode B pada Tabel Matriks.'},
  {label:'03 · Rencana bersyarat',title:data.busur?.action||'WAIT',text:data.busur?.reason||data.busur?.rationale},
  {label:'04 · Rumah harga',title:`HSH · Open N ${Number.isFinite(data.ohlcv_N?.open)?data.ohlcv_N.open.toFixed(data.decimals??3):'—'}`,text:data.hsh?.hshMessage||'Pantau gerakan terhadap Open N; kembali ke rumah belum terkonfirmasi.'}
 ];
 async function copy(){try{await navigator.clipboard.writeText(data.storyline||cards.map(c=>`${c.title}\n${c.text||''}`).join('\n\n'));setCopied(true);setCopyError(false);setTimeout(()=>setCopied(false),2000);}catch{setCopyError(true);}}
 return <section className="cop-panel story-reading space-y-5">
  <header className="flex items-center justify-between flex-wrap gap-3"><div className="flex gap-3 items-center"><span className="p-3 rounded-xl bg-cyan-500/10 text-cyan-300"><BookOpen size={20}/></span><div><p className="workspace-eyebrow">PEMBACAAN COP TAH</p><h2 className="text-lg font-semibold mt-1">Alur cerita market</h2><p className="text-xs text-slate-400 mt-1">{data.symbol} · {data.timeframe?.toUpperCase()} · {data.broker?.name}</p></div></div><button type="button" onClick={copy} className="chart-toggle flex items-center gap-2">{copied?<Check size={15}/>:<Copy size={15}/>} {copied?'Tersalin':'Salin analisis'}</button></header>
  <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-3">{cards.map(c=><article key={c.label} className="p-4 rounded-xl border border-slate-700/70 bg-slate-950/30 min-w-0"><p className="text-xs text-slate-400">{c.label}</p><h3 className="text-sm font-semibold text-amber-200 mt-3 break-words">{c.title}</h3><p className="text-sm text-slate-300 leading-relaxed mt-2 break-words">{c.text||'Data penjelas belum tersedia.'}</p></article>)}</div>
  <p className="text-xs leading-relaxed text-slate-400">{data.planObservation?.note||'Skenario mengikuti data aktual. Sentuhan level belum membuktikan transaksi atau profit.'}</p>
  {copyError&&<p role="status" className="text-xs text-amber-200">Browser belum mengizinkan penyalinan. Teks lengkap dapat dipilih pada rincian di bawah.</p>}
  {data.storyline&&<details className="border-t border-slate-700 pt-4"><summary className="cursor-pointer text-sm text-cyan-200">Baca narasi lengkap</summary><div className="whitespace-pre-wrap break-words text-sm text-slate-300 leading-7 mt-4 font-sans">{data.storyline}</div></details>}
 </section>;
}
