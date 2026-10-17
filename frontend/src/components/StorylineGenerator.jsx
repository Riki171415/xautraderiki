import {useH4Plan} from '../hooks/useH4Plan';
import {useState} from 'react';
import {BookOpen,Copy,Check,ChevronDown} from 'lucide-react';
export default function StorylineGenerator({data,liveTick,tolerance=0}) {
 const [copied,setCopied]=useState(false),[copyError,setCopyError]=useState(false);
 const anchored=useH4Plan(data,liveTick,tolerance);
 if(!data)return <section className="cop-panel text-sm text-slate-400">Analisis menunggu sumber data.</section>;
 const cards=[
  {label:'01 · Arah periode',title:`JIKA ${data.jika?.trend||'—'}`,text:`Open N ${data.ohlcv_N?.open??'—'} dibanding Open B ${data.ohlcv_B?.open??'—'}. ${data.jika?.trend==='UP'?'Arah JIKA naik.':data.jika?.trend==='DOWN'?'Arah JIKA turun.':'Tunggu arah; data belum menentukan skenario.'}`},
  {label:'02 · Kondisi harga',title:data.perahu?.pattern||'—',text:data.perahu?.pattern?.includes('SDW')?'High dan Low masih di dalam rentang B; pantau perkembangan berikutnya.':data.perahu?.pattern?.includes('BRK')?'Ada penembusan batas B. Cocokkan dengan konteks timeframe besar.':data.perahu?.pattern?.includes('ANL')?'Penembusan berlawanan arah JIKA. Pantau risiko perubahan skenario.':'Periksa perbandingan High dan Low terhadap periode B pada Tabel Matriks.'},
  {label:'03 · Rencana bersyarat',title:anchored.plan.action,text:anchored.plan.reason},
  {label:'04 · Rumah harga',title:`HSH · Open N ${Number.isFinite(data.ohlcv_N?.open)?data.ohlcv_N.open.toFixed(data.decimals??3):'—'}`,text:data.hsh?.hshMessage||'Pantau gerakan terhadap Open N; kembali ke rumah belum terkonfirmasi.'}
 ];
 const narrative=[`${data.symbol} · ${data.broker?.name} · ${data.timeframe} · ${data.dataSource}`, ...cards.map(c=>`${c.label} — ${c.title}\n${c.text||''}`), `Rencana H4: ${anchored.plan.action}\n${anchored.plan.reason}`, ...(anchored.plan.areas||[]).map(a=>`${a.role}: ${a.value.toFixed(data.decimals??3)}`), 'Sentuhan level bukan bukti entry atau TP transaksi. Lot dan risiko uang belum terverifikasi.'].join('\n\n');
 async function copy(){try{await navigator.clipboard.writeText(narrative);setCopied(true);setCopyError(false);setTimeout(()=>setCopied(false),2000);}catch{setCopyError(true);}}
 return <section className="cop-panel story-reading space-y-5">
  <header className="flex items-center justify-between flex-wrap gap-3"><div className="flex gap-3 items-center"><span className="p-3 rounded-xl bg-cyan-500/10 text-cyan-300"><BookOpen size={20}/></span><div><p className="workspace-eyebrow">PEMBACAAN COP TAH</p><h2 className="text-lg font-semibold mt-1">Alur cerita market</h2><p className="text-xs text-slate-400 mt-1">{data.symbol} · {data.timeframe?.toUpperCase()} · {data.broker?.name}</p></div></div><button type="button" onClick={copy} className="chart-toggle flex items-center gap-2">{copied?<Check size={15}/>:<Copy size={15}/>} {copied?'Tersalin':'Salin analisis'}</button></header>
  <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-3">{cards.map(c=><article key={c.label} className="p-4 rounded-xl border border-slate-700/70 bg-slate-950/30 min-w-0"><p className="text-xs text-slate-400">{c.label}</p><h3 className="text-sm font-semibold text-amber-200 mt-3 break-words">{c.title}</h3><p className="text-sm text-slate-300 leading-relaxed mt-2 break-words">{c.text||'Data penjelas belum tersedia.'}</p></article>)}</div>
  <p className="text-xs leading-relaxed text-slate-400">{'Rencana H4 sama dengan Terminal & Entry. Urutan entry → TP untuk rencana ini belum terverifikasi; sentuhan level bukan bukti profit.'}</p>
  {copyError&&<p role="status" className="text-xs text-amber-200">Browser belum mengizinkan penyalinan. Teks lengkap dapat dipilih pada rincian di bawah.</p>}
  {<details className="border-t border-slate-700 pt-4"><summary className="cursor-pointer text-sm text-cyan-200">Baca narasi lengkap</summary><div className="whitespace-pre-wrap break-words text-sm text-slate-300 leading-7 mt-4 font-sans">{narrative}</div></details>}
 </section>;
}
