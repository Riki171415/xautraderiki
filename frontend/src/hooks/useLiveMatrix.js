import {calcHukumPerahu} from 'virtual:coptah/rule_engine';
import {scopedTick} from '../analysisState.mjs';
import {useRef} from 'react';
import {projectMatrix} from '../liveMatrix.mjs';
export function useLiveMatrix(data,tick,now=Date.now()) {
 const ref=useRef(null);
 const scope=`${data?.broker?.id}|${data?.symbol}`;
 const validTick=scopedTick(data,tick);
 const previous=ref.current?.scope===scope?ref.current.matrix:null;
 let matrix=projectMatrix(data?.leak4RegMatrix,validTick,data?.decimals??3,now,previous);
 if(matrix){
  const numeric=v=>v!=null&&v!==''&&Number.isFinite(Number(v))?Number(v):null;
  const tickCurrent=validTick&&Number.isFinite(validTick.timestamp)&&validTick.timestamp<=now&&matrix.rsColumns.some(c=>validTick.timestamp>=c.periodStart&&validTick.timestamp<c.periodEnd);
  matrix={...matrix,currentPrice:tickCurrent?validTick.bid.toFixed(data?.decimals??3):matrix.currentPrice,tableRows:matrix.tableRows.map(row=>{
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
