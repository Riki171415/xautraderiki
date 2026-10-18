import {API_BASE} from './config';
export async function twelveCandles(symbol,tf,signal){
 if(!['XAUUSD','BTCUSD','EURUSD','GBPUSD'].includes(symbol))throw new Error('Instrumen Twelve Data tidak didukung.');
 const res=await fetch(`${API_BASE}/twelve?${new URLSearchParams({timeframe:tf,symbol})}`,{signal});
 const json=await res.json();if(!res.ok||!json.success)throw new Error(json.error||'Twelve Data belum tersedia.');return json.data;
}
