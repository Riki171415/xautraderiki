import {quoteIsStale} from '../analysisState.mjs';
import {useLiveMatrix} from './useLiveMatrix';
import {h4ConfluencePlan} from '../h4ConfluencePlan.mjs';
export function useH4Plan(data,tick,tolerance=0,now=Date.now()) {
 const matrix=useLiveMatrix(data,tick,now);
 const valid=!!tick&&!!data&&Number.isFinite(tick.bid)&&tick.symbol===data?.symbol&&tick?.broker===data?.broker?.id;
 const price=Number(matrix?.currentPrice);
 const h4=matrix?.rsColumns?.find(c=>c.timeframe==='4h');
 const raw=h4ConfluencePlan(matrix?.rsColumns||[],price,{tolerance,decimals:data?.decimals??3,now,stale:quoteIsStale(data,now)});
 const targets=raw.areas.filter(a=>a.role.startsWith('TP'));
 const distance=v=>Number.isFinite(v)&&Number.isFinite(raw.entryPrice)?Math.abs(v-raw.entryPrice):null;
 const risk=distance(raw.stopLoss);
 const plan={...raw,tp1Points:distance(targets[0]?.value),tp2Points:distance(targets[1]?.value),slPoints:risk,riskReward:risk>0&&Number.isFinite(targets[1]?.value)?(distance(targets[1].value)/risk).toFixed(2):'—',estProfitTp1:'—',estProfitTp2:'—',estLossSl:'—',tp1:targets[0]?.value,tp2:targets[1]?.value,tp3:targets[2]?.value};
 if(quoteIsStale(data,now))Object.assign(plan,{action:'WAIT',reason:'Harga terakhir belum segar; rencana aktif ditahan.'});
 return {plan,h4,price,matrix};
}
