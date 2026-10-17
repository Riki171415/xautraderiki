import {timeframeTask,TASK_FRAMES} from './timeframeTask.mjs';
const number=v=>v!=null&&v!==''&&Number.isFinite(Number(v))?Number(v):null;
export function bowContinuations(columns=[],{now=Date.now(),stale=false}={}) {
 return TASK_FRAMES.flatMap(([tf,label])=>{
 const big=columns.find(c=>c.timeframe===tf),model=timeframeTask(big,{now,stale});
 if(!model.active||stale||model.phase!=='BOW_DIRECTION')return [];
 const sell=model.jika==='UP',direction=sell?'DOWN':'UP',boundKeys=['pivot',...(sell?['sup1','sup2','sup3','sup4']:['res1','res2','res3','res4'])];
 return ['1m','5m','15m','30m','1h'].flatMap(smallTf=>{
  const small=columns.find(c=>c.timeframe===smallTf),micro=timeframeTask(small,{now,stale});
  if(!micro.active||!['UP','DOWN','NEUTRAL'].includes(micro.jika)||micro.close==null)return [];
  const low=number(small.lowN),high=number(small.highN),before=number(big[sell?'lowB':'highB']);
  const boundaries=boundKeys.flatMap(key=>{const value=number(big[key]);return value==null?[]:[{key,value,hit:low!=null&&high!=null?low<=value&&value<=high:null}];});
  const levelHit=boundaries.some(b=>b.hit),levelKnown=boundaries.length===boundKeys.length&&low!=null&&high!=null;
  const beforeBroken=before!=null&&low!=null&&high!=null?(sell?low<before:high>before):null;
  const jikaChanged=micro.jika!==direction;
  const held=jikaChanged&&levelKnown&&levelHit&&beforeBroken===true;
  const count=Number(jikaChanged)+Number(levelHit)+Number(beforeBroken===true);
  return [{timeframe:tf,label,smallTf,side:sell?'SELL':'BUY',status:held?'DITAHAN':!levelKnown||beforeBroken===null?'DATA BELUM LENGKAP':count?'PERINGATAN':micro.jika===direction&&micro.move===direction?'PANTAU BERSYARAT':'BELUM SELARAS',jika:micro.jika,move:micro.move,jikaChanged,levelHit:levelKnown?levelHit:null,beforeBroken,boundaries,before,beforeKey:sell?'lowB':'highB',checks:count,parentRange:model.range,microRange:micro.range}];
 });
 });
}
