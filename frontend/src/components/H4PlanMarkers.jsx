import H4AttentionAreas from './H4AttentionAreas';
import {h4ConfluencePlan} from '../h4ConfluencePlan.mjs';
export default function H4PlanMarkers({columns=[],price,tolerance=0,decimals=3,now=Date.now(),stale=false}) {
 const plan=h4ConfluencePlan(columns,Number(price),{tolerance,decimals,now});
 if(!stale&&plan.action==='WAIT'&&plan.attentionAreas?.length)return <H4AttentionAreas areas={plan.attentionAreas} price={Number(price)} decimals={decimals} compact/>;
 if(stale||plan.action==='WAIT')return <div className="h4-order-markers h4-order-wait"><strong>BUY/SELL & TP · MENUNGGU KONFIRMASI</strong><span>{stale?'Harga belum segar; penanda rencana aktif ditahan.':plan.reason}</span></div>;
 return <div className="h4-order-markers" aria-label="Penanda rencana BUY SELL dan target H4"><span className={plan.action==='BUY LIMIT'?'order-buy':'order-sell'}><b>{plan.action}</b><strong>{plan.entryPrice.toFixed(decimals)}</strong><small>ENTRY H4</small></span>{plan.areas.filter(a=>a.role.startsWith('TP')).map(a=><span className="order-tp" key={a.role}><b>{a.role}</b><strong>{a.value.toFixed(decimals)}</strong><small>H4 · {a.count} TF cocok</small></span>)}<span className="order-sl"><b>SL</b><strong>{plan.stopLoss.toFixed(decimals)}</strong><small>BATAS RISIKO H4</small></span><small className="order-note">Rencana bersyarat · sentuhan harga bukan bukti entry atau TP transaksi.</small></div>;
}
