export function formatDataTime(t) {
 return Number.isFinite(t)&&t>0?new Date(t).toLocaleString('id-ID',{timeZone:'Asia/Jakarta',day:'2-digit',month:'short',year:'numeric',hour:'2-digit',minute:'2-digit',second:'2-digit'})+' WIB':'Belum tersedia';
}
export function dataAge(t,now) {
 if(!Number.isFinite(t)||t<=0)return 'umur belum diketahui';
 if(t>now)return 'waktu sumber di depan waktu perangkat';
 const seconds=Math.floor((now-t)/1000);
 if(seconds<60)return `${seconds} detik lalu`;
 if(seconds<3600)return `${Math.floor(seconds/60)} menit ${seconds%60} detik lalu`;
 if(seconds<86400)return `${Math.floor(seconds/3600)} jam ${Math.floor(seconds%3600/60)} menit lalu`;
 return `${Math.floor(seconds/86400)} hari lalu`;
}
