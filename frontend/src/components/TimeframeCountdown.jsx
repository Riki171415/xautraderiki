export default function TimeframeCountdown({column,now}) {
 const end=column?.periodEnd;
 const valid=typeof end==='number'&&Number.isFinite(end)&&end>0;
 const seconds=valid?Math.max(0,Math.ceil((end-now)/1000)):0;
 const days=Math.floor(seconds/86400);
 const clock=[Math.floor(seconds%86400/3600),Math.floor(seconds%3600/60),seconds%60].map(v=>String(v).padStart(2,'0')).join(':');
 const label=!valid?'—':seconds===0?'Memperbarui':days?`${days}h ${Math.floor(seconds%86400/3600)}j`:clock;
 const description=!valid?'Waktu pergantian belum tersedia':seconds===0?'Menunggu candle baru':`Sisa ${days?`${days} hari `:''}${clock} sampai pergantian candle`;
 return <span className={`tf-countdown${seconds>0&&seconds<=60?' is-ending':''}`} aria-label={description} title={valid?`${description} · Akhir periode: ${new Date(end).toLocaleString('id-ID',{timeZone:'Asia/Jakarta'})} WIB`:description}><svg viewBox="0 0 16 16" width="10" height="10" fill="none" stroke="currentColor" strokeWidth="1.3" aria-hidden="true"><circle cx="8" cy="8" r="5.8"/><path d="M8 4.5V8l2.5 1.5"/></svg><span>{label}</span></span>;
}
