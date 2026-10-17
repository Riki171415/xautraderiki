import {useRef} from 'react';
import {projectMatrix} from '../liveMatrix.mjs';
export function useLiveMatrix(data,tick,now=Date.now()) {
 const ref=useRef(null);
 const scope=`${data?.broker?.id}|${data?.symbol}`;
 const validTick=tick&&tick.symbol===data?.symbol&&tick.broker===data?.broker?.id?tick:null;
 const previous=ref.current?.scope===scope?ref.current.matrix:null;
 const matrix=projectMatrix(data?.leak4RegMatrix,validTick,data?.decimals??3,now,previous);
 ref.current={scope,matrix};
 return matrix;
}
