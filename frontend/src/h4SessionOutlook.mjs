import {timeframeTask} from './timeframeTask.mjs';
import {activeSessionAt} from './liveMatrix.mjs';
export function h4SessionOutlook(columns=[],{now=Date.now(),stale=false,cycle}={}) {
 const h=timeframeTask(columns.find(c=>c.timeframe==='4h'),{now,stale});
 const w=timeframeTask(columns.find(c=>c.timeframe==='1w'),{now,stale});
 const direction=h.active&&!stale&&['UP','DOWN'].includes(h.jika)?h.jika:'WAIT';
 const weeklyPhase=direction==='WAIT'||!w.active||!['UP','DOWN'].includes(w.jika)?'UNDETERMINED':direction===w.jika?'TARGET_DIRECTION':'BOW_DIRECTION';
 const development=direction==='WAIT'||!['UP','DOWN'].includes(h.move)?'UNDETERMINED':h.move===direction?'ALIGNED':'OPPOSED';
 return {session:activeSessionAt(now,cycle),direction,weeklyJika:w.active?w.jika:'UNAVAILABLE',weeklyPhase,development,move:h.active?h.move:'UNAVAILABLE',open:h.open,before:h.before,close:h.close,weeklyOpen:w.open,weeklyBefore:w.before,stale,periodStart:h.periodStart,periodEnd:h.periodEnd};
}
