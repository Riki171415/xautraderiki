export default function NotificationCard({notice,onOpen,onClose,compact=false}) {
 return <article className={`notification-card notice-${notice.type} ${compact?'notice-compact':''}`}>
  <header><span className="notice-category">{notice.type==='warning'?'! PERHATIAN':'i INFORMASI'}</span>{onClose&&<button type="button" onClick={onClose} aria-label="Tutup notifikasi">✕</button>}</header>
  <h3>{notice.title}</h3><small>{[notice.symbol,notice.source,notice.time?new Date(notice.time).toLocaleTimeString('id-ID',{timeZone:'Asia/Jakarta',hour:'2-digit',minute:'2-digit'})+' WIB':null].filter(Boolean).join(' · ')}</small>
  <p>{notice.body}</p>
  {!!notice.details?.length&&<details><summary>Rincian kejadian · {notice.details.length}</summary><ul>{notice.details.map((line,i)=><li key={i}>{line}</li>)}</ul></details>}
  <p className="notice-next"><b>Berikutnya:</b> {notice.next}</p>{notice.caution&&<small className="notice-caution">{notice.caution}</small>}
  {onOpen&&<button type="button" className="notice-open" onClick={onOpen}>Buka rincian →</button>}
 </article>;
}
