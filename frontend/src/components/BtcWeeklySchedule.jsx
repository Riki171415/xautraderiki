import {btcWeeklySchedule} from '../btcWeeklySchedule.mjs';
export default function BtcWeeklySchedule({columns=[],data,now=Date.now()}) {
 const m=btcWeeklySchedule(columns.find(c=>c.timeframe==='1w'),{symbol:data?.symbol,now});if(!m)return null;
 const date=t=>new Date(t).toLocaleString('id-ID',{timeZone:'Asia/Jakarta',day:'2-digit',month:'short',hour:'2-digit',minute:'2-digit'})+' WIB';
 return <section className="btc-weekly-schedule"><header><strong>BTC · JADWAL WEEKLY 7 HARI</strong><b>{m.available?(m.phase==='BOW_DIRECTION'?'WAKTU BUSUR':'WAKTU TARGET'):'BELUM TERVERIFIKASI'}</b></header>{m.available?<><div><article className={m.phase==='BOW_DIRECTION'?'is-active':''}><span>Busur · 3,5 hari</span><strong>{date(m.start)}</strong><small>sampai {date(m.midpoint)}</small></article><article className={m.phase==='TARGET_DIRECTION'?'is-active':''}><span>Target · 3,5 hari</span><strong>{date(m.midpoint)}</strong><small>sampai {date(m.end)}</small></article></div><p>{m.note}</p></>:<p>{m.reason}</p>}</section>;
}
