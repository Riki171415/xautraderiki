import {calcHukumPerahu} from 'virtual:coptah/rule_engine';
export default function MarketMovementBadge({column,now=Date.now(),stale=false}) {
 const c=column;
 const values=['openN','highN','lowN','openB','highB','lowB'].map(k=>c?.[k]==null||c[k]===''?NaN:Number(c[k]));
 const [open,high,low,openB,highB,lowB]=values;
 const valid=!c?.unavailable&&values.every(Number.isFinite)&&high>=low&&highB>=lowB&&open>=low&&open<=high&&openB>=lowB&&openB<=highB;
 const active=Number.isFinite(c?.periodStart)&&Number.isFinite(c?.periodEnd)&&c.periodStart<=now&&now<c.periodEnd;
 let label='BELUM TERSEDIA',kind='waiting',reason='Menunggu data OHLC periode aktif yang lengkap.';
 if(valid&&active&&!stale){
  const pattern=calcHukumPerahu({open,high,low},{open:openB,high:highB,low:lowB});
  const labels={'BRK UP':['STRONG BULLISH','bullish'],'BRK DWN':['STRONG BEARISH','bearish'],'NRL UP':['NORMAL ↑','normal'],'NRL DWN':['NORMAL ↓','normal'],'SDW UP':['SIDEWAYS','waiting'],'SDW DWN':['SIDEWAYS','waiting'],'ANL UP':['ANOMALI ↑','anomaly'],'ANL DWN':['ANOMALI ↓','anomaly'],'NEUTRAL':['NETRAL','waiting']};
  [label,kind]=labels[pattern.pattern]||['BELUM TERSEDIA','waiting'];
  reason=`Pola Perahu ${pattern.pattern}: ${pattern.pattern==='BRK UP'?'Open N > Open B; High N menembus High B dan Low N belum menembus Low B.':pattern.pattern==='BRK DWN'?'Open N < Open B; Low N menembus Low B dan High N belum menembus High B.':pattern.pattern.startsWith('NRL')?'High B dan Low B sama-sama ditembus.':pattern.pattern.startsWith('ANL')?'Batas ditembus berlawanan dengan arah JIKA.':pattern.pattern==='NEUTRAL'?'Open N sama dengan Open B.':'High B dan Low B belum ditembus.'} Penanda pola candle berjalan, bukan sinyal entry STRONG BUY/SELL.`;
 }else if(stale){label='DATA LAMA';reason='Harga belum segar; kekuatan pergerakan belum dinilai.';}
 return <span className={`market-movement movement-${kind}`} title={reason} aria-label={`Pergerakan market: ${label}. ${reason}`}>{label}</span>;
}
