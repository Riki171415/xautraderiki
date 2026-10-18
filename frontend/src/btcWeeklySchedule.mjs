const DAY=86400000;
export function btcWeeklySchedule(column,{symbol,now=Date.now()}={}) {
 const btc=/^BTC(?:USD|USDC)(?:C|M)?$/.test(String(symbol||'').replaceAll('/','').toUpperCase());
 if(!btc)return null;
 const start=column?.periodStart,end=column?.periodEnd;
 if(!Number.isFinite(start)||!Number.isFinite(end)||Math.abs(end-start-7*DAY)>1000||now<start||now>=end)return {available:false,symbol,reason:'Menunggu candle Weekly BTC aktif dengan batas tujuh hari broker yang lengkap.'};
 const midpoint=start+3.5*DAY;
 return {available:true,symbol,start,midpoint,end,phase:now<midpoint?'BOW_DIRECTION':'TARGET_DIRECTION',bowDays:3.5,targetDays:3.5,elapsedDays:(now-start)/DAY,note:'Jadwal waktu BTC 7 hari: 3,5 hari awal Busur, 3,5 hari berikutnya Target. Fase harga tetap mengikuti JIKA/MOVE. Jeda maintenance tidak mengubah awal candle broker.'};
}
