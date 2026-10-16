/**
 * COP TAH Analytics Dashboard — Backend Server
 * Express.js + CCXT + WebSocket
 */

const express = require('express');
const cors = require('cors');
const http = require('http');
const path = require('path');
const { buildH4Compass } = require('./h4_compass');
const { buildMarketEntry } = require('./market_entry');
const {observePlan,alternativeEntries}=require('./plan_monitor');
const { DIRECT_TIMEFRAMES, validCandles, getExnessCandles, aggregateMonths, aggregateDecades } = require('./mt5_data');
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

const {
  loadOrBuildHistoricalDataset,
  getHistoricalCandles,
  exportHistoricalCsv,
} = require('./historical_data');

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
  timeframes: {},
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

  if (timeframe === '10Y') {
    closeTs = Date.UTC(new Date(openTs).getUTCFullYear() + 10, 0, 1);
  } else if (timeframe === '1Y' || timeframe === '1y') {
    const year = new Date(openTs).getUTCFullYear();
    closeTs = Date.UTC(year + 1, 0, 1, 0, 0, 0);
  } else if (timeframe === '3M') {
    const date = new Date(openTs);
    const year = date.getUTCFullYear();
    const month = date.getUTCMonth();
    const qStartMonth = Math.floor(month / 3) * 3;
    closeTs = Date.UTC(year, qStartMonth + 3, 1, 0, 0, 0);
  } else if (timeframe === '6M') {
    const date = new Date(openTs);
    closeTs = Date.UTC(date.getUTCFullYear(), Math.floor(date.getUTCMonth() / 6) * 6 + 6, 1);
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
  if (!['PAXG/USDT','XAUT/USDT'].includes(marketSymbol)) throw new Error('Binance Spot: pilih PAXG/USDT atau XAUT/USDT. XAUUSD adalah instrumen Exness.');
  const months={'3M':3,'6M':6,'1Y':12,'10Y':120}[timeframe];
  const rows=await exchange.fetchOHLCV(marketSymbol,months?'1M':timeframe,undefined,months?240:50);
  if(!validCandles(rows)) throw new Error('Binance mengirim candle tidak valid atau riwayat belum cukup.');
  const result=timeframe==='10Y'?aggregateDecades(rows,false):months?aggregateMonths(rows,months):rows;
  if(result.length<2) throw new Error(`Riwayat ${marketSymbol} ${timeframe} belum cukup. Tidak mengganti instrumen.`);
  return result;
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
  const broker = BROKERS[bKey];
  if (!broker) throw new Error('Broker tidak didukung. Pilih EXNESS atau BINANCE.');
  const decimals = broker.decimals || 3;

  if (bKey === 'EXNESS') return getExnessCandles(mt5State, timeframe);

  if (broker.id === 'BINANCE') return fetchOHLCVData(marketSymbol,timeframe);
}

// Aggregate London Market Session (07:00–16:00 UTC / 14:00–23:00 WIB)
// Candle N represents active/latest London session candles
// Candle B represents previous session (e.g. yesterday's London session or earlier session)
// Multi-Timeframe Cache for Leak 4 REG Table (TTL: 30s)
let multiTfCandlesCache = {
  data: {},
  annualCandles: [],
  lastFetch: 0,
};

async function getMultiTfCandles(brokerId = 'EXNESS', marketSymbol = 'XAUUSD') {
  const now = Date.now();
  if (multiTfCandlesCache.key === `${brokerId}|${marketSymbol}` && now - multiTfCandlesCache.lastFetch < 5000 && Object.keys(multiTfCandlesCache.data).length >= 8) {
    return { ...multiTfCandlesCache.data };
  }

  const tfs = ['1m', '5m', '15m', '30m', '1h', '4h', '1d', '1w', '1M', '3M', '6M', '1Y', '10Y'];
  const res = {};
  let ohlcv1hRaw = null;
  let annualCandles = [];

  for (const tf of tfs) {
    try {
      const ohlcv = await fetchBrokerOHLCV(brokerId, marketSymbol, tf);
      if (tf === '1h') ohlcv1hRaw = ohlcv;
      if (tf === '1Y' && Array.isArray(ohlcv)) {
        annualCandles = ohlcv;
      }
      if (ohlcv && ohlcv.length >= 2) {
        res[tf] = {
          ...(tf === '10Y' && brokerId === 'EXNESS' ? (() => {
            const year=new Date(ohlcv.at(-1)[0]).getUTCFullYear()-10;
            const historical=require('./data/historical_xauusd.json').candles.find(c=>c.date===`${year}-01`);
            return historical && Number.isFinite(historical.open) && historical.open>0 && [historical.high,historical.low,historical.close].every(Number.isFinite) && historical.low<=Math.min(historical.open,historical.close) && historical.high>=Math.max(historical.open,historical.close) ? {
              referenceOpenB:historical.open,referenceOpenBTime:Date.UTC(year,0,1),
              referenceOpenBSource:'Arsip historis lokal · sumber campuran, belum diverifikasi Exness',
            }:{};
          })() : {}),
          partialBefore: tf === '10Y' && (new Date(ohlcv[ohlcv.length-2][0]).getUTCFullYear() % 10 !== 1 || new Date(ohlcv[ohlcv.length-2][0]).getUTCMonth() !== 0),
          beforeSourceTime: ohlcv[ohlcv.length-2][0],
          ohlcv_N: {
            open: ohlcv[ohlcv.length - 1][1],
            high: ohlcv[ohlcv.length - 1][2],
            low: ohlcv[ohlcv.length - 1][3],
            close: ohlcv[ohlcv.length - 1][4],
            volume: ohlcv[ohlcv.length - 1][5],
            timestamp: ohlcv[ohlcv.length - 1][0],
          },
          ohlcv_B: {
            open: ohlcv[ohlcv.length - 2][1],
            high: ohlcv[ohlcv.length - 2][2],
            low: ohlcv[ohlcv.length - 2][3],
            close: ohlcv[ohlcv.length - 2][4],
            volume: ohlcv[ohlcv.length - 2][5],
            timestamp: ohlcv[ohlcv.length - 2][0],
          },
        };
      }
    } catch (e) {
      console.warn(`[MultiTF Cache] Failed to load ${tf}: ${e.message}`);
    }
  }

  // Aggregate London market session
  const marketSession = require('./market_cycle').aggregateActiveMarket(ohlcv1hRaw || []);
  if (marketSession) {
    res['market'] = marketSession;
  }

  for(const [tf,pair] of Object.entries(res)) {
    if(tf!=='market') pair.ohlcv_N.periodEnd=getCandleTimeInfo(pair.ohlcv_N,tf).closeTs;
  }
  multiTfCandlesCache = { key: `${brokerId}|${marketSymbol}`, data: res, annualCandles, lastFetch: now };
  return { ...res };
}

// ─── Entry Recommendations for 5m, 15m, 30m, 1h, 4h, 1d with COP TAH Warnings ───
function generateEntryRecommendations(multiTfMap, currentPrice, userModal = 10000, decimals = 3) {
  const lotCalc = calcLotSize(userModal);
  const targetTfs = [
    { tf: '5m', name: '5 Menit', style: 'Scalping Kilat', category: 'Mikro Intraday' },
    { tf: '15m', name: '15 Menit', style: 'Intraday Momentum', category: 'Eksekusi Cepat' },
    { tf: '30m', name: '30 Menit', style: 'Pivot Sesi London/NY', category: 'Transisi Sesi' },
    { tf: '1h', name: '1 Jam', style: 'Tulang Punggung Harian', category: 'Intraday Standar' },
    { tf: '4h', name: '4 Jam', style: 'Swing Sesi Mayor', category: 'Swing Sesi' },
    { tf: '1d', name: 'Harian (1D)', style: 'Trend Utama (Filter King)', category: 'Makro Harian' },
  ];

  const dailyHtf = multiTfMap['1d'];
  const dailyJika = dailyHtf ? calcHukumJIKA(dailyHtf.ohlcv_N, dailyHtf.ohlcv_B) : { trend: 'UNAVAILABLE' };

  return targetTfs.map(({ tf, name, style, category }) => {
    const candleData = multiTfMap[tf];
    if (!candleData || !candleData.ohlcv_N || !candleData.ohlcv_B) {
      return null;
    }

    const { ohlcv_N, ohlcv_B } = candleData;
    const jika = calcHukumJIKA(ohlcv_N, ohlcv_B);
    const perahu = calcHukumPerahu(ohlcv_N, ohlcv_B);
    const rs = calcRSMatrix(ohlcv_B, {});
    const busur = calcHukumBusur(jika, rs, ohlcv_N, lotCalc, decimals);
    const timeInfo = getCandleTimeInfo(ohlcv_N, tf);
    const hsh = calcHukumHSH(ohlcv_N, timeInfo.duration, ohlcv_N.timestamp, timeInfo.remaining);

    // Contextual Warnings & Rambu-Rambu based on COP TAH Rules
    const warnings = [];

    // 1. Rambu Hukum JIKA
    if (jika.trend === 'UP') {
      warnings.push(`🟢 Rambu JIKA: Status BULLISH (Open N $${ohlcv_N.open.toFixed(decimals)} > Open B $${ohlcv_B.open.toFixed(decimals)}). Fokus pasang BUY LIMIT di lantai Busur Bawah.`);
    } else if (jika.trend === 'DOWN') {
      warnings.push(`🔴 Rambu JIKA: Status BEARISH (Open N $${ohlcv_N.open.toFixed(decimals)} < Open B $${ohlcv_B.open.toFixed(decimals)}). DILARANG BUY di tengah jalan. Entry SELL LIMIT di atap Busur Atas.`);
    }

    // 2. Rambu Hukum Busur (Entry Guardrails)
    warnings.push(`🎯 Rambu Busur: Titik entry resmi di level ${busur.action === 'BUY LIMIT' ? 'Support S1' : 'Resistance R1'} ($${busur.entryPrice.toFixed(decimals)}). JANGAN entry instan (FOMO) jika harga sudah berada di atas Pivot!`);

    // 3. Rambu Hukum Perahu (Pattern Warning)
    if (perahu.pattern.includes('SDW')) {
      warnings.push(`⚠️ Rambu Perahu: Terdeteksi pola Sideway (${perahu.pattern}). Rentang harga menyempit, waspadai ledakan volatilitas sesaat sebelum breakout.`);
    } else if (perahu.pattern.includes('ANL')) {
      warnings.push(`⚠️ Rambu Perahu: Terdeteksi Anomaly (${perahu.pattern}). Terjadi tarikan ekstrem berlawanan arah, waspadai penolakan harga semu (false breakout).`);
    } else if (perahu.pattern.includes('BRK')) {
      warnings.push(`⚡ Rambu Perahu: Breakout terkonfirmasi (${perahu.pattern}). Perahu melaju kencang searah tren momentum.`);
    }

    // 4. Rambu HSH (Home Sweet Home Warning)
    if (hsh.hshActive) {
      warnings.push(`🏠 Rambu HSH: Usia candle telah mencapai ${hsh.percentElapsed}%. Gaya magnetik HSH aktif — waspadai pembalikan harga pulang ke Open N ($${ohlcv_N.open.toFixed(decimals)}). Segera amankan profit!`);
    } else {
      warnings.push(`⏳ Rambu HSH: Usia candle baru berjalan ${hsh.percentElapsed}%. HSH belum memenuhi seluruh syarat; rumah tetap Open N.`);
    }

    // 5. Rambu Fraktal & Hierarki Waktu
    if (tf !== '1d') {
      if (jika.trend !== dailyJika.trend) {
        warnings.push(`🛑 Rambu Fraktal: Tren ${tf} (${jika.trend}) berlawanan dengan Harian (${dailyJika.trend}). Ambil target cepat di TP1 ($${busur.tp1.toFixed(decimals)}), pasang Stop Loss disiplin!`);
      } else {
        warnings.push(`✅ Rambu Fraktal: Tren ${tf} selaras penuh dengan Harian (${dailyJika.trend}). Konfluensi tinggi untuk mencapai Target Utama TP2 ($${busur.tp2.toFixed(decimals)}).`);
      }
    } else {
      warnings.push(`👑 Rambu Filter King: Timeframe Harian adalah penentu arah utama. Seluruh timeframe intraday (5m–4h) wajib tunduk pada level Pivot Harian $${rs.pivot.toFixed(decimals)}.`);
    }

    // Detailed COP TAH Method Rationale (Mengapa Entry di Sini?)
    if (jika.trend === 'NEUTRAL') return {tf,name,style,category,currentPrice,openN:ohlcv_N.open,openB:ohlcv_B.open,highN:ohlcv_N.high,lowN:ohlcv_N.low,jika,perahu,rs,busur,hsh,warnings:['JIKA NEUTRAL: Open N sama dengan Open B. Tidak ada skenario BUY/SELL.'],coptahRationale:{whyEntryHere:'WAIT: belum ada arah JIKA.',hshRole:`HSH = Open N ${ohlcv_N.open}`},globalMacroStoryline:{}};
    const isActionBuy = busur.action === 'BUY LIMIT';
    const coptahRationale = {
      whyEntryHere: isActionBuy
        ? `Tunggu pantulan busur turun ke Support S1 ($${busur.entryPrice.toFixed(decimals)}) untuk harga beli terbaik (spring compression). Dilarang mengejar harga di atas Pivot (Anti-FOMO). Target amankan profit di Pivot ($${busur.tp1.toFixed(decimals)}) dan ekspansi ke R1 ($${busur.tp2.toFixed(decimals)}).`
        : `Tunggu tarikan busur naik ke Resistance R1 ($${busur.entryPrice.toFixed(decimals)}) untuk harga jual terbaik (premium liquidity). Dilarang mengejar harga di bawah Pivot (Anti-FOMO). Target amankan profit di Pivot ($${busur.tp1.toFixed(decimals)}) dan meluncur ke S1 ($${busur.tp2.toFixed(decimals)}).`,
      antiFomoRule: isActionBuy
        ? `Anti-FOMO: Dilarang entry BUY di atas Pivot ($${busur.tp1.toFixed(decimals)}). Wajib sabar menanti harga menarik tali busur di S1.`
        : `Anti-FOMO: Dilarang entry SELL di bawah Pivot ($${busur.tp1.toFixed(decimals)}). Wajib sabar menanti harga menguji atap R1.`,
      jikaRole: `Open N ($${ohlcv_N.open.toFixed(decimals)}) ${ohlcv_N.open >= ohlcv_B.open ? '≥' : '<'} Open B ($${ohlcv_B.open.toFixed(decimals)}) ➔ Arah perahu ${jika.direction}. Level ${isActionBuy ? 'S1' : 'R1'} sebagai pijakan dermaga.`,
      perahuRole: `${perahu.status}: ${perahu.description}`,
      hshRole: `Rumah Idaman (HSH) adalah Open N ($${ohlcv_N.open.toFixed(decimals)}). Pivot ($${rs.pivot.toFixed(decimals)}) adalah level RS terpisah, bukan target rumah HSH.`,
      riskRewardRatio: busur.riskReward,
    };

    // Global Macro & Decadal Storyline Connection (Peta 2026 & Dekade 2021–2030)
    const fractalRoleMap = {
      '5m': 'Riak Likuiditas Mikro: Menangkap pantulan cepat di lantai S1 untuk scalping kilat sebelum sesi besar London/NY.',
      '15m': 'Tarikan Busur Sesi: Mengonfirmasi transisi pembukaan sesi Asia/Eropa/Amerika terhadap arah perahu harian.',
      '30m': 'Jembatan Transisi Sesi: Menguji reaksi pembukaan pasar London & New York terhadap magnet Pivot.',
      '1h': 'Tulang Punggung Intraday: Akumulasi utama harian menuju target mingguan di zona ekuilibrium $4,150–$4,200.',
      '4h': 'Pondasi Swing Mingguan: Batas aman swing 2–5 hari untuk menguji target ekspansi atau penarikan HSH.',
      '1d': 'Kompas Makro Harian (Filter King): Terhubung langsung vertikal ke siklus bulanan & dekade 2021–2030.',
    };

    const globalMacroStoryline = {
      decadeCycle: 'Konteks global dibaca dari candle tahunan hingga harian sumber broker; tidak memakai proyeksi harga tetap.',
      year2026Phase: 'Posisi global mengikuti Open N, Open B, dan gerak tiap timeframe yang tersedia.',
      fractalRole: `Timeframe ${tf} dibaca sebagai bagian perkembangan gerakan terhadap pusat analisis H4.`,
      alignmentRecommendation: 'Gunakan Kompas H4 untuk membaca keselarasan dan konflik; akhir busur belum otomatis terkonfirmasi.',
    };

    return {
      tf,
      name,
      style,
      category,
      currentPrice: currentPrice || ohlcv_N.close,
      openN: ohlcv_N.open,
      openB: ohlcv_B.open,
      highN: ohlcv_N.high,
      lowN: ohlcv_N.low,
      jika,
      perahu,
      rs: {
        pivot: rs.pivot,
        r1: rs.r1,
        r2: rs.r2,
        r3: rs.r3,
        s1: rs.s1,
        s2: rs.s2,
        s3: rs.s3,
      },
      busur,
      hsh,
      warnings,
      coptahRationale,
      globalMacroStoryline,
    };
  }).filter(Boolean);
}

// ─── Core Analysis Function ────────────────────────────────────────────────────
async function runAnalysis(symbol = 'XAUUSD', timeframe = '1h', brokerId = 'EXNESS') {
  try {
    const bKey = (brokerId || 'EXNESS').toUpperCase();
    const broker = BROKERS[bKey];
  if (!broker) throw new Error('Broker tidak didukung. Pilih EXNESS atau BINANCE.');
    const decimals = broker.decimals || (broker.id === 'BINANCE' ? 2 : 3);
    const { marketSymbol, displaySymbol } = resolveBinanceMarket(symbol);
    if (broker.id === 'EXNESS' && displaySymbol !== 'XAUUSD') throw new Error('Exness bridge hanya melayani XAUUSD.');
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
    const rsMatrix = calcRSMatrix(ohlcv_B, {});
    const periodTouches = Object.fromEntries(Object.entries(rsMatrix.levels).map(([key,level]) =>
      [key,ohlcv_N.low<=level.value && ohlcv_N.high>=level.value]));
    const rsMatrixUpdated = calcRSMatrix(ohlcv_B, periodTouches);

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
    let cycleContext = {source: broker.id === 'EXNESS' ? `MT5 Exness ${mt5State.symbol}` : broker.name};
    try {
      const [hourly, dailyRows] = await Promise.all([
        fetchBrokerOHLCV(broker.id, marketSymbol, '1h'),
        fetchBrokerOHLCV(broker.id, marketSymbol, '1d'),
      ]);
      const asCandle = r => ({timestamp:r[0],open:r[1],high:r[2],low:r[3],close:r[4]});
      cycleContext = {...cycleContext,hourly,daily:asCandle(dailyRows.at(-1)),dailyBefore:asCandle(dailyRows.at(-2)),
        price:broker.id === 'EXNESS' ? mt5State.bid : dailyRows.at(-1)[4]};
    } catch (error) { console.warn('[Market Cycle] ' + error.message); }
    const marketCycle = calcMarketCycle(ohlcv_N, ohlcv_B, timeframe, ohlcv_N.close, cycleContext);

    // Sub-Alur Cerita Fraktal (Busur vs Target hierarchy across 1Y, 6M, 3M, 1M, 1W, D1, H4)
    let subAlurCerita = calcSubAlurCerita(timeframe, ohlcv_N, ohlcv_B, jika, ohlcv_N.close);

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

    const ltfData = {
      timeframe,
      jika,
      perahu,
      rsMatrix: rsMatrixUpdated,
      ohlcv_N,
      ohlcv_B,
    };

    let multiTfDecision = calcMultiTfConfluence(htfData, ltfData, ohlcv_N.close, decimals);

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
      leak4RegMatrix = calcLeak4RegMatrix(multiTfMap, ohlcv_N.close, Math.round((broker.spread || 0.12) * 100), decimals);
    } catch (e) {
      console.warn('[Leak4Reg Matrix Error]:', e.message);
    }

    let entryRecommendations = [];
    try {
      const multiTfMap = await getMultiTfCandles(broker.id, marketSymbol);
      multiTfMap[timeframe] = { ohlcv_N, ohlcv_B };
      entryRecommendations = generateEntryRecommendations(multiTfMap, ohlcv_N.close, userModal, decimals);
    } catch (e) {
      console.warn('[Entry Recommendations Error]:', e.message);
    }

    let h4Compass = buildH4Compass();
    let marketEntry = buildMarketEntry(null,null,marketCycle,null);
    try {
      const hierarchy = await getMultiTfCandles(broker.id, marketSymbol);
      h4Compass = buildH4Compass(hierarchy);
      let marketQuote=null;
      if(broker.id==='EXNESS') marketQuote={bid:mt5State.bid,ask:mt5State.ask,timestamp:mt5State.lastTickTime};
      else {
        try {const q=await exchange.fetchTicker(marketSymbol);marketQuote={bid:q.bid,ask:q.ask,timestamp:q.timestamp || Date.now()};}catch(error){console.warn('[Market Quote] '+error.message);}
      }
      marketEntry=buildMarketEntry(hierarchy.market,h4Compass,marketCycle,marketQuote,Date.now(),decimals);
    } catch (error) { console.warn('[H4 Compass] ' + error.message); }
    try {
      const hierarchy=await getMultiTfCandles(broker.id,marketSymbol);
      const minuteBars=await fetchBrokerOHLCV(broker.id,marketSymbol,'1m');
      const fiveBars=await fetchBrokerOHLCV(broker.id,marketSymbol,'5m');
      const monitor=(tf,plan,n)=>{
        const minute=observePlan(plan,n,minuteBars,60000);
        return minute.status==='UNCONFIRMED'?observePlan(plan,n,fiveBars,300000):minute;
      };
      entryRecommendations=entryRecommendations.map(rec=>{
        const observation=monitor(rec.tf,rec.busur,hierarchy[rec.tf]?.ohlcv_N);
        return {...rec,observation,alternatives:alternativeEntries(rec.tf,rec.busur,hierarchy,ohlcv_N.close,observation,h4Compass.h4)};
      });
      if(marketEntry.plan) {
        marketEntry.observation=monitor('market',marketEntry.plan,marketEntry.current);
        marketEntry.alternatives=alternativeEntries('market',marketEntry.plan,hierarchy,marketEntry.quote?.bid,marketEntry.observation,h4Compass.h4);
      }
    } catch(error) {console.warn('[Plan observation] '+error.message);}
    // All narrative consumers use the same actual hierarchy, not calendar assumptions.
    subAlurCerita={activeTimeframe:timeframe,trend:h4Compass.h4.jika,
      fundamentalLaw:h4Compass.description,
      allSchedules:h4Compass.hierarchy.map(f=>({tf:f.timeframe,name:f.timeframe,jika:f.jika,
        currentPhase:f.phase==='BOW_DIRECTION'?'BUSUR':f.phase==='TARGET_DIRECTION'?'TARGET':'WAIT',
        busurRule:`Busur ${f.bowDirection}`,targetRule:`Target ${f.targetDirection}`,
        busurTime:'Mengikuti gerakan aktual, bukan pembagian waktu otomatis',targetTime:'Belum mengonfirmasi akhir Busur',
        progress:f.available?`Open N ${f.openN}, Open B ${f.openB}`:'Data belum tersedia',
      }))};
    const small=h4Compass.hierarchy.find(f=>f.timeframe===timeframe);
    multiTfDecision={available:h4Compass.h4.available && !!small?.available,
      htf:{timeframe:'4h',jika:h4Compass.h4.jika,move:h4Compass.h4.move},
      ltf:{timeframe,jika:small?.jika || 'UNAVAILABLE',move:small?.move || 'UNAVAILABLE'},
      correlationStatus:h4Compass.description,safeEntryAction:'OBSERVASI · belum ada konfirmasi akhir Busur',
      rationale:h4Compass.confirmationNote,guardrails:h4Compass.warnings,signalColor:'amber'};
    entryRecommendations = entryRecommendations.map(rec => ({...rec,
      h4Context: {jika:h4Compass.h4.jika,phase:h4Compass.h4.phase,macroStatus:h4Compass.macroStatus},
      warnings:[`H4 pusat analisis: ${h4Compass.label}. ${h4Compass.confirmationNote}`, ...rec.warnings],
    }));

    const result = {
      h4Compass,
      marketEntry,
      planObservation: entryRecommendations.find(r=>r.tf===timeframe)?.observation || null,
      symbol: displaySymbol,
      marketSymbol,
      timeframe,
      broker,
      decimals,
      dataSource: broker.id === 'EXNESS' ? (['3M','6M','1Y'].includes(timeframe) ? 'MT5 Exness · agregasi kalender candle MN1' : 'MT5 Exness · ' + mt5State.symbol + ' · ' + timeframe) : `Binance Spot · ${marketSymbol}`,
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
      entryRecommendations,
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

// Multi-Timeframe Entry Recommendations Endpoint (5m, 15m, 30m, 1h, 4h, 1d) with COP TAH Warnings
app.get('/api/entry-recommendations', async (req, res) => {
  try {
    const symbol = req.query.symbol || 'XAUUSD';
    const broker = req.query.broker || 'EXNESS';
    const analysis = await runAnalysis(symbol, '1h', broker);
    res.json({
      success: true,
      data: analysis.entryRecommendations,
      currentPrice: analysis.ohlcv_N?.close,
      decimals: analysis.decimals,
      userModal: analysis.userModal,
      lot: analysis.lotCalc?.lot,
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
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

app.get('/api/mt5/history', (req,res) => {
  try {
    const rows=getExnessCandles(mt5State,'1M');
    const candles=rows.map((r,i)=> {
      const n={timestamp:r[0],open:r[1],high:r[2],low:r[3],close:r[4],volume:r[5]};
      const p=rows[i-1];
      const b=p?{open:p[1],high:p[2],low:p[3],close:p[4]}:null;
      return {...n,date:new Date(r[0]).toISOString().slice(0,7),jika:b?calcHukumJIKA(n,b):null,perahu:b?calcHukumPerahu(n,b):null,forming:i===rows.length-1};
    });
    res.json({success:true,source:`MT5 Exness ${mt5State.symbol}`,candles});
  } catch(error) {res.status(503).json({success:false,error:error.message});}
});

// ─── Historical XAUUSD Data Endpoints (2000–2026) ─────────────────────────────

// Paginated & Filterable Historical Monthly Candles with COP TAH Classifications
app.get('/api/historical/candles', async (req, res) => {
  return res.status(503).json({success:false,error:'Arsip historis lama dikarantina: ditemukan OHLC tidak konsisten. Gunakan /api/mt5/history untuk data Exness tervalidasi.'});
  try {
    const { decade = 'ALL', search = '', limit = 100, page = 1 } = req.query;
    const result = await getHistoricalCandles(decade, search, parseInt(limit, 10), parseInt(page, 10));
    res.json({ success: true, ...result });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// Macro Summary Statistics (ATH, ATL, winrates, ranges, sources)
app.get('/api/historical/summary', async (req, res) => {
  return res.status(503).json({success:false,error:'Arsip historis lama dikarantina: ditemukan OHLC tidak konsisten. Gunakan /api/mt5/history untuk data Exness tervalidasi.'});
  try {
    const ds = await loadOrBuildHistoricalDataset();
    res.json({
      success: true,
      metadata: ds.metadata,
      summary: ds.summary,
      macroBenchmarkSeries: ds.macroBenchmarkSeries,
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// Direct CSV File Export
app.get('/api/historical/export', async (req, res) => {
  return res.status(503).json({success:false,error:'Arsip historis lama dikarantina: ditemukan OHLC tidak konsisten. Gunakan /api/mt5/history untuk data Exness tervalidasi.'});
  try {
    const csvData = await exportHistoricalCsv();
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename="xauusd_historical_coptah_2000_2026.csv"');
    res.status(200).send(csvData);
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
    const { symbol = 'XAUUSD', timeframe = '1h', broker = 'EXNESS', limit = 50 } = req.query;
    const { marketSymbol } = resolveBinanceMarket(symbol);
    const ohlcv = await fetchBrokerOHLCV(broker, marketSymbol, timeframe);
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
      timeframes,
      digits,
    } = req.body;

    const livePrice = Number(price ?? ((Number(bid) + Number(ask)) / 2).toFixed(3));
    if (!Number.isFinite(livePrice) || livePrice <= 0 || (bid != null && (!Number.isFinite(Number(bid)) || Number(bid) <= 0)) || (ask != null && (!Number.isFinite(Number(ask)) || Number(ask) <= 0))) {
      return res.status(400).json({ success: false, error: 'Invalid MT5 quote' });
    }
    const receivedAt = Date.now();
    const snapshots = {};
    if (timeframes != null) {
      if (typeof timeframes !== 'object' || Array.isArray(timeframes)) return res.status(400).json({success:false,error:'Invalid timeframe map'});
      for (const [tf, rows] of Object.entries(timeframes)) {
        if (!DIRECT_TIMEFRAMES.includes(tf) || !validCandles(rows)) return res.status(400).json({success:false,error:`Invalid Exness candles: ${tf}`});
        snapshots[tf] = {candles: rows, updatedAt: receivedAt};
      }
    } else if (candles != null) {
      if (!DIRECT_TIMEFRAMES.includes(timeframe) || !validCandles(candles)) return res.status(400).json({success:false,error:'Invalid Exness candles'});
      snapshots[timeframe] = {candles, updatedAt: receivedAt};
    }
    const sameSession = mt5State.account === account && mt5State.server === server && mt5State.symbol === symbol;
    const nextTimeframes = {...(sameSession ? mt5State.timeframes : {}), ...snapshots};
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
      timeframes: nextTimeframes,
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
      timeframe: Array.isArray(candles) && candles.length > 0 ? timeframe : mt5State.timeframe,
    };

    multiTfCandlesCache.lastFetch = 0;
    if (Number.isInteger(digits) && digits >= 0 && digits <= 8) BROKERS.EXNESS.decimals = digits;
    BROKERS.EXNESS.server = server;
    BROKERS.EXNESS.spread = numSpread;
    BROKERS.EXNESS.spreadLabel = mt5State.spreadLabel;
    BROKERS.EXNESS.isDirectMT5 = true;

    // Broadcast tick directly to clients watching Exness
    const tickPayload = JSON.stringify({
      type: 'tick',
      data: {
        broker: 'EXNESS',
        brokerName: 'Exness',
        symbol: 'XAUUSD',
        source: 'MT5 bridge',
        server,
        price: livePrice,
        bid: numBid,
        ask: numAsk,
        spread: mt5State.spreadLabel,
        direction,
        isDirectMT5: true,
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
    timeframes: Object.fromEntries(Object.entries(mt5State.timeframes || {}).map(([tf, snapshot]) => [tf, { bars: snapshot.candles.length, updatedAt: snapshot.updatedAt, fresh: Date.now() - snapshot.updatedAt < 15000 }])),
  });
});

// Manual Price Sync / Calibration endpoint (Allows user to calibrate live price to MT5 exact rate)
app.post('/api/mt5/sync', async (req, res) => {
  return res.status(501).json({success:false,error:'Login/kalibrasi dashboard tidak mengautentikasi MT5. Gunakan terminal MT5 dan bridge aktif; harga tidak boleh dikalibrasi manual.'});
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
  return res.status(501).json({success:false,error:'Login/kalibrasi dashboard tidak mengautentikasi MT5. Gunakan terminal MT5 dan bridge aktif; harga tidak boleh dikalibrasi manual.'});
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

        ws.symbol = newSymbol;
        ws.timeframe = newTimeframe;
        ws.broker = newBroker;
        console.log(`[WS] Client subscribed to ${ws.broker} ${ws.symbol} ${ws.timeframe}`);

        // If timeframe/symbol/broker changed, immediately fetch fresh data for this client only
        {
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
};

const liveCache = {
  BINANCE: { basePrice: 0, lastFetch: 0 },
  EXNESS: { basePrice: 0, lastFetch: 0 },
};

let tickerBusy = false;
async function broadcastLiveTicks() {
  if (tickerBusy) return;
  tickerBusy = true;
  try {
    const symbols = new Set();
    wss.clients.forEach(c => {
      if (c.readyState === WebSocket.OPEN && c.broker === 'BINANCE') symbols.add(c.symbol);
    });
    for (const symbol of symbols) {
      try {
        const { marketSymbol } = resolveBinanceMarket(symbol);
        const quote = await exchange.fetchTicker(marketSymbol);
        const price = Number(quote.last ?? quote.close);
        if (!Number.isFinite(price) || price <= 0) continue;
        const timestamp = Number(quote.timestamp) || Date.now();
        if (Date.now() - timestamp > 10000) continue;
        const previous = lastBrokerPrices[symbol] || price;
        lastBrokerPrices[symbol] = price;
        const payload = JSON.stringify({ type: 'tick', data: {
          broker: 'BINANCE', symbol, source: marketSymbol, price,
          bid: quote.bid, ask: quote.ask, decimals: 2,
          direction: price > previous ? 'UP' : price < previous ? 'DOWN' : 'SAME',
          timestamp,
        }});
        wss.clients.forEach(c => {
          if (c.readyState === WebSocket.OPEN && c.broker === 'BINANCE' && c.symbol === symbol) c.send(payload);
        });
      } catch (error) { console.warn(`[Ticker] ${symbol}: ${error.message}`); }
    }
  } finally { tickerBusy = false; }
}
setInterval(broadcastLiveTicks, 1000);
let analysisBusy = false;
setInterval(async () => {
  if (analysisBusy) return;
  analysisBusy = true;
  try { await autoRefresh(); } finally { analysisBusy = false; }
}, 5000);

app.get('/download/tablet.apk', (req, res) => {
  res.download(path.join(__dirname, '../installers/COP-TAH-Exness-Tablet.apk'));
});

// Built dashboard shares the API/WebSocket origin for tablet access.
app.use(express.static(path.join(__dirname, '../frontend/dist')));

// ─── Start Server ──────────────────────────────────────────────────────────────
server.listen(PORT, () => {
  console.log(`
╔══════════════════════════════════════════════════════╗
║       COP TAH Analytics Dashboard — Backend           ║
║       Port: ${PORT}  |  WebSocket: ws://localhost:${PORT}   ║
╚══════════════════════════════════════════════════════╝
  `);

  // Preload historical 2000–2026 dataset
  loadOrBuildHistoricalDataset().catch((err) => {
    console.warn('[Server] Error preloading historical dataset:', err.message);
  });
});

module.exports = { app, server };
