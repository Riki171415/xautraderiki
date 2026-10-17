import {API_BASE} from './config';
export async function twelveCandles(symbol,tf,signal){
 if(symbol!=='XAUUSD')throw new Error('Twelve Data hanya memakai XAUUSD pada aplikasi ini.');
 const res=await fetch(`${API_BASE}/twelve?${new URLSearchParams({timeframe:tf})}`,{signal});
 const json=await res.json();if(!res.ok||!json.success)throw new Error(json.error||'Twelve Data belum tersedia.');return json.data;
}
