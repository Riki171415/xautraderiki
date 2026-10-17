import {useEffect,useRef} from 'react';
export default function MatrixDetailPanel({title,onClose,children}) {
 const ref=useRef(null);
 useEffect(()=>{const previous=document.activeElement;ref.current?.showModal();return()=>{if(previous?.isConnected)previous.focus?.();};},[]);
 return <dialog ref={ref} className="matrix-detail-panel" aria-labelledby="matrix-detail-title" onCancel={onClose} onClick={e=>{if(e.target===e.currentTarget)onClose();}}><header><h2 id="matrix-detail-title">{title}</h2><button type="button" autoFocus onClick={onClose} aria-label="Tutup panel rincian">✕</button></header><div className="matrix-detail-content">{children}</div></dialog>;
}
