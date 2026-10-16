/**
 * useAnalysis — Fetches analysis from REST API with polling fallback
 */
import { useState, useEffect, useCallback, useRef } from 'react';

import { API_BASE } from '../config';

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
    const timeout = setTimeout(() => controller.abort('timeout'), 12000);
    try {
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
      if (controller.signal.reason === 'timeout') setError('Server analisis tidak merespons dalam 12 detik.');
      else if (!controller.signal.aborted) setError(err.message);
    } finally {
      clearTimeout(timeout);
      if (!controller.signal.aborted || controller.signal.reason === 'timeout') setLoading(false);
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
