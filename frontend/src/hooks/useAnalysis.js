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

  const requestRef = useRef(null);
  const fetchAnalysis = useCallback(async () => {
    requestRef.current?.abort();
    const controller = new AbortController();
    requestRef.current = controller;
    let directMode=false;
    const timeout = setTimeout(() => controller.abort('timeout'), 12000);
    try {
      if(broker==='TWELVE'){clearTimeout(timeout);const result=await browserBinanceAnalysis('XAUUSD',timeframe,controller.signal,'TWELVE');if(!controller.signal.aborted){setData(result);setLastUpdated(new Date());setError(null);return result;}}
      const params = new URLSearchParams({ symbol, timeframe, broker });
      const res = await fetch(`${API_BASE}/analysis?${params}`, { signal: controller.signal });
      if (res.status === 404) throw new Error('Server analisis belum tersedia pada alamat aplikasi ini (API 404).');
      if (!res.ok) throw new Error(`Server analisis tidak dapat diakses (HTTP ${res.status}).`);
      if (!res.headers.get('content-type')?.includes('application/json')) throw new Error('Alamat data mengembalikan halaman web, bukan server analisis.');
      const json = await res.json();
      if (!json.success) throw new Error(json.error || 'Analisis gagal');
      if (!controller.signal.aborted) {
        setData(json.data);
        setLastUpdated(new Date());
        setError(null);
        return json.data;
      }
    } catch (err) {
      clearTimeout(timeout);
      if(broker==='TWELVE'||(broker==='EXNESS'&&symbol==='BTCUSD')){if(!controller.signal.aborted)setError(err.message);return;}
      if (!controller.signal.aborted || controller.signal.reason === 'timeout') {
        const fallbackController=new AbortController();
        requestRef.current=fallbackController;directMode=true;
        try {
          const fallback=await browserBinanceAnalysis(broker==='BINANCE'?symbol:'XAUUSD',timeframe,fallbackController.signal,broker==='BINANCE'?'BINANCE':'TWELVE');
          if(!fallbackController.signal.aborted){setData(fallback);setLastUpdated(new Date());setError(null);return fallback;}
        } catch(failure) {if(!fallbackController.signal.aborted)setError(`Server utama: ${err.message} Fallback: ${failure.message}`);}
        finally {if(!fallbackController.signal.aborted)setLoading(false);}
      }
    } finally {
      clearTimeout(timeout);
      if (!directMode && (!controller.signal.aborted || controller.signal.reason === 'timeout')) setLoading(false);
    }
  }, [symbol, timeframe, broker]);

  useEffect(() => {
    setData(null);
    setLoading(true);
    fetchAnalysis();
    const interval = setInterval(fetchAnalysis, pollInterval);
    return () => { clearInterval(interval); requestRef.current?.abort(); };
  }, [fetchAnalysis, pollInterval]);

  return { data, loading, error, lastUpdated, refetch: fetchAnalysis };
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
