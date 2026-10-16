/**
 * useWebSocket — Custom React hook for live data connection to COP TAH backend
 */
import { useState, useEffect, useRef, useCallback } from 'react';

const WS_URL = 'ws://localhost:3001';
const RECONNECT_DELAY = 3000;
const MAX_RECONNECT = 10;

export function useWebSocket() {
  const [data, setData] = useState(null);
  const [liveTick, setLiveTick] = useState(null);
  const [status, setStatus] = useState('connecting'); // connecting | connected | disconnected | error
  const [error, setError] = useState(null);
  const [reconnectCount, setReconnectCount] = useState(0);
  const [isLoading, setIsLoading] = useState(false);

  const wsRef = useRef(null);
  const reconnectTimer = useRef(null);
  const reconnectCountRef = useRef(0);

  const connect = useCallback(() => {
    if (wsRef.current?.readyState === WebSocket.OPEN) return;

    setStatus('connecting');
    const ws = new WebSocket(WS_URL);
    wsRef.current = ws;

    ws.onopen = () => {
      setStatus('connected');
      setError(null);
      setReconnectCount(0);
      reconnectCountRef.current = 0;

      // Subscribe to default symbol: EXNESS XAUUSD
      ws.send(JSON.stringify({ type: 'subscribe', symbol: 'XAUUSD', timeframe: '1h', broker: 'EXNESS' }));
    };

    ws.onmessage = (event) => {
      try {
        const msg = JSON.parse(event.data);
        if (msg.type === 'analysis' && msg.data) {
          setData(msg.data);
          setIsLoading(false);
        }
        if (msg.type === 'tick' && msg.data) {
          setLiveTick(msg.data);
        }
        if (msg.type === 'loading') {
          // Backend is fetching data for a new timeframe/symbol
          setIsLoading(true);
        }
        if (msg.type === 'error') {
          setIsLoading(false);
          setError(msg.message);
        }
      } catch (e) {
        console.error('[WS] Parse error:', e);
      }
    };

    ws.onclose = () => {
      setStatus('disconnected');
      wsRef.current = null;

      if (reconnectCountRef.current < MAX_RECONNECT) {
        reconnectCountRef.current++;
        setReconnectCount(reconnectCountRef.current);
        reconnectTimer.current = setTimeout(connect, RECONNECT_DELAY);
      }
    };

    ws.onerror = (err) => {
      setStatus('error');
      setError('WebSocket connection failed');
    };
  }, []);

  useEffect(() => {
    connect();
    return () => {
      clearTimeout(reconnectTimer.current);
      wsRef.current?.close();
    };
  }, [connect]);

  const sendMessage = useCallback((msg) => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify(msg));
    }
  }, []);

  // Clear stale data when switching timeframe so old data doesn't show
  const clearData = useCallback(() => {
    setData(null);
    setIsLoading(true);
  }, []);

  return { data, liveTick, status, error, reconnectCount, isLoading, sendMessage, clearData };
}
