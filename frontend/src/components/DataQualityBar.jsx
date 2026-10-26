import {Clock3,ShieldCheck,AlertTriangle,ChevronDown} from 'lucide-react';
import {dataQuality} from '../analysisState.mjs';
import {formatDataTime,dataAge} from '../dataTimestamp.mjs';
export default function DataQualityBar({data,now=Date.now(),broker,symbol,displayPrice,liveTick,updateDelayed=false}) {
 const quality=dataQuality(data,now),ref=data?.referencePrice;
 const rawPrice=Number.isFinite(displayPrice)?displayPrice:ref?ref.price:data?.leak4RegMatrix?.currentPrice??data?.ohlcv_N?.close;
 const price=rawPrice==null?NaN:Number(rawPrice);
 const tickCurrent=!!liveTick&&!!data&&liveTick.broker===data.broker?.id&&liveTick.symbol===data.symbol&&Number.isFinite(liveTick.timestamp)&&liveTick.timestamp<=now&&now-liveTick.timestamp<10000;
 const time=tickCurrent?liveTick.timestamp:ref?.priceTimestamp??data?.quoteTimestamp;
 const updated=data?.timestamp;
 const fmt=formatDataTime;
 return <section className={`data-quality-bar quality-${quality.status.toLowerCase()}`} aria-label="Status data bersama">
  <div className="quality-overview"><div className="quality-price"><span>Harga acuan</span><strong>{Number.isFinite(price)?price.toFixed(data?.decimals??3):'—'}</strong></div><span className={`quality-badge ${updateDelayed?'is-delayed':''}`}>{quality.status==='FRESH'&&!updateDelayed?<ShieldCheck size={14}/>:<AlertTriangle size={14}/>} {updateDelayed?'Pembaruan tertunda':quality.label}</span></div>
  <div className="quality-times"><div><Clock3 size={15}/><div><span>Analisis diperbarui</span><strong>{fmt(updated)}</strong><small>{dataAge(updated,now)}</small></div></div><div><Clock3 size={15}/><div><span>Harga sumber</span><strong>{fmt(time)}</strong><small>{dataAge(time,now)}{tickCurrent?' · tick terbaru':''}</small></div></div></div>
  {(updateDelayed||quality.status!=='FRESH')&&data&&<div className="quality-warning" role="status"><AlertTriangle size={17}/><div><strong>{updateDelayed?'Menampilkan data terakhir':'Periksa kesegaran data'}</strong><p>{updateDelayed?'Pembaruan sedang dicoba kembali. Perhatikan waktu analisis dan harga sumber di atas.':'Waktu sumber atau kelengkapan data belum terverifikasi. Periksa rincian sebelum memakai analisis.'}</p></div></div>}
  <details><summary>Rincian sumber & koneksi <ChevronDown size={14}/></summary><p>{quality.reason}</p>{data?.retryAt>now&&<p>Antrean dilanjutkan setelah jeda kuota · sekitar {Math.ceil((data.retryAt-now)/1000)} detik.</p>}<dl><div><dt>Data diambil</dt><dd>{fmt(ref?.fetchedAt??data?.fetchedAt??data?.timestamp)}</dd></div><div><dt>Awal candle acuan</dt><dd>{fmt(ref?.candleStart)}</dd></div><div><dt>Asal harga</dt><dd>{ref?.source==='M1_CLOSE'?'Close M1 · bukan tick live':ref?.source==='BOOK_TICKER'?'Book ticker · waktu tick belum tersedia':'Sumber broker'}</dd></div></dl>
  {data?.dataAvailability&&<ul>{Object.entries(data.dataAvailability).map(([tf,item])=><li key={tf}><b>{tf}</b> · {item.available?'Snapshot tersedia':'Belum tersedia'}{item.error?` · ${item.error}`:''} · diambil {fmt(item.fetchedAt)}</li>)}</ul>}</details>
 </section>;
}
