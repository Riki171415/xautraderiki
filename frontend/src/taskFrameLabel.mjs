import {TASK_FRAMES} from './timeframeTask.mjs';

export function taskFrameLabel(timeframe,columns=[]) {
  if(timeframe!=='market')return TASK_FRAMES.find(([id])=>id===timeframe)?.[1]||timeframe;
  const column=columns.find(c=>c.timeframe==='market');
  const session=String(column?.sessionName||column?.label||'').toUpperCase().match(/\b(ASIA|EROPA|USA)\b/)?.[1];
  return session?`Market · ${session==='ASIA'?'Asia':session==='EROPA'?'Eropa':'USA'}`:'Market · sesi belum tersedia';
}
