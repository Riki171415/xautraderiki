// Two equal observation windows; this describes sampled price, not order flow.
export function sampleMomentum(previous=[],timestamp,price){
 if(!Number.isFinite(timestamp)||!Number.isFinite(price))return previous;
 const last=previous.at(-1);
 if(last&&timestamp-last.time<1000)return previous;
 return [...previous.filter(p=>p.time>=timestamp-75000),{time:timestamp,price}].slice(-80);
}
export function priceMomentum(samples=[],{now=Date.now(),precision=3}={}){
 const wait=reason=>({status:'UNAVAILABLE',label:'MOMENTUM BELUM CUKUP DATA',reason});
 const rows=samples.filter(p=>Number.isFinite(p.time)&&Number.isFinite(p.price)&&p.time<=now);
 const end=rows.at(-1);if(!end||now-end.time>10000)return wait('Menunggu tick sumber yang segar.');
 const nearest=t=>rows.reduce((a,b)=>Math.abs(b.time-t)<Math.abs(a.time-t)?b:a,rows[0]);
 const start=nearest(end.time-60000),middle=nearest(end.time-30000);
 if(Math.abs(start.time-(end.time-60000))>3000||Math.abs(middle.time-(end.time-30000))>3000)return wait('Perlu dua jendela 30 detik dengan data cukup.');
 const window=rows.filter(p=>p.time>=start.time);
 if(window.some((p,i)=>i&&p.time-window[i-1].time>10000))return wait('Ada jeda tick lebih dari 10 detik.');
 const a=(middle.price-start.price)/((middle.time-start.time)/1000),b=(end.price-middle.price)/((end.time-middle.time)/1000);
 const noise=2*10**(-precision),delta=end.price-middle.price;
 const direction=Math.abs(delta)<noise?'FLAT':delta>0?'UP':'DOWN';
 const previousDirection=Math.abs(middle.price-start.price)<noise?'FLAT':a>0?'UP':'DOWN';
 const weakening=direction!=='FLAT'&&direction===previousDirection&&Math.abs(b)<=Math.abs(a)*0.7;
 const status=direction==='FLAT'?'FLAT':direction!==previousDirection?'DIRECTION_CHANGED':weakening?'WEAKENING':'NO_WEAKENING';
 return {status,direction,previousVelocity:a,currentVelocity:b,ratio:a?Math.abs(b/a):null,label:weakening?(direction==='UP'?'NAIK MELEMAH':'TURUN MELEMAH'):status==='FLAT'?'GERAK DATAR':status==='DIRECTION_CHANGED'?'ARAH GERAK BERUBAH':'BELUM ADA PERLAMBATAN 30%',reason:'Kecepatan perubahan harga dua jendela 30 detik. Melemah bila arah sama dan kecepatan berkurang minimal 30%; perubahan minimal dua unit presisi. Parameter observasi, belum dikalibrasi historis.'};
}
