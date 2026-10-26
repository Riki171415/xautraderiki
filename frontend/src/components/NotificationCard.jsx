import {AlertTriangle,Info,X,ArrowUpRight} from 'lucide-react';
export default function NotificationCard({notice,onOpen,onClose,compact=false}) {
 return <article className={`notification-card notice-${notice.type} ${compact?'notice-compact':''}`}>
  <header><span className="notice-category">{notice.type==='warning'?<AlertTriangle size={15}/>:<Info size={15}/>} {notice.statusLabel||(notice.type==='warning'?'PANTAU HARGA':'INFORMASI')}</span>{onClose&&<button type="button" onClick={onClose} aria-label="Tutup notifikasi"><X size={17}/></button>}</header>
  <h3>{notice.title}</h3><small>{[notice.symbol,notice.source,notice.time?new Date(notice.time).toLocaleTimeString('id-ID',{timeZone:'Asia/Jakarta',hour:'2-digit',minute:'2-digit'})+' WIB':null].filter(Boolean).join(' · ')}</small>
  <p>{notice.body}</p>
  {notice.next&&<p className="notice-next"><b>Pantau:</b> {notice.next}</p>}
  {(!!notice.details?.length||notice.caution)&&<details><summary>Alasan & rincian</summary>{!!notice.details?.length&&<ul>{notice.details.map((line,i)=><li key={i}>{line}</li>)}</ul>}{notice.caution&&<small className="notice-caution">{notice.caution}</small>}</details>}
  {onOpen&&<button type="button" className="notice-open" onClick={onOpen}>Buka rincian <ArrowUpRight size={15}/></button>}
 </article>;
}
