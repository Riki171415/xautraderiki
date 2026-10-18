export function quoteIsStale(data,now=Date.now()) {
 if(data?.referencePrice){
   const ref=data.referencePrice;
   return data.requirementsComplete===false||ref.freshness!=='FRESH'||!Number.isFinite(ref.priceTimestamp)||now-ref.priceTimestamp>45000||ref.priceTimestamp>now+5000;
 }
 if(Number.isFinite(data?.quoteTimestamp)&&(now-data.quoteTimestamp>45000||data.quoteTimestamp>now+5000))return true;
 return !data||data.marketDataStatus==='STALE_QUOTE'||!Number.isFinite(data.timestamp)||now-data.timestamp>45000||data.timestamp>now+5000;
}
export function dataQuality(data,now=Date.now()) {
 if(!data)return {status:'INCOMPLETE',label:'Belum lengkap',reason:'Menunggu data sumber.'};
 const ref=data.referencePrice;
 if(data.requirementsComplete===false)return {status:'INCOMPLETE',label:'Belum lengkap',reason:'Timeframe wajib belum lengkap atau pembaruannya tertunda. Sinyal live ditahan.'};
 if(ref?.freshness==='STALE')return {status:'STALE',label:'Data lama',reason:'Candle harga acuan sudah berakhir; waktu tick baru belum tersedia. Sinyal live ditahan.'};
 if(ref&&(!Number.isFinite(ref.price)||!Number.isFinite(ref.priceTimestamp)))return {status:'UNVERIFIED',label:'Kesegaran belum terverifikasi',reason:'Harga acuan berasal dari snapshot. Waktu tick terakhir tidak tersedia; sinyal live ditahan.'};
 if(quoteIsStale(data,now))return {status:'STALE',label:'Data lama',reason:'Waktu harga melewati batas kesegaran atau belum valid. Sinyal live ditahan.'};
 return {status:'FRESH',label:'Segar',reason:'Harga memiliki waktu sumber yang valid.'};
}
export function scopedTick(data,tick) {
 return tick&&tick.symbol===data?.symbol&&tick.broker===data?.broker?.id&&Number.isFinite(tick.bid)?tick:null;
}
