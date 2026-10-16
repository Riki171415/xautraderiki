import { useState, useEffect, useRef, useCallback } from 'react';
import { WS_URL } from '../config';

export function useWebSocket() {
  const [data, setData] = useState(null);
  const [liveTick, setLiveTick] = useState(null);
  const [status, setStatus] = useState('connecting');
  const [error, setError] = useState(null);
  const [reconnectCount, setReconnectCount] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const wsRef = useRef(null);
  const subscription = useRef({ type: 'subscribe', symbol: 'XAUUSD', timeframe: '1h', broker: 'EXNESS' });
  useEffect(() => {
    let disposed = false, timer, attempts = 0;
    function connect() {
      if (disposed) return;
      setStatus('connecting');
      const ws = new WebSocket(WS_URL);
      wsRef.current = ws;
      ws.onopen = () => {
        if (disposed) return ws.close();
        attempts = 0;
        setReconnectCount(0);
        setStatus('connected');
        setError(null);
        ws.send(JSON.stringify(subscription.current));
      };
      ws.onmessage = ({ data: raw }) => {
        if (disposed) return;
        try {
          const msg = JSON.parse(raw), selected = subscription.current;
          if (msg.type === 'analysis' && msg.data?.symbol === selected.symbol && msg.data?.timeframe === selected.timeframe && msg.data?.broker?.id === selected.broker) {
            setData(msg.data); setIsLoading(false); setError(null);
          }
          if (msg.type === 'tick' && msg.data?.broker === selected.broker && msg.data?.symbol === selected.symbol) setLiveTick(msg.data);
          if (msg.type === 'loading') setIsLoading(true);
          if (msg.type === 'error') { setError(msg.message); setIsLoading(false); }
        } catch { setError('Pesan data tidak valid'); }
      };
      ws.onerror = () => { if (!disposed) setError('Koneksi data terganggu'); };
      ws.onclose = () => {
        if (disposed) return;
        setStatus('disconnected');
        setReconnectCount(++attempts);
        timer = setTimeout(connect, Math.min(30000, 1000 * 2 ** Math.min(attempts, 5)));
      };
    }
    connect();
    return () => { disposed = true; clearTimeout(timer); wsRef.current?.close(); };
  }, []);
  const sendMessage = useCallback((msg) => {
    if (msg.type === 'subscribe') {
      subscription.current = msg;
      setLiveTick(null);
      setData(null);
      setIsLoading(true);
    }
    if (wsRef.current?.readyState === WebSocket.OPEN) wsRef.current.send(JSON.stringify(msg));
  }, []);
  const clearData = useCallback(() => { setData(null); setIsLoading(true); }, []);
  return { data, liveTick, status, error, reconnectCount, isLoading, sendMessage, clearData };
}
