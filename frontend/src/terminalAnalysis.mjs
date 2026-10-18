import {quoteIsStale} from './analysisState.mjs';
import {matrixPlan} from './matrixPlan.mjs';
export const TERMINAL_LEVELS=['res4','res3','res2','res1','pivot','sup1','sup2','sup3','sup4'];
export function terminalAnalysis({data,rows,columns,selected,price,tolerance=0,now=Date.now(),decimals=3}) {
 const row=rows.find(r=>r.timeframe===selected),column=columns.find(c=>c.timeframe===selected);
 const expired=!!column&&Number.isFinite(column.periodEnd)&&!(column.periodStart<=now&&now<column.periodEnd);
 const stale=quoteIsStale(data,now)||expired;
 let plan=!row||!column?{action:'WAIT',reason:'Riwayat timeframe ini belum lengkap; tidak membuat rencana dari timeframe pengganti.'}:stale?{action:'WAIT',reason:expired?'Periode timeframe sudah berakhir; menunggu candle periode baru.':'Harga belum segar; rencana aktif ditahan.'}:matrixPlan(column||{timeframe:selected},data?.marketEntry,{columns,price:Number(price),options:{decimals,tolerance,now,stale}});
 if(quoteIsStale(data,now))plan={...plan,action:'WAIT',reason:'Harga belum segar; rencana aktif ditahan. '+plan.reason};
 const active=['BUY LIMIT','SELL LIMIT'].includes(plan.action);
 const riskDistance=active?Math.abs(plan.entryPrice-plan.stopLoss):null;
 const targets=active?['tp1','tp2','tp3'].map(key=>({key,value:plan[key],rewardRisk:Number.isFinite(plan[key])&&riskDistance>0?Math.abs(plan[key]-plan.entryPrice)/riskDistance:null})):[];
 const numeric=v=>v!=null&&Number.isFinite(Number(v))?Number(v):null;
 const open=numeric(column?.openN),high=numeric(column?.highN),low=numeric(column?.lowN);
 const range=high!=null&&low!=null?high-low:null;
 const age=column&&column.periodEnd>column.periodStart?Math.max(0,Math.min(100,100*(now-column.periodStart)/(column.periodEnd-column.periodStart))):null;
 const extension=range>0&&open!=null?Math.abs(Number(price)-open)/range:0;
 const hsh={open,age,remaining:column?Math.max(0,column.periodEnd-now):null,warning:!stale&&age>=80&&extension>.3};
 const warnings=[plan.reason||'Rencana bersyarat: tunggu harga dan konfirmasi.',...(quoteIsStale(data,now)?['Harga terakhir belum diperbarui; jangan menganggap snapshot ini sebagai harga live.']:[]),...(expired?['Penanda berasal dari periode yang sudah berakhir.']:[]),...(column?.anomalies?.length?['Urutan level anomali: nilai asli dipertahankan; periksa urutan entry–SL–TP.']:[]),'Sentuhan R/S bukan bukti transaksi. Entry teramati dan urutan TP belum terverifikasi untuk rencana H4 ini.','Jangan mengejar harga; periksa sisi limit, spread, dan validitas SL sebelum mengambil keputusan.'];
 return {row,column,plan,active,stale,targets,riskDistance,hsh,warnings,lot:null,lotReason:'Lot dan risiko uang belum tersedia: modal akun, spesifikasi tick/kontrak, mata uang serta aturan volume instrumen belum terverifikasi. Tidak memakai lot bawaan.'};
}
