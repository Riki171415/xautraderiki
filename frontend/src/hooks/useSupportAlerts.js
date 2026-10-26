import {supportNotice} from '../notificationCopy.mjs';
import {sourceIdentity} from '../sourceIdentity.mjs';
import {useEffect,useRef,useState} from 'react';
import {nextSupportAlerts,supportDistance,supportAreas,confirmedSupportSwings,supportObservation} from '../supportAlerts.mjs';
import {quoteIsStale} from '../analysisState.mjs';
export function useSupportAlerts({data,liveTick,matrix,now,enabled,onNotify,allowNotice}) {
 const tracker=useRef(null),[watch,setWatch]=useState(null),digits=data?.decimals??3;
 const distance=supportDistance(data?.symbol,digits),scope=sourceIdentity(data);
 const {price,timestamp}=supportObservation(data,matrix,liveTick,now);
 useEffect(()=>{
  const areas=[...supportAreas(matrix?.rsColumns,now),...confirmedSupportSwings(data?.supportHistory?.hourly,now,distance)];
  const result=nextSupportAlerts(tracker.current,{scope,columns:matrix?.rsColumns,areas,price,timestamp,now,stale:!data||quoteIsStale(data,now),distance,decimals:digits});
  tracker.current=result.state;const update=result;
  setWatch({...update,distance,scope,price,decimals:digits,notificationsEnabled:enabled});
  if(!enabled||!update.events.length)return;
  const important=update.events.filter(event=>allowNotice?.('support',event,now));
  if(!important.length)return;
  onNotify?.('warning',supportNotice(important,{symbol:data.symbol,source:data.broker?.name,price,decimals:digits}));
 },[scope,data,liveTick,price,timestamp,now,distance,digits,enabled,onNotify,allowNotice]);
 return watch?.scope===scope?watch:null;
}
