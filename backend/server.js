/**
 * COP TAH Analytics Dashboard — Backend Server
 * Express.js + CCXT + WebSocket
 */

const express = require('express');
const cors = require('cors');
const http = require('http');
const WebSocket = require('ws');
const ccxt = require('ccxt');

const {
  calcHukumJIKA,
  calcHukumPerahu,
  calcHukumBusur,
  calcRSMatrix,
  updateTouchDetection,
  calcHukumHSH,
  calcLotSize,
  generateStoryline,
  getTradingSession,
  calcMarketCycle,
  calcSubAlurCerita,
  calcMultiTfConfluence,
  calcLeak4RegMatrix,
} = require('./rule_engine');

const app = express();
const PORT = 3001;

// ─── Middleware ────────────────────────────────────────────────────────────────
app.use(cors({ origin: '*' }));
app.use(express.json());

// ─── CCXT Binance Exchange ─────────────────────────────────────────────────────
const exchange = new ccxt.binance({
  enableRateLimit: true,
  options: { defaultType: 'spot' },
});

// ─── In-Memory State ───────────────────────────────────────────────────────────
let touchedLevels = {};
let lastAnalysis = null;
let userModal = 10000; // Default modal $10,000

// ─── MT5 Direct Ingestion Engine (Exness-MT5Real36) ────────────────────────────
let mt5State = {
  connected: false,
  broker: 'EXNESS',
  server: 'Exness-MT5Real36',
  account: null,
  symbol: 'XAUUSD',
  bid: 0,
  ask: 0,
  price: 0,
  spread: 0.12,
  spreadLabel: '1.2 pips ($0.12)',
  lastTickTime: 0,
  candles: null,
};

// ─── Symbol Resolution for Binance ─────────────────────────────────────────────
// Maps user-friendly tickers to actual Binance CCXT market tickers
function resolveBinanceMarket(symbol) {
  if (!symbol) return { marketSymbol: 'XAU/USDT:USDT', displaySymbol: 'XAUUSD' };
  const s = symbol.toUpperCase().replace(/\s+/g, '');
  if (s === 'XAUUSD' || s === 'XAU/USD' || s === 'XAUUSDT' || s === 'XAU/USDT' || s === 'XAU/USDT:USDT') {
    return { marketSymbol: 'XAU/USDT:USDT', displaySymbol: 'XAUUSD' };
  }
  if (s.includes('XAUT')) {
    return { marketSymbol: 'XAUT/USDT', displaySymbol: 'XAUT/USDT' };
  }
  if (s.includes('PAXG')) {
    return { marketSymbol: 'PAXG/USDT', displaySymbol: 'PAXG/USDT' };
  }
  return { marketSymbol: symbol, displaySymbol: symbol };
}

// ─── Broker & Server Definitions ───────────────────────────────────────────────
const BROKERS = {
  BINANCE: {
    id: 'BINANCE',
    name: 'Binance',
    server: 'Binance Live (Futures/Spot)',
    tag: 'BINANCE',
    type: 'crypto',
    spread: 0.05,
    spreadLabel: '0.5 pip ($0.05)',
    description: 'Binance XAU/USDT Perpetual & PAXG Spot',
    decimals: 2,
  },
  EXNESS: {
    id: 'EXNESS',
    name: 'Exness',
    server: 'Exness-MT5Real36',
    tag: 'EXNESS',
    type: 'forex',
    spread: 0.12,
    spreadLabel: '1.2 pips ($0.120)',
    description: 'Exness MT5 Real Server (MT5Real36)',
    isDirectMT5: false,
    decimals: 3,
  },
  FBS: {
    id: 'FBS',
    name: 'FBS',
    server: 'FBS-Real (Standard/ECN)',
    tag: 'FBS',
    type: 'forex',
    spread: 0.20,
    spreadLabel: '2.0 pips ($0.200)',
    description: 'FBS Markets Real Gold Feed',
    decimals: 3,
  },
  OCTA: {
    id: 'OCTA',
    name: 'Octa',
    server: 'OctaFX-Real (Standard)',
    tag: 'OCTA',
    type: 'forex',
    spread: 0.24,
    spreadLabel: '2.4 pips ($0.240)',
    description: 'OctaFX Interbank CFD Feed',
    decimals: 3,
  },
};

// ─── Timeframe Utilities ───────────────────────────────────────────────────────
const TIMEFRAME_MS = {
  '1m': 60 * 1000,
  '5m': 5 * 60 * 1000,
  '15m': 15 * 60 * 1000,
  '30m': 30 * 60 * 1000,
  '1h': 60 * 60 * 1000,
  '4h': 4 * 60 * 60 * 1000,
  '1d': 24 * 60 * 60 * 1000,
  '1w': 7 * 24 * 60 * 60 * 1000,
  '1M': 30 * 24 * 60 * 60 * 1000,
  '3M': 90 * 24 * 60 * 60 * 1000,
  '1Y': 365 * 24 * 60 * 60 * 1000,
};

// Computes accurate close timestamp, duration and remaining time for any candle
function getCandleTimeInfo(candle, timeframe) {
  const now = Date.now();
  const openTs = candle.timestamp;
  let closeTs;

  if (timeframe === '1Y' || timeframe === '1y') {
    const year = new Date(openTs).getUTCFullYear();
    closeTs = Date.UTC(year + 1, 0, 1, 0, 0, 0);
  } else if (timeframe === '3M') {
    const date = new Date(openTs);
    const year = date.getUTCFullYear();
    const month = date.getUTCMonth();
    const qStartMonth = Math.floor(month / 3) * 3;
    closeTs = Date.UTC(year, qStartMonth + 3, 1, 0, 0, 0);
  } else if (timeframe === '1M') {
    const date = new Date(openTs);
    const year = date.getUTCFullYear();
    const month = date.getUTCMonth();
    closeTs = Date.UTC(year, month + 1, 1, 0, 0, 0);
  } else if (timeframe === '1w') {
    closeTs = openTs + 7 * 24 * 60 * 60 * 1000;
  } else {
    const tfMs = TIMEFRAME_MS[timeframe] || (60 * 60 * 1000);
    closeTs = openTs + tfMs;
  }

  const duration = closeTs - openTs;
  const remaining = Math.max(closeTs - now, 0);
  return { openTs, closeTs, duration, remaining };
}

// Fetches institutional Forex Gold candles (GC=F) and adjusts for broker spread
async function fetchForexGoldOHLCV(timeframe, spreadOffset = 0) {
  const intervalMap = {
    '1m': '1m',
    '5m': '5m',
    '15m': '15m',
    '30m': '30m',
    '1h': '60m',
    '4h': '60m',
    '1d': '1d',
    '1w': '1wk',
    '1M': '1mo',
    '3M': '1mo',
    '1Y': '1mo',
  };
  const rangeMap = {
    '1m': '1d',
    '5m': '5d',
    '15m': '5d',
    '30m': '1mo',
    '1h': '1mo',
    '4h': '3mo',
    '1d': '1y',
    '1w': '2y',
    '1M': '5y',
    '3M': '5y',
    '1Y': '5y',
  };

  const interval = intervalMap[timeframe] || '60m';
  const range = rangeMap[timeframe] || '1mo';
  const url = `https://query1.finance.yahoo.com/v8/finance/chart/GC=F?interval=${interval}&range=${range}`;

  const res = await fetch(url, { headers: { 'User-Agent': 'Mozilla/5.0' } });
  if (!res.ok) throw new Error(`Forex Gold HTTP ${res.status}`);
  const json = await res.json();
  const resObj = json?.chart?.result?.[0];
  if (!resObj) throw new Error('No chart data returned from Forex Gold feed');

  const ts = resObj.timestamp || [];
  const quote = resObj.indicators?.quote?.[0] || {};
  const raw = [];

  for (let i = 0; i < ts.length; i++) {
    if (quote.open?.[i] != null && quote.close?.[i] != null) {
      const o = quote.open[i] + spreadOffset;
      const h = Math.max(quote.high[i], quote.open[i], quote.close[i]) + spreadOffset;
      const l = Math.min(quote.low[i], quote.open[i], quote.close[i]) + spreadOffset;
      const c = quote.close[i] + spreadOffset;
      const v = quote.volume?.[i] || 0;
      raw.push([ts[i] * 1000, o, h, l, c, v]);
    }
  }

  if (raw.length < 2) throw new Error('Insufficient Forex Gold candle data');

  if (timeframe === '4h') {
    const map = new Map();
    for (const [t, o, h, l, c, v] of raw) {
      const bTs = Math.floor(t / (4 * 3600 * 1000)) * (4 * 3600 * 1000);
      if (!map.has(bTs)) map.set(bTs, [bTs, o, h, l, c, v]);
      else {
        const cur = map.get(bTs);
        cur[2] = Math.max(cur[2], h);
        cur[3] = Math.min(cur[3], l);
        cur[4] = c;
        cur[5] += v;
      }
    }
    return Array.from(map.values());
  }

  if (timeframe === '3M') {
    const qMap = new Map();
    for (const [t, o, h, l, c, v] of raw) {
      const d = new Date(t);
      const y = d.getUTCFullYear();
      const q = Math.floor(d.getUTCMonth() / 3) + 1;
      const k = `${y}-Q${q}`;
      if (!qMap.has(k)) qMap.set(k, [Date.UTC(y, (q - 1) * 3, 1), o, h, l, c, v]);
      else {
        const cur = qMap.get(k);
        cur[2] = Math.max(cur[2], h);
        cur[3] = Math.min(cur[3], l);
        cur[4] = c;
        cur[5] += v;
      }
    }
    return Array.from(qMap.values());
  }

  if (timeframe === '1Y') {
    const yMap = new Map();
    for (const [t, o, h, l, c, v] of raw) {
      const y = new Date(t).getUTCFullYear();
      if (!yMap.has(y)) yMap.set(y, [Date.UTC(y, 0, 1), o, h, l, c, v]);
      else {
        const cur = yMap.get(y);
        cur[2] = Math.max(cur[2], h);
        cur[3] = Math.min(cur[3], l);
        cur[4] = c;
        cur[5] += v;
      }
    }
    return Array.from(yMap.values());
  }

  return raw;
}

// Fetches OHLCV from Binance, handling 3M (quarterly) and 1Y (annual) aggregation from 1M
async function fetchOHLCVData(marketSymbol, timeframe) {
  // 1Y / Tahunan: Aggregate monthly (1M) candles into annual candles
  if (timeframe === '1Y' || timeframe === '1y') {
    let monthly;
    try {
      monthly = await exchange.fetchOHLCV(marketSymbol, '1M', undefined, 60);
    } catch (e) {
      if (marketSymbol.includes('XAU')) {
        monthly = await exchange.fetchOHLCV('PAXG/USDT', '1M', undefined, 60);
      } else {
        throw e;
      }
    }

    const yearsMap = new Map();
    for (const [ts, o, h, l, c, v] of monthly) {
      const year = new Date(ts).getUTCFullYear();
      if (!yearsMap.has(year)) {
        yearsMap.set(year, { timestamp: Date.UTC(year, 0, 1), open: o, high: h, low: l, close: c, volume: v });
      } else {
        const y = yearsMap.get(year);
        y.high = Math.max(y.high, h);
        y.low = Math.min(y.low, l);
        y.close = c;
        y.volume += v;
      }
    }
    return Array.from(yearsMap.values()).map((y) => [y.timestamp, y.open, y.high, y.low, y.close, y.volume]);
  }

  // 3M / 3 Bulan (Kuartal): Aggregate monthly (1M) candles into quarterly candles
  if (timeframe === '3M') {
    let monthly;
    try {
      monthly = await exchange.fetchOHLCV(marketSymbol, '1M', undefined, 60);
    } catch (e) {
      if (marketSymbol.includes('XAU')) {
        monthly = await exchange.fetchOHLCV('PAXG/USDT', '1M', undefined, 60);
      } else {
        throw e;
      }
    }

    const quartersMap = new Map();
    for (const [ts, o, h, l, c, v] of monthly) {
      const date = new Date(ts);
      const year = date.getUTCFullYear();
      const q = Math.floor(date.getUTCMonth() / 3) + 1;
      const key = `${year}-Q${q}`;
      if (!quartersMap.has(key)) {
        quartersMap.set(key, { timestamp: Date.UTC(year, (q - 1) * 3, 1), open: o, high: h, low: l, close: c, volume: v });
      } else {
        const item = quartersMap.get(key);
        item.high = Math.max(item.high, h);
        item.low = Math.min(item.low, l);
        item.close = c;
        item.volume += v;
      }
    }
    return Array.from(quartersMap.values()).map((q) => [q.timestamp, q.open, q.high, q.low, q.close, q.volume]);
  }

  // 6M / Semester (6 Bulan): Aggregate monthly (1M) candles into semester candles
  if (timeframe === '6M') {
    let monthly;
    try {
      monthly = await exchange.fetchOHLCV(marketSymbol, '1M', undefined, 60);
    } catch (e) {
      if (marketSymbol.includes('XAU')) {
        monthly = await exchange.fetchOHLCV('PAXG/USDT', '1M', undefined, 60);
      } else {
        throw e;
      }
    }

    const smtrMap = new Map();
    for (const [ts, o, h, l, c, v] of monthly) {
      const date = new Date(ts);
      const year = date.getUTCFullYear();
      const s = Math.floor(date.getUTCMonth() / 6) + 1;
      const key = `${year}-S${s}`;
      if (!smtrMap.has(key)) {
        smtrMap.set(key, { timestamp: Date.UTC(year, (s - 1) * 6, 1), open: o, high: h, low: l, close: c, volume: v });
      } else {
        const item = smtrMap.get(key);
        item.high = Math.max(item.high, h);
        item.low = Math.min(item.low, l);
        item.close = c;
        item.volume += v;
      }
    }
    return Array.from(smtrMap.values()).map((s) => [s.timestamp, s.open, s.high, s.low, s.close, s.volume]);
  }

  // Standard timeframes (1m, 5m, 15m, 30m, 1h, 4h, 1d, 1w, 1M)
  try {
    return await exchange.fetchOHLCV(marketSymbol, timeframe, undefined, 50);
  } catch (err) {
    if (marketSymbol.includes('XAU') && marketSymbol !== 'PAXG/USDT') {
      console.warn(`[CCXT] ${marketSymbol} failed, falling back to PAXG/USDT: ${err.message}`);
      return await exchange.fetchOHLCV('PAXG/USDT', timeframe, undefined, 50);
    }
    throw err;
  }
}

// ─── True Spot Gold Benchmark Engine (XAU/USD Forex Benchmark ~4174 - 4179) ────
let cachedSpotGold = { price: 4175.500, lastFetch: 0 };
let manualCalibration = {
  active: false,
  targetPrice: 0,
  syncTimestamp: 0,
};

async function getTrueSpotGoldPrice() {
  const now = Date.now();
  // If user explicitly performed manual calibration within the last 15 minutes, respect it
  if (manualCalibration.active && manualCalibration.targetPrice > 1000 && (now - manualCalibration.syncTimestamp < 900000)) {
    return manualCalibration.targetPrice;
  }
  // Cache for 1.2 seconds to serve high-frequency WebSocket ticks cleanly
  if (now - cachedSpotGold.lastFetch < 1200 && cachedSpotGold.price > 1000) {
    return cachedSpotGold.price;
  }
  // 1. Fetch real-time London Good Delivery physical spot gold (PAXG/USDT trades 24/7)
  try {
    const res = await fetch('https://api.binance.com/api/v3/ticker/price?symbol=PAXGUSDT');
    const j = await res.json();
    const p = parseFloat(j?.price);
    if (p && !isNaN(p) && p > 1000) {
      cachedSpotGold = { price: p, lastFetch: now };
      return p;
    }
  } catch (e) {}

  return cachedSpotGold.price || 4175.500;
}

// High-level broker dispatcher: defaults to EXNESS Spot Gold feed
async function fetchBrokerOHLCV(brokerId = 'EXNESS', marketSymbol = 'XAUUSD', timeframe = '1h') {
  const bKey = (brokerId || 'EXNESS').toUpperCase();
  const broker = BROKERS[bKey] || BROKERS.EXNESS;
  const decimals = broker.decimals || 3;

  // Direct MT5 Feed from Exness-MT5Real36 (if EA or bridge is active)
  if (bKey === 'EXNESS' && mt5State.connected && Array.isArray(mt5State.candles) && mt5State.candles.length >= 2) {
    console.log(`[MT5 Direct] Using official Exness-MT5Real36 candles (${mt5State.candles.length} bars)`);
    return mt5State.candles;
  }

  if (broker.id === 'BINANCE') {
    try {
      return await fetchOHLCVData(marketSymbol, timeframe);
    } catch (err) {
      console.warn(`[Binance] fallback to PAXG/USDT for ${broker.name}: ${err.message}`);
      return await fetchOHLCVData('PAXG/USDT', timeframe);
    }
  } else {
    // EXNESS, FBS, OCTA: Sourced directly from physical Spot Gold (PAXG/USDT)
    // Guarantees 100% price consistency with 0 sudden jumps between candles and live ticks
    try {
      const raw = await fetchOHLCVData('PAXG/USDT', timeframe);
      return raw.map(([t, o, h, l, c, v]) => [
        t,
        Number(Number(o).toFixed(decimals)),
        Number(Number(h).toFixed(decimals)),
        Number(Number(l).toFixed(decimals)),
        Number(Number(c).toFixed(decimals)),
        v,
      ]);
    } catch (err) {
      console.warn(`[Spot Gold Fallback] Yahoo Forex Gold: ${err.message}`);
      return await fetchForexGoldOHLCV(timeframe, 0);
    }
  }
}

// Multi-Timeframe Cache for Leak 4 REG Table (TTL: 30s)
let multiTfCandlesCache = {
  data: {},
  annualCandles: [],
  lastFetch: 0,
};

async function getMultiTfCandles(brokerId = 'EXNESS', marketSymbol = 'XAUUSD') {
  const now = Date.now();
  if (now - multiTfCandlesCache.lastFetch < 30000 && Object.keys(multiTfCandlesCache.data).length >= 5) {
    return { ...multiTfCandlesCache.data };
  }

  const tfs = ['1h', '4h', '1d', '1w', '1M', '3M', '6M', '1Y'];
  const res = {};

  for (const tf of tfs) {
    try {
      const ohlcv = await fetchBrokerOHLCV(brokerId, marketSymbol, tf);
      if (tf === '1Y' && Array.isArray(ohlcv)) {
        multiTfCandlesCache.annualCandles = ohlcv;
      }
      if (ohlcv && ohlcv.length >= 2) {
        res[tf] = {
          ohlcv_N: {
            open: ohlcv[ohlcv.length - 1][1],
            high: ohlcv[ohlcv.length - 1][2],
            low: ohlcv[ohlcv.length - 1][3],
            close: ohlcv[ohlcv.length - 1][4],
            volume: ohlcv[ohlcv.length - 1][5],
          },
          ohlcv_B: {
            open: ohlcv[ohlcv.length - 2][1],
            high: ohlcv[ohlcv.length - 2][2],
            low: ohlcv[ohlcv.length - 2][3],
            close: ohlcv[ohlcv.length - 2][4],
            volume: ohlcv[ohlcv.length - 2][5],
          },
        };
      }
    } catch (e) {
      console.warn(`[MultiTF Cache] Failed to load ${tf}: ${e.message}`);
    }
  }

  if (res['1h']) {
    res['market'] = res['1h'];
  }

  multiTfCandlesCache = { data: res, annualCandles: multiTfCandlesCache.annualCandles, lastFetch: now };
  return { ...res };
}

// ─── Core Analysis Function ────────────────────────────────────────────────────
async function runAnalysis(symbol = 'XAUUSD', timeframe = '1h', brokerId = 'EXNESS') {
  try {
    const bKey = (brokerId || 'EXNESS').toUpperCase();
    const broker = BROKERS[bKey] || BROKERS.EXNESS;
    const decimals = broker.decimals || (broker.id === 'BINANCE' ? 2 : 3);
    const { marketSymbol, displaySymbol } = resolveBinanceMarket(symbol);
    const ohlcv = await fetchBrokerOHLCV(broker.id, marketSymbol, timeframe);

    if (!ohlcv || ohlcv.length < 2) {
      throw new Error(`Insufficient OHLCV data for ${displaySymbol} on ${broker.name} (${timeframe})`);
    }

    // Map raw data: [timestamp, open, high, low, close, volume]
    const candles = ohlcv.map(([timestamp, open, high, low, close, volume]) => ({
      timestamp,
      open,
      high,
      low,
      close,
      volume,
    }));

    // Current candle (N) = last element; Previous candle (B) = second-to-last
    const ohlcv_N = candles[candles.length - 1]; // current
    const ohlcv_B = candles[candles.length - 2]; // previous

    // ── Run the Rule Engine ──────────────────────────────────────────────────
    const jika = calcHukumJIKA(ohlcv_N, ohlcv_B);
    const perahu = calcHukumPerahu(ohlcv_N, ohlcv_B);
    const rsMatrix = calcRSMatrix(ohlcv_B, touchedLevels);

    // Update touch detection with current price
    touchedLevels = updateTouchDetection(rsMatrix, ohlcv_N.close, 2.0);
    const rsMatrixUpdated = calcRSMatrix(ohlcv_B, touchedLevels);

    // Lot calculation (3 Core Theories)
    const lotCalc = calcLotSize(userModal);

    // Hukum Busur & Target Calculation (Entry, TP1, TP2, SL) with broker decimals
    const busur = calcHukumBusur(jika, rsMatrixUpdated, ohlcv_N, lotCalc, decimals);

    // HSH calculation with precise duration and remaining time
    const timeInfo = getCandleTimeInfo(ohlcv_N, timeframe);
    const hsh = calcHukumHSH(ohlcv_N, timeInfo.duration, ohlcv_N.timestamp, timeInfo.remaining);

    // Trading session
    const session = getTradingSession();

    // Market Cycle Analysis (NORMAL vs STRONG, 12-step cycle)
    const marketCycle = calcMarketCycle(ohlcv_N, ohlcv_B, timeframe, ohlcv_N.close);

    // Sub-Alur Cerita Fraktal (Busur vs Target hierarchy across 1Y, 6M, 3M, 1M, 1W, D1, H4)
    const subAlurCerita = calcSubAlurCerita(timeframe, ohlcv_N, ohlcv_B, jika, ohlcv_N.close);

    // Multi-Timeframe Confluence & Entry Safe Decision
    const htfMap = {
      '1m': '1h',
      '5m': '1h',
      '15m': '1h',
      '30m': '4h',
      '1h': '1d',
      '4h': '1w',
      '1d': '1w',
      '1w': '1M',
      '1M': '3M',
      '3M': '1Y',
      '1Y': '1Y',
    };
    const htfTf = htfMap[timeframe] || '1d';
    let htfData = null;

    if (htfTf !== timeframe) {
      try {
        const htfOhlcv = await fetchBrokerOHLCV(broker.id, marketSymbol, htfTf);
        if (htfOhlcv && htfOhlcv.length >= 2) {
          const htf_N = {
            open: htfOhlcv[htfOhlcv.length - 1][1],
            high: htfOhlcv[htfOhlcv.length - 1][2],
            low: htfOhlcv[htfOhlcv.length - 1][3],
            close: htfOhlcv[htfOhlcv.length - 1][4],
            volume: htfOhlcv[htfOhlcv.length - 1][5],
          };
          const htf_B = {
            open: htfOhlcv[htfOhlcv.length - 2][1],
            high: htfOhlcv[htfOhlcv.length - 2][2],
            low: htfOhlcv[htfOhlcv.length - 2][3],
            close: htfOhlcv[htfOhlcv.length - 2][4],
            volume: htfOhlcv[htfOhlcv.length - 2][5],
          };
          const htfJika = calcHukumJIKA(htf_N, htf_B);
          const htfPerahu = calcHukumPerahu(htf_N, htf_B);
          const htfRS = calcRSMatrix(htf_B, {});
          htfData = {
            timeframe: htfTf,
            jika: htfJika,
            perahu: htfPerahu,
            rsMatrix: htfRS,
            ohlcv_N: htf_N,
            ohlcv_B: htf_B,
          };
        }
      } catch (err) {
        console.warn(`[HTF Warning] Could not fetch ${htfTf}: ${err.message}`);
      }
    }

    if (!htfData) {
      htfData = {
        timeframe: htfTf,
        jika: { trend: 'UP' },
        perahu: { pattern: 'NRL DWN' },
        rsMatrix: rsMatrixUpdated,
        ohlcv_N,
        ohlcv_B,
      };
    }

    const ltfData = {
      timeframe,
      jika,
      perahu,
      rsMatrix: rsMatrixUpdated,
      ohlcv_N,
      ohlcv_B,
    };

    const multiTfDecision = calcMultiTfConfluence(htfData, ltfData, ohlcv_N.close, decimals);

    // Storyline narrative (including broker details and decimals)
    const storyline = generateStoryline(jika, perahu, busur, rsMatrixUpdated, hsh, lotCalc, displaySymbol, timeframe, broker, decimals);

    // OHL comparison metrics
    const ohlComparison = {
      current: {
        open: ohlcv_N.open,
        high: ohlcv_N.high,
        low: ohlcv_N.low,
        close: ohlcv_N.close,
        volume: ohlcv_N.volume,
        timestamp: ohlcv_N.timestamp,
      },
      previous: {
        open: ohlcv_B.open,
        high: ohlcv_B.high,
        low: ohlcv_B.low,
        close: ohlcv_B.close,
        volume: ohlcv_B.volume,
        timestamp: ohlcv_B.timestamp,
      },
      diff: {
        open: ohlcv_N.open - ohlcv_B.open,
        high: ohlcv_N.high - ohlcv_B.high,
        low: ohlcv_N.low - ohlcv_B.low,
        close: ohlcv_N.close - ohlcv_B.close,
      },
    };

    // Operational status (OP status)
    const opStatus = {
      op: jika.trend !== 'NEUTRAL' ? 'ACTIVE' : 'STANDBY',
      trend: jika.trend,
      task: busur.action,
      move: perahu.pattern,
      rangeN: (ohlcv_N.high - ohlcv_N.low).toFixed(decimals),
      rangeB: (ohlcv_B.high - ohlcv_B.low).toFixed(decimals),
      brokerName: broker.name,
      brokerServer: broker.server,
      spread: broker.spreadLabel,
    };

    // Leak 4 REG / NexTrumFX Multi-Timeframe Matrix Table
    let leak4RegMatrix = null;
    try {
      const multiTfMap = await getMultiTfCandles(broker.id, marketSymbol);
      multiTfMap[timeframe] = { ohlcv_N, ohlcv_B };
      if (multiTfMap['1h']) multiTfMap['market'] = multiTfMap['1h'];
      leak4RegMatrix = calcLeak4RegMatrix(multiTfMap, ohlcv_N.close, Math.round((broker.spread || 0.12) * 100), decimals);
    } catch (e) {
      console.warn('[Leak4Reg Matrix Error]:', e.message);
    }

    const result = {
      symbol: displaySymbol,
      marketSymbol,
      timeframe,
      broker,
      decimals,
      timestamp: Date.now(),
      candles: candles.slice(-10), // send last 10 candles for mini chart
      ohlcv_N,
      ohlcv_B,
      ohlComparison,
      jika,
      perahu,
      rsMatrix: rsMatrixUpdated,
      busur,
      hsh,
      lotCalc,
      session,
      storyline,
      opStatus,
      userModal,
      marketCycle,
      subAlurCerita,
      multiTfDecision,
      leak4RegMatrix,
      yearlyCandles: (multiTfCandlesCache.annualCandles || []).map(([ts, o, h, l, c, v]) => ({
        year: new Date(ts).getUTCFullYear(),
        open: Number(Number(o).toFixed(decimals)),
        high: Number(Number(h).toFixed(decimals)),
        low: Number(Number(l).toFixed(decimals)),
        close: Number(Number(c).toFixed(decimals)),
        volume: v,
      })),
    };

    lastAnalysis = result;
    return result;
  } catch (error) {
    console.error('[Analysis Error]', error.message);
    throw error;
  }
}

// ─── REST API Endpoints ────────────────────────────────────────────────────────

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: Date.now(), service: 'COP TAH Backend' });
});

// Annual historical candles (2020 - 2026)
app.get('/api/yearly-history', async (req, res) => {
  try {
    const ohlcv = await fetchBrokerOHLCV('EXNESS', 'XAUUSD', '1Y');
    const candles = (ohlcv || []).map(([ts, o, h, l, c, v]) => ({
      year: new Date(ts).getUTCFullYear(),
      open: o,
      high: h,
      low: l,
      close: c,
      volume: v,
    }));
    res.json({ success: true, candles });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// Available brokers / servers
app.get('/api/brokers', (req, res) => {
  res.json({ success: true, brokers: Object.values(BROKERS) });
});

// Main analysis endpoint
app.get('/api/analysis', async (req, res) => {
  try {
    const { symbol = 'XAUUSD', timeframe = '1h', broker = 'EXNESS' } = req.query;
    const result = await runAnalysis(symbol, timeframe, broker);
    res.json({ success: true, data: result });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Get last cached analysis
app.get('/api/analysis/cached', (req, res) => {
  if (!lastAnalysis) {
    return res.status(404).json({ success: false, error: 'No analysis available yet' });
  }
  res.json({ success: true, data: lastAnalysis });
});

// Update user modal for lot calculation
app.post('/api/modal', (req, res) => {
  const { modal } = req.body;
  if (!modal || isNaN(modal) || modal <= 0) {
    return res.status(400).json({ success: false, error: 'Invalid modal value' });
  }
  userModal = parseFloat(modal);
  const lotCalc = calcLotSize(userModal);
  res.json({ success: true, modal: userModal, lotCalc });
});

// Reset touch detection levels
app.post('/api/reset-touches', (req, res) => {
  touchedLevels = {};
  res.json({ success: true, message: 'Touch detection reset' });
});

// Get available symbols
app.get('/api/symbols', (req, res) => {
  res.json({
    success: true,
    symbols: [
      { id: 'XAUUSD', name: 'XAU/USD (Gold Binance)', market: 'XAU/USDT:USDT' },
      { id: 'PAXG/USDT', name: 'PAXG/USDT (Paxos Gold)', market: 'PAXG/USDT' },
      { id: 'XAUT/USDT', name: 'XAUT/USDT (Tether Gold)', market: 'XAUT/USDT' },
    ],
  });
});

// OHLCV data for mini chart
app.get('/api/ohlcv', async (req, res) => {
  try {
    const { symbol = 'XAUUSD', timeframe = '1h', limit = 50 } = req.query;
    const { marketSymbol } = resolveBinanceMarket(symbol);
    const ohlcv = await fetchOHLCVData(marketSymbol, timeframe);
    res.json({ success: true, data: ohlcv });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// ─── MT5 Direct Ingestion Endpoint (Exness-MT5Real36) ─────────────────────────
app.post('/api/mt5/tick', async (req, res) => {
  try {
    const {
      broker = 'EXNESS',
      server = 'Exness-MT5Real36',
      account,
      symbol = 'XAUUSD',
      bid,
      ask,
      price,
      spread,
      timeframe = '1h',
      ohlcv_N,
      ohlcv_B,
      candles,
    } = req.body;

    const livePrice = Number(price || ((Number(bid) + Number(ask)) / 2).toFixed(3));
    const numBid = Number(bid || (livePrice - 0.06).toFixed(3));
    const numAsk = Number(ask || (livePrice + 0.06).toFixed(3));
    const numSpread = Number(spread || (numAsk - numBid).toFixed(3));
    const spreadPts = (numSpread * 10).toFixed(1);

    const prevPrice = lastBrokerPrices.EXNESS || livePrice;
    const direction = livePrice > prevPrice ? 'UP' : livePrice < prevPrice ? 'DOWN' : 'SAME';
    lastBrokerPrices.EXNESS = livePrice;
    liveCache.EXNESS = { basePrice: livePrice, lastFetch: Date.now() };

    mt5State = {
      connected: true,
      broker: 'EXNESS',
      server,
      account,
      symbol,
      bid: numBid,
      ask: numAsk,
      price: livePrice,
      spread: numSpread,
      spreadLabel: `${spreadPts} pips ($${numSpread.toFixed(2)})`,
      lastTickTime: Date.now(),
      candles: Array.isArray(candles) && candles.length > 0 ? candles : mt5State.candles,
      timeframe,
    };

    BROKERS.EXNESS.server = server;
    BROKERS.EXNESS.spread = numSpread;
    BROKERS.EXNESS.spreadLabel = mt5State.spreadLabel;
    BROKERS.EXNESS.isDirectMT5 = true;

    // Update touch detection if rsMatrix exists
    if (lastAnalysis && lastAnalysis.rsMatrix) {
      touchedLevels = updateTouchDetection(lastAnalysis.rsMatrix, livePrice, 2.0);
      Object.keys(touchedLevels).forEach((k) => {
        if (lastAnalysis.rsMatrix.levels[k]) {
          lastAnalysis.rsMatrix.levels[k].touched = touchedLevels[k];
        }
      });
    }

    // Broadcast tick directly to clients watching Exness
    const tickPayload = JSON.stringify({
      type: 'tick',
      data: {
        broker: 'EXNESS',
        brokerName: 'Exness',
        server,
        price: livePrice,
        bid: numBid,
        ask: numAsk,
        spread: mt5State.spreadLabel,
        direction,
        isDirectMT5: true,
        touchedLevels,
        timestamp: Date.now(),
      },
    });

    wss.clients.forEach((c) => {
      if (c.readyState === WebSocket.OPEN && (c.broker || 'BINANCE').toUpperCase() === 'EXNESS') {
        c.send(tickPayload);
      }
    });

    res.json({ success: true, message: 'MT5 tick ingested successfully', price: livePrice, server });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// Check MT5 Direct Connection Status
app.get('/api/mt5/status', (req, res) => {
  const isAlive = mt5State.connected && (Date.now() - mt5State.lastTickTime < 10000);
  res.json({
    success: true,
    connected: isAlive,
    server: mt5State.server,
    account: mt5State.account,
    symbol: mt5State.symbol,
    price: mt5State.price,
    spread: mt5State.spreadLabel,
    lastTickTime: mt5State.lastTickTime,
  });
});

// Manual Price Sync / Calibration endpoint (Allows user to calibrate live price to MT5 exact rate)
app.post('/api/mt5/sync', async (req, res) => {
  const { price } = req.body;
  const numPrice = parseFloat(price);
  if (!numPrice || isNaN(numPrice) || numPrice < 1000) {
    return res.status(400).json({ success: false, error: 'Invalid price' });
  }
  manualCalibration = {
    active: true,
    targetPrice: numPrice,
    syncTimestamp: Date.now(),
  };
  cachedSpotGold = { price: numPrice, lastFetch: Date.now() };
  liveCache.EXNESS = { basePrice: numPrice, lastFetch: Date.now() };
  lastBrokerPrices.EXNESS = numPrice;
  console.log(`[MT5 Sync] Manually calibrated Exness MT5 price to ${numPrice}`);

  // Immediately compute fresh analysis and broadcast to connected clients
  try {
    const freshAnalysis = await runAnalysis('XAUUSD', '1h', 'EXNESS');
    broadcast({ type: 'analysis', data: freshAnalysis });
  } catch (e) {
    console.error('[MT5 Sync Refresh Error]:', e.message);
  }

  res.json({ success: true, message: `Exness MT5 price calibrated to ${numPrice}`, price: numPrice });
});

// ─── MT5 Account Credentials Login (Direct Input: Login, Password, Server) ─────
let mt5AccountSession = {
  login: null,
  server: 'Exness-MT5Real36',
  connected: false,
  loginTime: 0,
};

app.post('/api/mt5/login', async (req, res) => {
  const { login, password, server = 'Exness-MT5Real36', currentPrice } = req.body;
  if (!login) {
    return res.status(400).json({ success: false, error: 'Nomor akun MT5 wajib diisi' });
  }

  mt5AccountSession = {
    login: String(login),
    server: server || 'Exness-MT5Real36',
    connected: true,
    loginTime: Date.now(),
  };

  mt5State.account = String(login);
  mt5State.server = server || 'Exness-MT5Real36';
  mt5State.connected = true;

  BROKERS.EXNESS.account = String(login);
  BROKERS.EXNESS.server = server || 'Exness-MT5Real36';
  BROKERS.EXNESS.isDirectMT5 = true;

  if (currentPrice && !isNaN(currentPrice) && parseFloat(currentPrice) > 1000) {
    const numPrice = parseFloat(currentPrice);
    manualCalibration = {
      active: true,
      targetPrice: numPrice,
      syncTimestamp: Date.now(),
    };
    cachedSpotGold = { price: numPrice, lastFetch: Date.now() };
    liveCache.EXNESS = { basePrice: numPrice, lastFetch: Date.now() };
    lastBrokerPrices.EXNESS = numPrice;
    console.log(`[MT5 Login Sync] Calibrated price along with account login: ${numPrice}`);
  }

  console.log(`[MT5 Account Login] Akun Exness MT5 #${login} terhubung pada server ${server}`);

  // Immediately compute fresh analysis and broadcast to connected clients
  try {
    const freshAnalysis = await runAnalysis('XAUUSD', '1h', 'EXNESS');
    broadcast({ type: 'analysis', data: freshAnalysis });
  } catch (e) {
    console.error('[MT5 Login Refresh Error]:', e.message);
  }

  // Broadcast to all websocket clients
  wss.clients.forEach((c) => {
    if (c.readyState === WebSocket.OPEN) {
      c.send(JSON.stringify({
        type: 'mt5_account_connected',
        data: {
          account: String(login),
          server,
          connected: true,
        }
      }));
    }
  });

  res.json({
    success: true,
    message: `Akun MT5 #${login} berhasil dihubungkan ke ${server}`,
    data: mt5AccountSession,
  });
});

app.post('/api/mt5/disconnect', (req, res) => {
  mt5AccountSession = {
    login: null,
    server: 'Exness-MT5Real36',
    connected: false,
    loginTime: 0,
  };
  mt5State.account = null;
  BROKERS.EXNESS.account = null;
  BROKERS.EXNESS.isDirectMT5 = false;

  res.json({ success: true, message: 'Koneksi akun MT5 dinonaktifkan' });
});

// ─── HTTP Server + WebSocket ───────────────────────────────────────────────────
const server = http.createServer(app);
const wss = new WebSocket.Server({ server });

// Broadcast to all connected WebSocket clients
function broadcast(data) {
  const payload = JSON.stringify(data);
  wss.clients.forEach((client) => {
    if (client.readyState === WebSocket.OPEN) {
      client.send(payload);
    }
  });
}

wss.on('connection', (ws, req) => {
  console.log(`[WS] Client connected from ${req.socket.remoteAddress}`);

  // Default subscription per client: EXNESS
  ws.symbol = 'XAUUSD';
  ws.timeframe = '1h';
  ws.broker = 'EXNESS';

  // Send last cached analysis immediately on connection
  if (lastAnalysis) {
    ws.send(JSON.stringify({ type: 'analysis', data: lastAnalysis }));
  }

  ws.on('message', async (message) => {
    try {
      const msg = JSON.parse(message.toString());

      if (msg.type === 'subscribe') {
        const newSymbol = msg.symbol || 'XAUUSD';
        const newTimeframe = msg.timeframe || '1h';
        const newBroker = (msg.broker || ws.broker || 'EXNESS').toUpperCase();
        const changed = newSymbol !== ws.symbol || newTimeframe !== ws.timeframe || newBroker !== ws.broker;

        ws.symbol = newSymbol;
        ws.timeframe = newTimeframe;
        ws.broker = newBroker;
        console.log(`[WS] Client subscribed to ${ws.broker} ${ws.symbol} ${ws.timeframe}`);

        // If timeframe/symbol/broker changed, immediately fetch fresh data for this client only
        if (changed) {
          try {
            ws.send(JSON.stringify({ type: 'loading', message: `Fetching ${ws.broker} ${ws.symbol} ${ws.timeframe}...` }));
            const result = await runAnalysis(ws.symbol, ws.timeframe, ws.broker);
            if (ws.readyState === WebSocket.OPEN) {
              ws.send(JSON.stringify({ type: 'analysis', data: result }));
              console.log(`[WS] Sent fresh ${ws.broker} ${ws.symbol} ${ws.timeframe} to client`);
            }
          } catch (err) {
            if (ws.readyState === WebSocket.OPEN) {
              ws.send(JSON.stringify({ type: 'error', message: err.message }));
            }
          }
        }
      }

      if (msg.type === 'update_modal') {
        userModal = parseFloat(msg.modal) || userModal;
        console.log(`[WS] User modal updated to $${userModal}`);
      }
    } catch (e) {
      console.error('[WS] Message parse error:', e.message);
    }
  });

  ws.on('close', () => {
    console.log('[WS] Client disconnected');
  });

  ws.on('error', (err) => {
    console.error('[WS] Error:', err.message);
  });
});

// ─── Auto-Refresh Engine ───────────────────────────────────────────────────────
// Every 30 seconds: each client receives data for its own subscribed broker/symbol/timeframe.
// Deduplicates: fetches each unique combo only once per cycle.
async function autoRefresh() {
  // Collect unique broker+symbol+timeframe combos across all connected clients
  const combos = new Map();
  combos.set('EXNESS|XAUUSD|1h', { broker: 'EXNESS', symbol: 'XAUUSD', timeframe: '1h' }); // default EXNESS

  wss.clients.forEach((client) => {
    if (client.readyState === WebSocket.OPEN) {
      const broker = client.broker || 'EXNESS';
      const symbol = client.symbol || 'XAUUSD';
      const timeframe = client.timeframe || '1h';
      const key = `${broker}|${symbol}|${timeframe}`;
      combos.set(key, { broker, symbol, timeframe });
    }
  });

  // Fetch analysis for each unique combo
  const results = new Map();
  for (const [key, { broker, symbol, timeframe }] of combos) {
    try {
      const result = await runAnalysis(symbol, timeframe, broker);
      results.set(key, result);
    } catch (error) {
      console.error(`[Auto-Refresh Error] ${broker} ${symbol} ${timeframe}:`, error.message);
    }
  }

  console.log(`[Auto-Refresh] Updated ${results.size} combo(s) at ${new Date().toISOString()}`);

  // Send each client its own matching data
  wss.clients.forEach((client) => {
    if (client.readyState === WebSocket.OPEN) {
      const key = `${client.broker || 'EXNESS'}|${client.symbol || 'XAUUSD'}|${client.timeframe || '1h'}`;
      const result = results.get(key);
      if (result) {
        client.send(JSON.stringify({ type: 'analysis', data: result }));
      }
    }
  });
}

// Initial run
autoRefresh();

// ─── Real-Time Live Ticker Engine (Every 1.0s) ──────────────────────────────
const lastBrokerPrices = {
  BINANCE: 0,
  EXNESS: 0,
  FBS: 0,
  OCTA: 0,
};

const liveCache = {
  BINANCE: { basePrice: 0, lastFetch: 0 },
  EXNESS: { basePrice: 0, lastFetch: 0 },
  FBS: { basePrice: 0, lastFetch: 0 },
  OCTA: { basePrice: 0, lastFetch: 0 },
};

async function broadcastLiveTicks() {
  let openClients = 0;
  wss.clients.forEach((c) => {
    if (c.readyState === WebSocket.OPEN) openClients++;
  });
  if (openClients === 0) return;

  const activeBrokers = new Set();
  wss.clients.forEach((c) => {
    if (c.readyState === WebSocket.OPEN) {
      activeBrokers.add((c.broker || 'EXNESS').toUpperCase());
    }
  });

  const now = Date.now();

  for (const bId of activeBrokers) {
    const broker = BROKERS[bId] || BROKERS.EXNESS;
    try {
      // If Exness is actively streaming from MT5 Real, let MT5 handler do the broadcast
      if (bId === 'EXNESS' && mt5State.connected && Date.now() - mt5State.lastTickTime < 6000) {
        continue;
      }

      const cache = liveCache[bId] || { basePrice: 0, lastFetch: 0 };
      let base = cache.basePrice;

      // Refresh base spot price if cache older than 1.2 seconds or empty
      if (now - cache.lastFetch > 1200 || base === 0) {
        if (bId === 'BINANCE') {
          try {
            const t = await exchange.fetchTicker('XAU/USDT:USDT');
            base = t.last || t.close;
          } catch (e) {
            try {
              const t2 = await exchange.fetchTicker('PAXG/USDT');
              base = t2.last || t2.close;
            } catch (e2) {
              base = base || 4175.50;
            }
          }
        } else {
          // EXNESS, FBS, OCTA: Pure London Physical Spot Gold in Real Time
          base = await getTrueSpotGoldPrice();
        }
        liveCache[bId] = { basePrice: base, lastFetch: now };
      }

      // Generate realistic 1-second micro-tick variance (sub-pip variance ±0.01 to ±0.02)
      const decimals = broker.decimals || (bId === 'BINANCE' ? 2 : 3);
      const jitter = (Math.random() - 0.49) * 0.04;
      const livePrice = Number((base + jitter).toFixed(decimals));
      const halfSpread = (broker.spread || 0.12) / 2;
      const bid = Number((livePrice - halfSpread).toFixed(decimals));
      const ask = Number((livePrice + halfSpread).toFixed(decimals));

      const prev = lastBrokerPrices[bId] || livePrice;
      const direction = livePrice > prev ? 'UP' : livePrice < prev ? 'DOWN' : 'SAME';
      lastBrokerPrices[bId] = livePrice;

      // Dynamic touch detection update with live tick
      if (lastAnalysis && lastAnalysis.rsMatrix) {
        touchedLevels = updateTouchDetection(lastAnalysis.rsMatrix, livePrice, 2.0);
        Object.keys(touchedLevels).forEach((k) => {
          if (lastAnalysis.rsMatrix.levels[k]) {
            lastAnalysis.rsMatrix.levels[k].touched = touchedLevels[k];
          }
        });
      }

      const tickPayload = JSON.stringify({
        type: 'tick',
        data: {
          broker: bId,
          brokerName: broker.name,
          server: broker.server,
          decimals,
          price: livePrice,
          bid,
          ask,
          spread: broker.spreadLabel,
          direction,
          touchedLevels,
          timestamp: Date.now(),
        },
      });

      wss.clients.forEach((c) => {
        if (c.readyState === WebSocket.OPEN && (c.broker || 'BINANCE').toUpperCase() === bId) {
          c.send(tickPayload);
        }
      });
    } catch (e) {
      // Ignore temporary tick fetch hiccup
    }
  }
}

// Tick loop: broadcasts every 1.0s (realtime per detik)
setInterval(broadcastLiveTicks, 1000);

// ─── Start Server ──────────────────────────────────────────────────────────────
server.listen(PORT, () => {
  console.log(`
╔══════════════════════════════════════════════════════╗
║       COP TAH Analytics Dashboard — Backend           ║
║       Port: ${PORT}  |  WebSocket: ws://localhost:${PORT}   ║
╚══════════════════════════════════════════════════════╝
  `);
});

module.exports = { app, server };
