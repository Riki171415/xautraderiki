import {dataScope} from '../dataScope.mjs';
/**
 * useAnalysis — Fetches analysis from REST API with polling fallback
 */
import { useState, useEffect, useCallback, useRef } from 'react';

import { API_BASE } from '../config';
import {browserBinanceAnalysis} from '../browserBinanceAnalysis';

export function useAnalysis(symbol = 'XAUUSD', timeframe = '1h', broker = 'BINANCE', pollInterval = 30000) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [lastUpdated, setLastUpdated] = useState(null);

  const scope=dataScope(symbol,timeframe,broker);
  const [receivedScope,setReceivedScope]=useState(null);
  const requestRef = useRef(null);
  const fetchAnalysis = useCallback(async () => {
    if(requestRef.current&&!requestRef.current.signal.aborted&&requestRef.current.scope===scope&&requestRef.current.running)return;
    requestRef.current?.abort();
    const controller = new AbortController();
    controller.scope=scope;controller.running=true;
    requestRef.current = controller;
    let directMode=false;
    const timeout = setTimeout(() => controller.abort('timeout'), 12000);
    try {
      const params = new URLSearchParams({ symbol, timeframe, broker });
      const res = await fetch(`${API_BASE}/analysis?${params}`, { signal: controller.signal });
      if (res.status === 404) throw new Error('Server analisis belum tersedia pada alamat aplikasi ini (API 404).');
      if (!res.ok) {const detail=await res.json().catch(()=>null);throw new Error(detail?.error||`Server analisis tidak dapat diakses (HTTP ${res.status}).`);}
      if (!res.headers.get('content-type')?.includes('application/json')) throw new Error('Alamat data mengembalikan halaman web, bukan server analisis.');
      const json = await res.json();
      if (!json.success) throw new Error(json.error || 'Analisis gagal');
      if (!controller.signal.aborted) {
        setReceivedScope(scope);setData(json.data);
        setLastUpdated(new Date());
        setError(null);
        return json.data;
      }
    } catch (err) {
      clearTimeout(timeout);
      if(broker==='EXNESS'){if(!controller.signal.aborted || controller.signal.reason==='timeout')setError(controller.signal.reason==='timeout'?'Pembaruan data melewati batas waktu. Data terakhir dipertahankan; mencoba kembali otomatis.':err.message);return;}
      if (!controller.signal.aborted || controller.signal.reason === 'timeout') {
        const fallbackController=new AbortController();
        fallbackController.scope=scope;fallbackController.running=true;
        requestRef.current=fallbackController;directMode=true;
        const fallbackTimeout=setTimeout(()=>fallbackController.abort('timeout'),20000);
        try {
          const fallback=await browserBinanceAnalysis(symbol,timeframe,fallbackController.signal,'BINANCE');
          if(!fallbackController.signal.aborted){setReceivedScope(scope);setData(fallback);setLastUpdated(new Date());setError(null);return fallback;}
        } catch(failure) {if(!fallbackController.signal.aborted || fallbackController.signal.reason==='timeout')setError(`Server utama: ${err.message} Data Binance langsung: ${fallbackController.signal.reason==='timeout'?'Pembaruan melewati batas waktu.':failure.message}`);}
        finally {clearTimeout(fallbackTimeout);fallbackController.running=false;if(!fallbackController.signal.aborted || fallbackController.signal.reason==='timeout')setLoading(false);}
      }
    } finally {
      controller.running=false;
      clearTimeout(timeout);
      if (!directMode && (!controller.signal.aborted || controller.signal.reason === 'timeout')) setLoading(false);
    }
  }, [symbol, timeframe, broker]);

  useEffect(() => {
    setLoading(true);
    setError(null);
    fetchAnalysis();
    const interval = setInterval(fetchAnalysis, pollInterval);
    return () => { clearInterval(interval); requestRef.current?.abort(); };
  }, [fetchAnalysis, pollInterval]);

  return { data:receivedScope===scope?data:null, loading:loading, error, lastUpdated:receivedScope===scope?lastUpdated:null, refetch: fetchAnalysis };
}

export async function updateModal(modal) {
  const res = await fetch(`${API_BASE}/modal`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ modal: parseFloat(modal) }),
  });
  return res.json();
}

export async function resetTouches() {
  const res = await fetch(`${API_BASE}/reset-touches`, { method: 'POST' });
  return res.json();
}
