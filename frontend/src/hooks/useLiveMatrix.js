import {sourceIdentity} from '../sourceIdentity.mjs';
import {calcHukumPerahu,hshEligibility} from 'virtual:coptah/rule_engine';
import {scopedTick} from '../analysisState.mjs';
import {useRef} from 'react';
import {projectMatrix} from '../liveMatrix.mjs';
export function useLiveMatrix(data,tick,now=Date.now()) {
 const ref=useRef(null);
 const scope=sourceIdentity(data);
 const scoped=scopedTick(data,tick);
 const validTick=scoped&&Number.isFinite(scoped.timestamp)&&scoped.timestamp<=now&&now-scoped.timestamp<=45000&&scoped.timestamp>=(data?.quoteTimestamp||0)?scoped:null;
 const previous=ref.current?.scope===scope?ref.current.matrix:null;
 let matrix=projectMatrix(data?.leak4RegMatrix,validTick,data?.decimals??3,now,previous);
 if(matrix){
  matrix={...matrix,rsColumns:matrix.rsColumns.map(c=>{
    const values=['openN','highN','lowN','openB','highB','lowB'].map(k=>c[k]==null?NaN:Number(c[k]));
    const pattern=values.every(Number.isFinite)?calcHukumPerahu({open:values[0],high:values[1],low:values[2]},{open:values[3],high:values[4],low:values[5]}):null;
    return {...c,hshEligibility:hshEligibility(pattern)};
  })};
  const numeric=v=>v!=null&&v!==''&&Number.isFinite(Number(v))?Number(v):null;
  const tickCurrent=validTick&&Number.isFinite(validTick.timestamp)&&validTick.timestamp<=now&&validTick.timestamp>=(previous?.lastTickTimestamp||0)&&matrix.rsColumns.some(c=>validTick.timestamp>=c.periodStart&&validTick.timestamp<c.periodEnd);
  matrix={...matrix,lastTickTimestamp:tickCurrent?validTick.timestamp:previous?.lastTickTimestamp||0,currentPrice:tickCurrent?validTick.bid.toFixed(data?.decimals??3):previous?.lastTickTimestamp>0&&previous.lastTickTimestamp>=(data?.quoteTimestamp||data?.timestamp||0)?previous.currentPrice:matrix.currentPrice,tableRows:matrix.tableRows.map(row=>{
   const c=matrix.rsColumns.find(c=>c.timeframe===row.timeframe);if(!c)return row;
   const vals=['openN','openB','highN','lowN','highB','lowB','closeN','pivot'].map(k=>numeric(c[k]));
   const [o,ob,h,l,hb,lb,close,pivot]=vals;if([o,ob,h,l,hb,lb].some(v=>v==null)||h<l||hb<lb)return row;
   const direct=o>ob?'UP':o<ob?'DOWN':'NEUTRAL',move=close==null?'WAIT':close>o?'UP':close<o?'DOWN':'FLAT';
   return {...row,direct,move,opPv:pivot==null?'—':o>pivot?'ABOVE':o<pivot?'BELOW':'EQV',pattern:calcHukumPerahu({open:o,high:h,low:l},{open:ob,high:hb,low:lb}).pattern,track:['UP','DOWN'].includes(move)&&direct!=='NEUTRAL'?(move===direct?'TARGET ':'BUSUR ')+move:'WAIT'};
  })};
 }
 ref.current={scope,matrix};
 return matrix;
}
