/**
 * useAnalysis — Fetches analysis from REST API with polling fallback
 */
import { useState, useEffect, useCallback } from 'react';

const API_BASE = 'http://localhost:3001/api';

export function useAnalysis(symbol = 'XAUUSD', timeframe = '1h', broker = 'BINANCE', pollInterval = 30000) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [lastUpdated, setLastUpdated] = useState(null);

  const fetchAnalysis = useCallback(async () => {
    try {
      const params = new URLSearchParams({ symbol, timeframe, broker });
      const res = await fetch(`${API_BASE}/analysis?${params}`);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const json = await res.json();
      if (json.success) {
        setData(json.data);
        setLastUpdated(new Date());
        setError(null);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [symbol, timeframe, broker]);

  useEffect(() => {
    fetchAnalysis();
    const interval = setInterval(fetchAnalysis, pollInterval);
    return () => clearInterval(interval);
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
