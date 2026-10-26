import {useMt5Positions} from '../hooks/useMt5Positions';
export function Mt5PositionsView({snapshot,error,selectedServer='',sourceSession,now=Date.now()}){
 const matches=!!snapshot&&(!selectedServer||snapshot.server===selectedServer)&&(!sourceSession||snapshot.sourceSession===sourceSession);
 const fresh=matches&&snapshot.available&&Number.isFinite(snapshot.updatedAt)&&snapshot.updatedAt<=now+5000&&now-snapshot.updatedAt<=15000;
 const positions=fresh?snapshot.positions:[];
 const money=n=>Number.isFinite(n)?n.toLocaleString('id-ID',{minimumFractionDigits:2,maximumFractionDigits:2}):'—';
 const price=(n,digits)=>n==null?'—':digits==null?String(n):n.toFixed(digits);
 const status=error||(!matches&&snapshot&&selectedServer?`Menunggu ${selectedServer}`:!snapshot?'Menghubungkan ke MT5…':!fresh?'Menunggu daftar posisi yang segar.':positions.length?`${positions.length} posisi terbuka`:'Tidak ada posisi terbuka');
 return <details className="mt5-positions-panel"><summary><span><b>Posisi terbuka MT5</b><small>{status}</small></span>{fresh&&<span className={snapshot.profit>=0?'position-profit':'position-loss'}>Profit berjalan {money(snapshot.profit)} {snapshot.currency}</span>}</summary><div className="mt5-positions-content">
  <p>Posisi akun yang sedang login di terminal MT5 · {matches?snapshot.server:'menunggu server'} · hanya tampilan.</p>
  {!fresh?<p role="status">{status}</p>:!positions.length?<p>Tidak ada posisi terbuka pada snapshot ini.</p>:<div className="mt5-positions-scroll"><table><thead><tr>{['Tiket / instrumen','Arah','Lot','Harga masuk','Harga sekarang','SL','TP','Profit','Swap'].map(label=><th key={label}>{label}</th>)}</tr></thead><tbody>{positions.map(p=><tr key={p.ticket}><td><b>{p.symbol}</b><small>#{p.ticket}</small><small>{new Date(p.openedAt).toLocaleString('id-ID',{timeZone:'Asia/Jakarta'})} WIB</small></td><td className={p.side==='BUY'?'position-profit':'position-loss'}>{p.side}</td><td>{p.volume}</td><td>{price(p.priceOpen,p.digits)}</td><td>{price(p.priceCurrent,p.digits)}</td><td>{price(p.sl,p.digits)}</td><td>{price(p.tp,p.digits)}</td><td className={p.profit>=0?'position-profit':'position-loss'}>{money(p.profit)}</td><td>{money(p.swap)}</td></tr>)}</tbody></table></div>}
  {fresh&&<p className="mt5-positions-footnote">Mata uang akun: {snapshot.currency}. Total profit {money(snapshot.profit)} · swap {money(snapshot.swap)}, ditampilkan terpisah; komisi tidak dihitung. Snapshot {new Date(snapshot.updatedAt).toLocaleTimeString('id-ID',{timeZone:'Asia/Jakarta'})} WIB · diperbarui sekitar 3 detik.</p>}
 </div></details>;
}
export default function Mt5PositionsPanel(props){const result=useMt5Positions(props.selectedServer,props.sourceSession);return <Mt5PositionsView {...props} {...result}/>;}
