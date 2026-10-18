import {dataQuality} from '../analysisState.mjs';
export default function DataQualityBar({data,now=Date.now(),broker,symbol,displayPrice}) {
 const quality=dataQuality(data,now),ref=data?.referencePrice;
 const rawPrice=Number.isFinite(displayPrice)?displayPrice:ref?ref.price:data?.leak4RegMatrix?.currentPrice??data?.ohlcv_N?.close;
 const price=rawPrice==null?NaN:Number(rawPrice);
 const time=ref?.priceTimestamp??data?.quoteTimestamp;
 const fmt=t=>Number.isFinite(t)?new Date(t).toLocaleString('id-ID',{timeZone:'Asia/Jakarta',day:'2-digit',month:'short',hour:'2-digit',minute:'2-digit',second:'2-digit'})+' WIB':'Belum tersedia';
 return <section className={`data-quality-bar quality-${quality.status.toLowerCase()}`} aria-label="Status data bersama">
  <div><span>Harga acuan {Number.isFinite(price)?price.toFixed(data?.decimals??3):'—'}</span><b>{quality.label}</b></div>
  <details><summary>Waktu harga: {fmt(time)} · Rincian sumber</summary><p>{quality.reason}</p>{data?.retryAt>now&&<p>Antrean dilanjutkan setelah jeda kuota · sekitar {Math.ceil((data.retryAt-now)/1000)} detik.</p>}<dl><div><dt>Data diambil</dt><dd>{fmt(ref?.fetchedAt??data?.fetchedAt??data?.timestamp)}</dd></div><div><dt>Awal candle acuan</dt><dd>{fmt(ref?.candleStart)}</dd></div><div><dt>Asal harga</dt><dd>{ref?.source==='M1_CLOSE'?'Close M1 · bukan tick live':ref?.source==='BOOK_TICKER'?'Book ticker · waktu tick belum tersedia':'Sumber broker'}</dd></div></dl>
  {data?.dataAvailability&&<ul>{Object.entries(data.dataAvailability).map(([tf,item])=><li key={tf}><b>{tf}</b> · {item.available?'Snapshot tersedia':'Belum tersedia'}{item.error?` · ${item.error}`:''} · diambil {fmt(item.fetchedAt)}</li>)}</ul>}</details>
 </section>;
}
