import {X,AlertTriangle} from 'lucide-react';
import {useEffect,useRef} from 'react';
export default function MatrixDetailPanel({title,onClose,children}) {
 const ref=useRef(null);
 useEffect(()=>{const previous=document.activeElement;ref.current?.showModal();return()=>{if(previous?.isConnected)previous.focus?.();};},[]);
 return <dialog ref={ref} className={`matrix-detail-panel ${title==='Peringatan'?'market-warning-panel':''}`} aria-labelledby="matrix-detail-title" onCancel={onClose} onClick={e=>{if(e.target===e.currentTarget)onClose();}}><header><div className="matrix-panel-heading">{title==='Peringatan'&&<AlertTriangle size={19}/>}<div><h2 id="matrix-detail-title">{title}</h2>{title==='Peringatan'&&<p>Tugas Daily & konteks sesi market</p>}</div></div><button type="button" autoFocus onClick={onClose} aria-label="Tutup panel rincian"><X size={19}/></button></header><div className="matrix-detail-content">{children}</div></dialog>;
}
