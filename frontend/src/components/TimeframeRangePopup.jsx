import RvsLimitInfo from './RvsLimitInfo';
import {useEffect,useRef} from 'react';
export default function TimeframeRangePopup({column,row,symbol,source,decimals=3,level,onClose,columns=[],now=Date.now(),stale=false,embedded=false,price}) {
 const dialog=useRef(null);
 useEffect(()=>{if(embedded)return;const previous=document.activeElement;if(!embedded)dialog.current?.showModal();return()=>previous?.isConnected&&previous.focus?.();},[embedded]);
 const fmt=value=>value!=null&&value!==''&&Number.isFinite(Number(value))?Number(value).toFixed(decimals):'Belum tersedia';
 const value=key=>column?.[key]??row?.[key];
 const Container=embedded?'section':'dialog';
 return <Container ref={dialog} className="timeframe-range-popup" aria-labelledby="timeframe-range-title" onCancel={onClose} onClick={e=>{if(e.target===e.currentTarget)onClose();}}>
  <header><div><small>DETAIL HIGH / LOW</small><h2 id="timeframe-range-title">{column?.label||row?.label||column?.timeframe} · {symbol}</h2></div><button type="button" autoFocus onClick={onClose} aria-label="Tutup detail High Low">✕</button></header>
  <p className="range-popup-source">{source||'Sumber aktif'}{level?` · Level ${level==='pivot'?'Pivot':level.replace('res','R').replace('sup','S')} ${fmt(column?.[level])}`:''}</p>
  <table><thead><tr><th>Periode</th><th>HB · High</th><th>LB · Low</th></tr></thead><tbody><tr><th>N · Snapshot</th><td>{fmt(value('highN'))}</td><td>{fmt(value('lowN'))}</td></tr><tr><th>B · Sebelumnya</th><td>{fmt(value('highB'))}</td><td>{fmt(value('lowB'))}</td></tr></tbody></table>
  <RvsLimitInfo price={price} column={column} columns={columns} now={now} stale={stale} decimals={decimals}/><p className="range-popup-note">N adalah candle terakhir dari sumber; periksa waktu periode dan status kesegarannya. B adalah candle sebelumnya pada timeframe yang sama.</p>
  <button className="chart-toggle" type="button" onClick={onClose}>Tutup</button>
 </Container>;
}
