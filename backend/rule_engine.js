/**
 * COP TAH Analytics Dashboard - Rule Engine
 * Core trading logic implementing 5 Main Trading Laws and 3 Core Theories
 */

/**
 * 1. HUKUM JIKA (Trend Direction Law)
 * Compares current candle Open (N) with previous candle Open (B)
 */
function calcHukumJIKA(ohlcv_N, ohlcv_B) {
  const open_N = ohlcv_N.open;
  const open_B = ohlcv_B.open;

  if (open_N > open_B) {
    return {
      trend: 'UP',
      direction: 'BUY',
      label: '▲ BULLISH',
      description: 'Open N > Open B — Focus on BUY setups',
    };
  } else if (open_N < open_B) {
    return {
      trend: 'DOWN',
      direction: 'SELL',
      label: '▼ BEARISH',
      description: 'Open N < Open B — Focus on SELL setups',
    };
  } else {
    return {
      trend: 'NEUTRAL',
      direction: 'WAIT',
      label: '◆ NEUTRAL',
      description: 'Open N = Open B — Sideways / Wait for signal',
    };
  }
}

/**
 * 2. HUKUM PERAHU (Pattern Status Law)
 * Evaluates OHL combinations to categorize market state
 * Candle N vs Candle B:
 *   High_N vs High_B, Low_N vs Low_B determine pattern
 */
function calcHukumPerahu(ohlcv_N, ohlcv_B) {
  const { open: O_N, high: H_N, low: L_N } = ohlcv_N;
  const { open: O_B, high: H_B, low: L_B } = ohlcv_B;

  const highBreak = H_N > H_B;
  const lowBreak = L_N < L_B;
  const highEqual = Math.abs(H_N - H_B) < 0.01;
  const lowEqual = Math.abs(L_N - L_B) < 0.01;
  const trendUp = O_N > O_B;
  if (O_N === O_B) return {pattern: 'NEUTRAL', status: 'Netral', description: 'Open N sama dengan Open B; arah belum ditentukan', highBreak, lowBreak};

  let pattern, status, description;

  if (highBreak && !lowBreak) {
    // Only upper boundary exceeded
    pattern = trendUp ? 'BRK UP' : 'ANL UP';
    status = trendUp ? 'Big Boat Break Up' : 'Anomaly Up';
    description = trendUp
      ? 'High breaks up, Low holds — Strong Bullish Momentum'
      : 'High breaks up against downtrend — Watch for reversal';
  } else if (!highBreak && lowBreak) {
    // Only lower boundary exceeded
    pattern = trendUp ? 'ANL DWN' : 'BRK DWN';
    status = trendUp ? 'Anomaly Down' : 'Big Boat Break Down';
    description = trendUp
      ? 'Low breaks down against uptrend — Watch for reversal'
      : 'Low breaks down, High holds — Strong Bearish Momentum';
  } else if (highBreak && lowBreak) {
    // Both boundaries exceeded
    pattern = trendUp ? 'NRL UP' : 'NRL DWN';
    status = trendUp ? 'Normal Up (Outside Bar)' : 'Normal Down (Outside Bar)';
    description = trendUp
      ? 'Both High & Low expand — Normal bullish expansion'
      : 'Both High & Low expand — Normal bearish expansion';
  } else if (highEqual && lowEqual) {
    // Perfect inside bar
    pattern = trendUp ? 'SDW UP' : 'SDW DWN';
    status = trendUp ? 'Small Boat Sideway Up' : 'Small Boat Sideway Down';
    description = trendUp
      ? 'Inside bar within uptrend — Consolidation, breakout pending'
      : 'Inside bar within downtrend — Consolidation, breakdown pending';
  } else if (!highBreak && !lowBreak) {
    // Inside bar (neither boundary broken)
    pattern = trendUp ? 'SDW UP' : 'SDW DWN';
    status = trendUp ? 'Small Boat Sideway Up' : 'Small Boat Sideway Down';
    description = trendUp
      ? 'Inside candle in uptrend — Compressed range'
      : 'Inside candle in downtrend — Compressed range';
  } else {
    pattern = 'NRL UP';
    status = 'Normal';
    description = 'Standard candle formation';
  }

  return { pattern, status, description, highBreak, lowBreak };
}

/**
 * 3. HUKUM BUSUR & PENDING ORDERS (Bow & Pending Order Law)
 * Generates actionable pending order instruction, targets (TP1, TP2), and Stop Loss
 */
function calcHukumBusur(jikaResult, rsMatrix, ohlcv_N, lotCalc = null, decimals = 2) {
  const { trend } = jikaResult;
  const { pivot, s1, s2, s3, r1, r2, r3 } = rsMatrix;
  const currentPrice = ohlcv_N?.close || pivot;
  const lot = lotCalc?.lot || 0.40;

  if (trend === 'UP') {
    const entry = s1;
    const tp1 = pivot;
    const tp2 = r1;
    const tp3 = r2;
    const sl = s2;
    const distToEntry = Math.abs(currentPrice - entry).toFixed(decimals);
    const tp1Pts = Math.abs(tp1 - entry).toFixed(decimals);
    const tp2Pts = Math.abs(tp2 - entry).toFixed(decimals);
    const slPts = Math.abs(entry - sl).toFixed(decimals);
    const rrRatio = parseFloat(slPts) > 0 ? (parseFloat(tp2Pts) / parseFloat(slPts)).toFixed(2) : '2.50';

    return {
      action: 'BUY LIMIT',
      orderType: 'Buy Limit (Pending Order)',
      entryPrice: entry,
      targetLevel: entry,
      tp1,
      tp2,
      tp3,
      stopLoss: sl,
      distToEntry,
      tp1Points: tp1Pts,
      tp2Points: tp2Pts,
      slPoints: slPts,
      riskReward: `1 : ${rrRatio}`,
      estProfitTp1: '—',
      estProfitTp2: '—',
      estLossSl: '—',
      instruction: `BUY LIMIT di ${entry.toFixed(decimals)} | Target TP1: ${tp1.toFixed(decimals)} (+${tp1Pts}) | Target TP2: ${tp2.toFixed(decimals)} (+${tp2Pts}) | Stop Loss: ${sl.toFixed(decimals)} (-${slPts})`,
      rationale: `Tren UP — Pasang Buy Limit di Busur Bawah (Support S1 ${entry.toFixed(decimals)}). Target ambil untung di Pivot (${tp1.toFixed(decimals)}) dan Resistance R1 (${tp2.toFixed(decimals)}).`,
      color: 'green',
      emoji: '🟢',
    };
  } else if (trend === 'DOWN') {
    const entry = r1;
    const tp1 = pivot;
    const tp2 = s1;
    const tp3 = s2;
    const sl = r2;
    const distToEntry = Math.abs(entry - currentPrice).toFixed(decimals);
    const tp1Pts = Math.abs(entry - tp1).toFixed(decimals);
    const tp2Pts = Math.abs(entry - tp2).toFixed(decimals);
    const slPts = Math.abs(sl - entry).toFixed(decimals);
    const rrRatio = parseFloat(slPts) > 0 ? (parseFloat(tp2Pts) / parseFloat(slPts)).toFixed(2) : '2.50';

    return {
      action: 'SELL LIMIT',
      orderType: 'Sell Limit (Pending Order)',
      entryPrice: entry,
      targetLevel: entry,
      tp1,
      tp2,
      tp3,
      stopLoss: sl,
      distToEntry,
      tp1Points: tp1Pts,
      tp2Points: tp2Pts,
      slPoints: slPts,
      riskReward: `1 : ${rrRatio}`,
      estProfitTp1: '—',
      estProfitTp2: '—',
      estLossSl: '—',
      instruction: `SELL LIMIT di ${entry.toFixed(decimals)} | Target TP1: ${tp1.toFixed(decimals)} (+${tp1Pts}) | Target TP2: ${tp2.toFixed(decimals)} (+${tp2Pts}) | Stop Loss: ${sl.toFixed(decimals)} (-${slPts})`,
      rationale: `Tren DOWN — Pasang Sell Limit di Busur Atas (Resistance R1 ${entry.toFixed(decimals)}). Target ambil untung di Pivot (${tp1.toFixed(decimals)}) dan Support S1 (${tp2.toFixed(decimals)}).`,
      color: 'red',
      emoji: '🔴',
    };
  } else {
    return {
      action: 'WAIT',
      orderType: 'Standby / No Order',
      entryPrice: pivot,
      targetLevel: pivot,
      tp1: r1,
      tp2: s1,
      tp3: r2,
      stopLoss: s2,
      distToEntry: '0.000',
      tp1Points: '0.000',
      tp2Points: '0.000',
      slPoints: '0.000',
      riskReward: '1 : 1.00',
      estProfitTp1: '0.00',
      estProfitTp2: '0.00',
      estLossSl: '0.00',
      instruction: 'Market Sideways — Belum ada pending order aktif. Tunggu konfirmasi JIKA.',
      rationale: 'Tren NEUTRAL / Sideways — Menunggu konfirmasi breakout candle berikutnya.',
      color: 'yellow',
      emoji: '🟡',
    };
  }
}

/**
 * 4. RS MATRIX — Pivot, Resistance, Support Calculation
 * Standard Pivot Point formula with dynamic touch color detection
 */
function calcRSMatrix(ohlcv_B, touchedLevels = {}) {
  const { high: H, low: L, close: C } = ohlcv_B;

  const pivot = (H + L + C) / 3;
  const range = H - L;

  // Standard pivot levels
  const r1 = 2 * pivot - L;
  const r2 = pivot + range;
  const r3 = r1 + range;
  const r4 = r2 + range;

  const s1 = 2 * pivot - H;
  const s2 = pivot - range;
  const s3 = s1 - range;
  const s4 = s2 - range;

  // Dynamic color detection based on price touch
  // Default colors: Pivot=White, Resistance=Orange, Support=Pink
  // Touched colors: Pivot=Violet, Resistance=Green, Support=Red
  const levels = {
    r4: { value: r4, defaultColor: 'orange', touchColor: 'green', label: 'R4', touched: touchedLevels.r4 || false },
    r3: { value: r3, defaultColor: 'orange', touchColor: 'green', label: 'R3', touched: touchedLevels.r3 || false },
    r2: { value: r2, defaultColor: 'orange', touchColor: 'green', label: 'R2', touched: touchedLevels.r2 || false },
    r1: { value: r1, defaultColor: 'orange', touchColor: 'green', label: 'R1', touched: touchedLevels.r1 || false },
    pivot: { value: pivot, defaultColor: 'white', touchColor: 'violet', label: 'Pivot', touched: touchedLevels.pivot || false },
    s1: { value: s1, defaultColor: 'pink', touchColor: 'red', label: 'S1', touched: touchedLevels.s1 || false },
    s2: { value: s2, defaultColor: 'pink', touchColor: 'red', label: 'S2', touched: touchedLevels.s2 || false },
    s3: { value: s3, defaultColor: 'pink', touchColor: 'red', label: 'S3', touched: touchedLevels.s3 || false },
    s4: { value: s4, defaultColor: 'pink', touchColor: 'red', label: 'S4', touched: touchedLevels.s4 || false },
  };

  return { pivot, r1, r2, r3, r4, s1, s2, s3, s4, levels };
}

/**
 * Update RS Matrix touch detection based on current price
 * Checks if current price is within a defined tolerance of any level
 */
function updateTouchDetection(rsMatrix, currentPrice, tolerance = 0.5) {
  const touchedLevels = {};
  const levelKeys = ['r4', 'r3', 'r2', 'r1', 'pivot', 's1', 's2', 's3', 's4'];

  levelKeys.forEach((key) => {
    const level = rsMatrix.levels[key];
    if (level && Math.abs(currentPrice - level.value) <= tolerance) {
      touchedLevels[key] = true;
    } else {
      touchedLevels[key] = level.touched || false;
    }
  });

  return touchedLevels;
}

/**
 * Helper to format remaining candle duration into readable string
 */
function formatDuration(ms) {
  if (ms <= 0) return '0s';
  const days = Math.floor(ms / (24 * 3600 * 1000));
  const hours = Math.floor((ms % (24 * 3600 * 1000)) / (3600 * 1000));
  const minutes = Math.floor((ms % (3600 * 1000)) / 60000);
  const seconds = Math.floor((ms % 60000) / 1000);

  if (days > 0) return `${days}d ${hours}h ${minutes}m`;
  if (hours > 0) return `${hours}h ${minutes}m`;
  return `${minutes}m ${seconds}s`;
}

/**
 * 5. HUKUM RUMAH IDAMAN (Home Sweet Home — HSH)
 * Monitors candle time-to-close and price vs. Open
 * Triggers HSH warning when price has breached extremes and candle is closing
 */
function calcHukumHSH(ohlcv_N, timeframeMs, openTimestamp, customRemainingMs = null) {
  const { open, high, low, close } = ohlcv_N;
  const now = Date.now();
  let remaining, elapsed, totalDuration, percentElapsed;

  if (customRemainingMs !== null && customRemainingMs !== undefined) {
    totalDuration = timeframeMs;
    remaining = Math.max(customRemainingMs, 0);
    elapsed = Math.max(totalDuration - remaining, 0);
    percentElapsed = Math.min((elapsed / totalDuration) * 100, 100);
  } else {
    const candleClose = openTimestamp + timeframeMs;
    remaining = Math.max(candleClose - now, 0);
    elapsed = Math.max(now - openTimestamp, 0);
    totalDuration = timeframeMs;
    percentElapsed = Math.min((elapsed / totalDuration) * 100, 100);
  }

  const remainingMinutes = Math.max(Math.floor(remaining / 60000), 0);
  const remainingSeconds = Math.max(Math.floor((remaining % 60000) / 1000), 0);
  const formattedTime = formatDuration(remaining);

  // HSH triggers when:
  // 1. Price has moved significantly from open (breached High or Low)
  // 2. Candle is in the final 20% of its duration
  const isNearClose = percentElapsed >= 80;
  const highBreached = high > open;
  const lowBreached = low < open;
  const priceExtended = highBreached || lowBreached;

  const distanceFromOpen = Math.abs(close - open);
  const candleRange = high - low;
  const extensionRatio = candleRange > 0 ? distanceFromOpen / candleRange : 0;

  let hshActive = false;
  let hshSeverity = 'NONE';
  let hshMessage = '';

  if (remaining > 0 && isNearClose && priceExtended && extensionRatio > 0.3) {
    hshActive = true;

    if (percentElapsed >= 95 || (timeframeMs <= 3600000 && remainingMinutes < 5)) {
      hshSeverity = 'CRITICAL';
      hshMessage = `⚠️ HSH CRITICAL: Only ${formattedTime} left! Price far from Open (${open.toFixed(2)}). Pantau kemungkinan kembali ke Open N; belum terkonfirmasi.`;
    } else if (percentElapsed >= 90 || (timeframeMs <= 3600000 && remainingMinutes < 15)) {
      hshSeverity = 'HIGH';
      hshMessage = `⚠️ HSH WARNING: ${formattedTime} remaining. Price at ${close.toFixed(2)}, Open was ${open.toFixed(2)}. Home Sweet Home pattern forming!`;
    } else {
      hshSeverity = 'MEDIUM';
      hshMessage = `⚡ HSH ALERT: Candle extended — ${formattedTime} to close. Monitor for reversion to Open (${open.toFixed(2)}).`;
    }
  }

  return {
    hshActive,
    hshSeverity,
    hshMessage,
    percentElapsed: Math.round(percentElapsed),
    remainingMinutes,
    remainingSeconds,
    timeToClose: formattedTime,
    openPrice: open,
    targetPrice: open,
    targetType: 'OPEN_N',
    currentClose: close,
    extensionRatio: Math.round(extensionRatio * 100),
  };
}

/**
 * 3 CORE THEORIES — Risk Management Lot Calculator
 * Formula: Lot = UserModal / 25000
 */
function calcLotSize(userModal) {
  if (!userModal || userModal <= 0) return { lot: 0, risk: 0, description: 'Invalid modal' };

  const lot = userModal / 25000;
  const risk = 0; // approximate USD risk per pip for XAUUSD
  const minLot = 0.01;
  const roundedLot = Math.max(Math.round(lot * 100) / 100, minLot);

  return {
    lot: roundedLot,
    rawLot: lot,
    risk: null,
    accountRiskVerified: false,
    description: `With modal $${userModal.toFixed(2)}, recommended lot size is ${roundedLot} (Theory: Modal ÷ 25,000)`,
    formula: `${userModal} / 25,000 = ${lot.toFixed(4)}`,
  };
}

function generateStoryline(jika, perahu, busur, rsMatrix, hsh, lotCalc, symbol, timeframe, broker = null, decimals = 2) {
  const lines = [];
  const ts = new Date().toLocaleTimeString('en-US', { hour12: false });
  const brokerLabel = broker?.name ? ` | Server: ${broker.name} (${broker.server})` : '';

  lines.push(`📊 COP TAH ANALYTICS — ${symbol} | ${timeframe}${brokerLabel} | ${ts}`);
  lines.push(`━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`);
  lines.push(``);

  // Step 1: JIKA Analysis
  lines.push(`[STEP 1 — HUKUM JIKA]`);
  lines.push(`Trend Direction: ${jika.label}`);
  lines.push(`Analysis: ${jika.description}`);
  lines.push(``);

  // Step 2: Perahu Pattern
  lines.push(`[STEP 2 — HUKUM PERAHU]`);
  lines.push(`Pattern: ${perahu.pattern} (${perahu.status})`);
  lines.push(`Reading: ${perahu.description}`);
  lines.push(``);

  // Step 3: RS Matrix
  lines.push(`[STEP 3 — RS MATRIX LEVELS]`);
  lines.push(`Pivot: ${rsMatrix.pivot.toFixed(decimals)}`);
  lines.push(`R1: ${rsMatrix.r1.toFixed(decimals)} | R2: ${rsMatrix.r2.toFixed(decimals)} | R3: ${rsMatrix.r3.toFixed(decimals)}`);
  lines.push(`S1: ${rsMatrix.s1.toFixed(decimals)} | S2: ${rsMatrix.s2.toFixed(decimals)} | S3: ${rsMatrix.s3.toFixed(decimals)}`);
  lines.push(``);

  // Step 4: Busur & Pending Order Targets
  lines.push(`[STEP 4 — HUKUM BUSUR (TARGET PENDING ORDER)]`);
  lines.push(`Order Setup:   ${busur.emoji} ${busur.action}`);
  if (busur.action !== 'WAIT' && busur.entryPrice) {
    lines.push(`Entry Level:   ${busur.entryPrice.toFixed(decimals)} (Jarak: ${busur.distToEntry} pts)`);
    lines.push(`Target 1 (TP1): ${busur.tp1.toFixed(decimals)} (+${busur.tp1Points} pts | Est: +$${busur.estProfitTp1})`);
    lines.push(`Target 2 (TP2): ${busur.tp2.toFixed(decimals)} (+${busur.tp2Points} pts | Est: +$${busur.estProfitTp2})`);
    lines.push(`Stop Loss (SL): ${busur.stopLoss.toFixed(decimals)} (-${busur.slPoints} pts | Est: -$${busur.estLossSl})`);
    lines.push(`Risk / Reward: ${busur.riskReward}`);
  }
  lines.push(`Plan Ringkas:  ${busur.instruction}`);
  lines.push(`Alasan:        ${busur.rationale}`);
  lines.push(``);

  // Step 5: HSH Status
  lines.push(`[STEP 5 — HUKUM RUMAH IDAMAN (HSH)]`);
  if (hsh.hshActive) {
    lines.push(`Status: 🏠 HSH ACTIVE — ${hsh.hshSeverity}`);
    lines.push(hsh.hshMessage);
  } else {
    lines.push(`Status: ✅ HSH Inactive — Candle ${hsh.percentElapsed}% complete (${hsh.timeToClose} remaining)`);
    lines.push(`Price (${hsh.currentClose.toFixed(decimals)}) belum memenuhi seluruh syarat HSH terhadap Open (${hsh.openPrice.toFixed(decimals)})`);
  }
  lines.push(``);

  // Step 6: Risk Management
  lines.push(`[STEP 6 — 3 CORE THEORIES (LOT SIZE)]`);
  if (lotCalc) {
    lines.push(`Recommended Lot: ${lotCalc.lot}`);
    lines.push(`Formula: ${lotCalc.formula}`);
  }
  lines.push(``);
  lines.push(`━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`);
  lines.push(`⚡ Trade with discipline. Follow the Laws.`);

  return lines.join('\n');
}

/**
 * Determine trading session based on UTC time
 */
function getTradingSession(timestamp = Date.now()) {
  const now=new Date(timestamp),h=(now.getUTCHours()+7)%24;
  const sessions={
    tokyo:{active:h>=6&&h<14,open:'06:00',close:'14:00',color:'blue'},
    london:{active:h>=14&&h<20,open:'14:00',close:'20:00',color:'yellow'},
    newYork:{active:h>=20||h<4,open:'20:00',close:'04:00',color:'green'},
  };
  return {sessions,activeSessions:Object.keys(sessions).filter(k=>sessions[k].active),timeZone:'Asia/Jakarta',convention:'Sesi metode COP TAH · WIB',utcTime:now.toISOString().slice(11,19)+' UTC'};
}

/**
 * 7. ANALISIS PERGERAKAN MARKET: NORMAL vs STRONG (12 Langkah Siklus Sesi Harian)
 * Sesi Asia (Pagi) -> Sesi Eropa (Sore) -> Sesi USA (Malam) -> Transisi
 */
function calcMarketCycle(ohlcv_N, ohlcv_B, timeframe = '1h', currentPrice = null, context = {}) {
  // Cycle analysis always uses the day's sessions, never the selected chart candle.
  return require('./market_cycle').analyzeMarketSessions(context);
}

/**
 * 8. SUB ALUR CERITA (Fractal Sub-Timeframe Storyline Hierarchy)
 * Menguraikan pembagian Busur vs Target untuk setiap timeframe:
 * - JIKA UP => Busur DOWN, Target UP
 * - JIKA DOWN => Busur UP, Target DOWN
 */
function calcSubAlurCerita(timeframe, ohlcv_N, ohlcv_B, jika, currentPrice) {
  const trend = jika?.trend || 'UP';
  const isUp = trend === 'UP';
  const now = new Date();
  const dayOfWeek = now.getUTCDay(); // 0: Sun, 1: Mon, 2: Tue, 3: Wed, 4: Thu, 5: Fri, 6: Sat
  const wibHour = (now.getUTCHours() + 7) % 24;

  const currentWeekOfMonth = Math.min(Math.ceil(now.getUTCDate() / 7), 5);

  const schedules = [
    {
      tf: '1Y',
      name: 'Tahun (1Y)',
      jika: isUp ? 'UP' : 'DOWN',
      busurRule: isUp ? 'Semester 1 DOWN = sebagai Busur' : 'Semester 1 UP = sebagai Busur',
      targetRule: isUp ? 'Semester 2 UP = sebagai Target' : 'Semester 2 DOWN = sebagai Target',
      busurTime: 'Semester 1 (Januari s/d Juni)',
      targetTime: 'Semester 2 (Juli s/d Desember)',
      isCurrentBusur: now.getUTCMonth() < 6,
      currentPhase: now.getUTCMonth() < 6 ? 'BUSUR' : 'TARGET',
      progress: `Bulan ke-${now.getUTCMonth() + 1} / 12`,
    },
    {
      tf: '6M',
      name: 'Semester (6M)',
      jika: isUp ? 'UP' : 'DOWN',
      busurRule: isUp ? 'Quarter 1 DOWN = sebagai Busur' : 'Quarter 1 UP = sebagai Busur',
      targetRule: isUp ? 'Quarter 2 UP = sebagai Target' : 'Quarter 2 DOWN = sebagai Target',
      busurTime: 'Quarter 1 (Bulan 1 s/d 3)',
      targetTime: 'Quarter 2 (Bulan 4 s/d 6)',
      isCurrentBusur: (now.getUTCMonth() % 6) < 3,
      currentPhase: (now.getUTCMonth() % 6) < 3 ? 'BUSUR' : 'TARGET',
      progress: `Quarter ${(Math.floor(now.getUTCMonth() / 3) % 2) + 1} dari Semester`,
    },
    {
      tf: '3M',
      name: 'Quarter (3M)',
      jika: isUp ? 'UP' : 'DOWN',
      busurRule: isUp ? '1,5 Bulan ke-1 DOWN = sebagai Busur' : '1,5 Bulan ke-1 UP = sebagai Busur',
      targetRule: isUp ? '1,5 Bulan ke-2 UP = sebagai Target' : '1,5 Bulan ke-2 DOWN = sebagai Target',
      busurTime: '1,5 Bulan ke-1 (Hari 1 s/d 45)',
      targetTime: '1,5 Bulan ke-2 (Hari 46 s/d 90)',
      isCurrentBusur: (now.getUTCDate() + (now.getUTCMonth() % 3) * 30) <= 45,
      currentPhase: (now.getUTCDate() + (now.getUTCMonth() % 3) * 30) <= 45 ? 'BUSUR' : 'TARGET',
      progress: `Hari ke-${now.getUTCDate() + (now.getUTCMonth() % 3) * 30} dari Kuartal`,
    },
    {
      tf: '1M',
      name: 'Bulan (1M)',
      jika: isUp ? 'UP' : 'DOWN',
      busurRule: isUp ? 'Minggu 1 & 2 DOWN = sebagai Busur' : 'Minggu 1 & 2 UP = sebagai Busur',
      targetRule: isUp ? 'Minggu 3 & 4 UP = sebagai Target' : 'Minggu 3 & 4 DOWN = sebagai Target',
      busurTime: 'Minggu ke-1 dan ke-2 (Tgl 1 s/d 14)',
      targetTime: 'Minggu ke-3 dan ke-4 (Tgl 15 s/d Akhir Bulan)',
      isCurrentBusur: now.getUTCDate() <= 14,
      currentPhase: now.getUTCDate() <= 14 ? 'BUSUR' : 'TARGET',
      progress: `Tanggal ${now.getUTCDate()} (Minggu ke-${currentWeekOfMonth})`,
    },
    {
      tf: '1w',
      name: `Minggu (1W · WEEK_${currentWeekOfMonth})`,
      jika: isUp ? 'UP' : 'DOWN',
      busurRule: isUp ? '2,5 Hari (Senin, Selasa, 1/2 Rabu) DOWN = sebagai Busur' : '2,5 Hari (Senin, Selasa, 1/2 Rabu) UP = sebagai Busur',
      targetRule: isUp ? '2,5 Hari (1/2 Rabu, Kamis, Jumat) UP = sebagai Target & HSH' : '2,5 Hari (1/2 Rabu, Kamis, Jumat) DOWN = sebagai Target & HSH',
      busurTime: 'Senin, Selasa, s/d Rabu 12:00 WIB',
      targetTime: 'Rabu 12:00 WIB, Kamis, s/d Jumat',
      isCurrentBusur: dayOfWeek === 1 || dayOfWeek === 2 || (dayOfWeek === 3 && wibHour < 12),
      currentPhase: (dayOfWeek === 1 || dayOfWeek === 2 || (dayOfWeek === 3 && wibHour < 12)) ? 'BUSUR' : 'TARGET',
      progress: dayOfWeek === 1 ? `Senin (Fase Busur) — WEEK_${currentWeekOfMonth}` : dayOfWeek === 2 ? `Selasa (Fase Busur) — WEEK_${currentWeekOfMonth}` : dayOfWeek === 3 ? (wibHour < 12 ? `Rabu Pagi (Akhir Busur) — WEEK_${currentWeekOfMonth}` : `Rabu Siang (Mulai Target) — WEEK_${currentWeekOfMonth}`) : dayOfWeek === 4 ? `Kamis (Fase Target) — WEEK_${currentWeekOfMonth}` : `Jumat (Fase Target & HSH) — WEEK_${currentWeekOfMonth}`,
    },
    {
      tf: '1d',
      name: 'Hari (D1)',
      jika: isUp ? 'UP' : 'DOWN',
      busurRule: isUp ? 'Sesi Asia s/d 1/2 Eropa DOWN = sebagai Busur' : 'Sesi Asia s/d 1/2 Eropa UP = sebagai Busur',
      targetRule: isUp ? 'Sesi 1/2 Eropa s/d USA UP = sebagai Target' : 'Sesi 1/2 Eropa s/d USA DOWN = sebagai Target',
      busurTime: 'Sesi Asia s/d Setengah Eropa (06:00 - 17:00 WIB)',
      targetTime: 'Setengah Eropa s/d USA (17:00 - 04:00 WIB)',
      isCurrentBusur: wibHour >= 6 && wibHour < 17,
      currentPhase: (wibHour >= 6 && wibHour < 17) ? 'BUSUR' : 'TARGET',
      progress: (wibHour >= 6 && wibHour < 17) ? 'Sesi Busur (06:00 - 17:00 WIB)' : 'Sesi Target & HSH (17:00 - 04:00 WIB)',
    },
    {
      tf: '4h',
      name: '4-Jam (H4)',
      jika: isUp ? 'UP' : 'DOWN',
      busurRule: isUp ? 'H1 ke-1 dan ke-2 DOWN = sebagai Busur' : 'H1 ke-1 dan ke-2 UP = sebagai Busur',
      targetRule: isUp ? 'H1 ke-3 dan ke-4 UP = sebagai Target' : 'H1 ke-3 dan ke-4 DOWN = sebagai Target',
      busurTime: 'Jam ke-1 dan ke-2 dalam candle H4',
      targetTime: 'Jam ke-3 dan ke-4 dalam candle H4',
      isCurrentBusur: (wibHour % 4) < 2,
      currentPhase: (wibHour % 4) < 2 ? 'BUSUR' : 'TARGET',
      progress: `Jam ke-${(wibHour % 4) + 1} dari 4 Jam`,
    },
  ];

  const tfKey = (timeframe || '1h').toLowerCase();
  let matchedSchedule = schedules.find((s) => s.tf.toLowerCase() === tfKey);
  if (!matchedSchedule) {
    if (tfKey === '1h' || tfKey === '30m' || tfKey === '15m' || tfKey === '5m' || tfKey === '1m') {
      matchedSchedule = schedules.find((s) => s.tf === '1d') || schedules[4];
    } else {
      matchedSchedule = schedules[4]; // default 1w
    }
  }

  return {
    activeTimeframe: timeframe,
    trend,
    fundamentalLaw: isUp
      ? 'Hukum Jika UP => Hukum Busur DOWN (Tarik pentangan ke bawah cari Low/Support, lalu lepas anak panah ke Target Resistance)'
      : 'Hukum Jika DOWN => Hukum Busur UP (Tarik pentangan ke atas cari High/Resistance, lalu lepas anak panah ke Target Support)',
    activeSchedule: matchedSchedule,
    allSchedules: schedules,
  };
}

/**
 * 9. KEPUTUSAN ENTRY MULTI-TIMEFRAME (Sinkronisasi TF Besar & TF Kecil)
 * Menggabungkan Hukum JIKA & Hukum Perahu antara TF Besar dan TF Kecil
 */
function calcMultiTfConfluence(htfData, ltfData, currentPrice = 0, decimals = 3) {
  if (!htfData || !ltfData) {
    return {
      available: false,
      summary: 'Menunggu data multi-timeframe...',
    };
  }

  const htfJika = htfData.jika?.trend || 'UP';
  const htfMove = htfData.perahu?.pattern || 'NRL UP';
  const htfTf = htfData.timeframe || 'D1';

  const ltfJika = ltfData.jika?.trend || 'DOWN';
  const ltfMove = ltfData.perahu?.pattern || 'NRL DWN';
  const ltfTf = ltfData.timeframe || '1h';

  const htfPivot = htfData.rsMatrix?.pivot?.value || htfData.rsMatrix?.pivot || 0;
  const htfS1 = htfData.rsMatrix?.s1?.value || htfData.rsMatrix?.s1 || 0;
  const htfR1 = htfData.rsMatrix?.r1?.value || htfData.rsMatrix?.r1 || 0;
  const htfLowBefore = htfData.ohlcv_B?.low || 0;
  const htfHighBefore = htfData.ohlcv_B?.high || 0;

  let correlationStatus = '';
  let safeEntryAction = '';
  let rationale = '';
  let guardrails = [];
  let signalColor = 'amber';

  // Kasus 1 (Contoh User: TF Besar UP + MOVE DN, TF Kecil DN + MOVE DN)
  if (htfJika === 'UP' && (htfMove.includes('DWN') || htfMove.includes('ANL') || htfMove.includes('SDW'))) {
    if (ltfJika === 'DOWN') {
      correlationStatus = `Di TF besar (${htfTf}) harga sedang berada di AREA BUSUR (menuju Support). Di TF kecil (${ltfTf}) harga sedang terpengaruh trend down mengejar target Low Busur TF besar.`;
      safeEntryAction = `Cari Posisi ENTRY SELL berdasarkan TF Kecil (${ltfTf})`;
      rationale = `Entry SELL relatif aman karena searah dengan pergerakan Busur TF besar yang sedang turun menciptakan harga Low.`;
      signalColor = 'red';
      guardrails = [
        `✅ Aman selama Hukum JIKA TF kecil (${ltfTf}) masih DOWN.`,
        `⚠️ Amankan TP sebelum mencapai level Pivot ($${Number(htfPivot).toFixed(decimals)}) atau Support S1 ($${Number(htfS1).toFixed(decimals)}) milik TF besar (${htfTf}).`,
        `🛑 Batas Invalidasi: Selama Low Before milik TF besar ($${Number(htfLowBefore).toFixed(decimals)}) belum ditembus.`,
      ];
    } else {
      correlationStatus = `TF Besar (${htfTf}) di area Busur, namun TF kecil (${ltfTf}) mulai menunjukkan pantulan JIKA UP.`;
      safeEntryAction = `STANDBY / Siap Reversal BUY`;
      rationale = `Pantau apakah pentangan Busur TF besar sudah selesai di area Support.`;
      signalColor = 'amber';
      guardrails = [
        `Konfirmasi jika TF kecil berhasil breakout Resistance R1.`,
        `Pastikan harga tidak menembus Low Before TF besar ($${Number(htfLowBefore).toFixed(decimals)}).`,
      ];
    }
  } else if (htfJika === 'UP' && htfMove.includes('UP')) {
    // Kasus 2: TF Besar UP + MOVE UP (Pelepasan Busur menuju Target R1/R2)
    if (ltfJika === 'UP') {
      correlationStatus = `Konfluensi Bullish Penuh! TF besar (${htfTf}) dan TF kecil (${ltfTf}) kompak bergerak menuju TARGET Resistance.`;
      safeEntryAction = `Cari Posisi ENTRY BUY (Follow Trend)`;
      rationale = `Busur telah dilepaskan. Harga melesat menuju Target Resistance R1/R2 TF besar.`;
      signalColor = 'green';
      guardrails = [
        `✅ Aman selama Hukum JIKA TF kecil (${ltfTf}) masih UP.`,
        `🎯 Target Ambil Untung di R1 ($${Number(htfR1).toFixed(decimals)}) TF besar (${htfTf}).`,
        `🛑 Batas Stop Loss: Di bawah Support S1 TF besar ($${Number(htfS1).toFixed(decimals)}).`,
      ];
    } else {
      correlationStatus = `TF Besar (${htfTf}) Bullish Target, namun TF kecil (${ltfTf}) sedang pullback koreksi.`;
      safeEntryAction = `Tunggu Selesai Pullback di Support TF Kecil untuk Entry BUY`;
      signalColor = 'amber';
      guardrails = [
        `Tunggu konfirmasi JIKA TF kecil berbalik UP.`,
        `Batas toleransi pullback: Pivot TF besar ($${Number(htfPivot).toFixed(decimals)}).`,
      ];
    }
  } else if (htfJika === 'DOWN' && (htfMove.includes('UP') || htfMove.includes('ANL') || htfMove.includes('SDW'))) {
    // Kasus 3: TF Besar DOWN + Busur UP, TF Kecil UP
    if (ltfJika === 'UP') {
      correlationStatus = `Di TF besar (${htfTf}) harga sedang berada di AREA BUSUR ATAS (menuju Resistance). Di TF kecil (${ltfTf}) harga mengejar High Busur TF besar.`;
      safeEntryAction = `Cari Scalping BUY pendek ATAU Siapkan SELL LIMIT di Puncak Busur (R1 TF Besar)`;
      rationale = `TF kecil sedang menyelesaikan pentangan Busur atas sebelum TF besar melanjutkan tren utamanya ke bawah.`;
      signalColor = 'blue';
      guardrails = [
        `✅ Scalp BUY aman selama JIKA TF kecil masih UP.`,
        `⚠️ Siapkan pending order SELL LIMIT di area Resistance R1 ($${Number(htfR1).toFixed(decimals)}) TF besar.`,
        `🛑 Batas Invalidasi: High Before TF besar ($${Number(htfHighBefore).toFixed(decimals)}).`,
      ];
    } else {
      correlationStatus = `TF Besar (${htfTf}) di area Busur atas, namun TF kecil (${ltfTf}) sudah mulai berbalik DOWN.`;
      safeEntryAction = `Entry SELL (Awal Pelepasan Busur Bearish)`;
      signalColor = 'red';
      guardrails = [
        `Konfirmasi tren sell dari puncak Busur.`,
        `Stop Loss di atas High Before TF besar ($${Number(htfHighBefore).toFixed(decimals)}).`,
      ];
    }
  } else {
    // Kasus 4: TF Besar DOWN + MOVE DOWN (Pelepasan Busur menuju Target Support)
    if (ltfJika === 'DOWN') {
      correlationStatus = `Konfluensi Bearish Penuh! TF besar (${htfTf}) dan TF kecil (${ltfTf}) kompak menerjunkan harga ke Target Support.`;
      safeEntryAction = `Cari Posisi ENTRY SELL (Follow Trend)`;
      signalColor = 'red';
      guardrails = [
        `✅ Aman selama Hukum JIKA TF kecil (${ltfTf}) masih DOWN.`,
        `🎯 Target Ambil Untung di Support S1 ($${Number(htfS1).toFixed(decimals)}) / S2 milik TF besar.`,
        `🛑 Batas Stop Loss: Di atas Resistance R1 TF besar ($${Number(htfR1).toFixed(decimals)}).`,
      ];
    } else {
      correlationStatus = `TF Besar (${htfTf}) Bearish Kuat, TF kecil (${ltfTf}) mencoba koreksi minor.`;
      safeEntryAction = `Cari Re-Entry SELL saat koreksi TF kecil mentok di Resistance/Pivot`;
      signalColor = 'amber';
      guardrails = [
        `Tunggu rejection di Resistance TF kecil.`,
        `Target tetap mengarah ke Support TF besar.`,
      ];
    }
  }

  return {
    available: true,
    htf: {
      timeframe: htfTf,
      jika: htfJika,
      move: htfMove,
      pivot: Number(htfPivot).toFixed(decimals),
      s1: Number(htfS1).toFixed(decimals),
      r1: Number(htfR1).toFixed(decimals),
      lowBefore: Number(htfLowBefore).toFixed(decimals),
      highBefore: Number(htfHighBefore).toFixed(decimals),
    },
    ltf: {
      timeframe: ltfTf,
      jika: ltfJika,
      move: ltfMove,
    },
    correlationStatus,
    safeEntryAction,
    rationale,
    guardrails,
    signalColor,
  };
}

/**
 * 10. LEAK 4 REG / NEXTRUMFX MULTI-TIMEFRAME MATRIX TABLE
 * Generates the multi-timeframe OHL comparison table and 9-level R&S matrix
 * matching the NexTrumFX Leak_4_REG_v2.2 dashboard.
 */
function calcLeak4RegMatrix(tfCandlesMap = {}, currentPrice = 4174.50, spreadPoints = 12, decimals = 2) {
  const now = new Date();
  const dayNames = ['MINGGU', 'SENIN', 'SELASA', 'RABU', 'KAMIS', 'JUMAT', 'SABTU'];
  const monthNames = ['JAN', 'PEB', 'MAR', 'APR', 'MEI', 'JUN', 'JUL', 'AGT', 'SEP', 'OKT', 'NOV', 'DES'];

  const currentDayName = dayNames[now.getUTCDay()];
  const currentMonthName = monthNames[now.getUTCMonth()];
  const currentYear = now.getUTCFullYear();
  const currentQuarter = Math.floor(now.getUTCMonth() / 3) + 1;
  const currentSemester = Math.floor(now.getUTCMonth() / 6) + 1;
  const currentWeekOfMonth = Math.min(Math.ceil(now.getUTCDate() / 7), 5);
  const currentWeekLabel = `WEEK_${currentWeekOfMonth}`;

  // 9 Period Definitions as displayed in NexTrumFX
  const rowDefs = [
    { key:'1m',label:'M1' },{ key:'5m',label:'M5' },{ key:'15m',label:'M15' },{ key:'30m',label:'M30' },
    { key: '1h', label: 'HOUR_1' },
    { key: '4h', label: 'HOUR_4' },
    { key: 'market', label: tfCandlesMap.market?.sessionName || 'MARKET' },
    { key: '1d', label: currentDayName },
    { key: '1w', label: currentWeekLabel },
    { key: '1M', label: currentMonthName },
    { key: '3M', label: `QTR_${currentQuarter}` },
    { key: '6M', label: `SMTR_${currentSemester}` },
    { key: '1Y', label: `${currentYear}` },
  ];

  const tableRows = [];
  const rsColumns = [];

  for (const def of rowDefs) {
    const pair = tfCandlesMap[def.key];
    if (!pair?.ohlcv_N || !pair?.ohlcv_B) continue;
    const N = pair.ohlcv_N || { open: currentPrice, high: currentPrice, low: currentPrice, close: currentPrice };
    const B = pair.ohlcv_B || N;

    const openN = Number(N.open || currentPrice);
    const openB = Number(B.open || currentPrice);
    const highN = Number(N.high || currentPrice);
    const highB = Number(B.high || currentPrice);
    const lowN = Number(N.low || currentPrice);
    const lowB = Number(B.low || currentPrice);
    const closeN = Number(N.close || currentPrice);
    const closeB = Number(B.close || currentPrice);

    // DIRECT (Hukum JIKA: UP jika Open_N > Open_B)
    const direct = calcHukumJIKA(N,B).trend;
    const rs = calcRSMatrix(B);
    const {pivot:pivotB,r1:r1B,r2:r2B,r3:r3B,r4:r4B,s1:s1B,s2:s2B,s3:s3B,s4:s4B}=rs;
    const rangeB_val = highB-lowB;

    // OP_PV, R1_HB, S1_LB
    const opPv = openN >= pivotB ? 'ABOVE' : 'BELOW';
    const r1Hb = r1B >= highB ? 'ABOVE' : 'BELOW';
    const s1Lb = s1B >= lowB ? 'ABOVE' : 'BELOW';

    const pattern = calcHukumPerahu(N,B).pattern;
    const move = closeN > openN ? 'UP' : closeN < openN ? 'DOWN' : 'FLAT';
    const track = direct === 'NEUTRAL' || move === 'FLAT' ? 'WAIT' : direct === move ? `TARGET ${move}` : `BUSUR ${move}`;

    // RANGES in points
    const rangeN = Number((highN-lowN).toFixed(decimals));
    const rangeB = Number((highB-lowB).toFixed(decimals));
    const diff = rangeN-rangeB;
    const rangeD = `${diff>=0?'+':'-'} ${Math.abs(diff).toFixed(decimals)}`;
    const crossed = level => lowN<=level && highN>=level;
    const touchedLevels = {
      res4:crossed(r4B),res3:crossed(r3B),res2:crossed(r2B),res1:crossed(r1B),
      pivot:crossed(pivotB),sup1:crossed(s1B),sup2:crossed(s2B),sup3:crossed(s3B),sup4:crossed(s4B),
    };

    const touchedKeys = Object.keys(touchedLevels).filter((k) => touchedLevels[k]);
    const touchedCount = touchedKeys.length;
    const unreachedCount = 9 - touchedCount;

    const touchedLabels = [];
    if (touchedLevels.res4) touchedLabels.push('R4');
    if (touchedLevels.res3) touchedLabels.push('R3');
    if (touchedLevels.res2) touchedLabels.push('R2');
    if (touchedLevels.res1) touchedLabels.push('R1');
    if (touchedLevels.pivot) touchedLabels.push('PV');
    if (touchedLevels.sup1) touchedLabels.push('S1');
    if (touchedLevels.sup2) touchedLabels.push('S2');
    if (touchedLevels.sup3) touchedLabels.push('S3');
    if (touchedLevels.sup4) touchedLabels.push('S4');
    const touchedSummary = touchedLabels.length > 0 ? touchedLabels.join(', ') : 'Belum Ada';

    tableRows.push({
      periodStart:N.timestamp,periodEnd:N.periodEnd,
      timeframe: def.key,
      label: def.label,
      openN: openN.toFixed(decimals),
      openB: openB.toFixed(decimals),
      highN: highN.toFixed(decimals),
      highB: highB.toFixed(decimals),
      lowN: lowN.toFixed(decimals),
      lowB: lowB.toFixed(decimals),
      direct,
      opPv,
      r1Hb,
      s1Lb,
      pattern,
      move,
      track,
      rangeN,
      rangeB,
      rangeD,
      touchedLevels,
      touchedCount,
      unreachedCount,
      touchedSummary,
      touchedLabels,
    });

    // RS Matrix Column
    let rsLabel = def.label;
    if (def.label === currentDayName) rsLabel = 'DAILY';
    else if (def.label === currentMonthName) rsLabel = 'MONTH';
    else if (def.label.startsWith('QTR')) rsLabel = 'QRTR';
    else if (def.label.startsWith('SMTR')) rsLabel = 'SMTR';
    else if (def.label === `${currentYear}`) rsLabel = 'YEAR';
    else if (def.key === 'market') rsLabel = `MARKET · ${pair.sessionName || def.label}`;

    rsColumns.push({
      periodStart:N.timestamp,periodEnd:N.periodEnd,
      timeframe: def.key,
      label: rsLabel,
      openN: openN.toFixed(decimals),
      highN: highN.toFixed(decimals),
      lowN: lowN.toFixed(decimals),
      closeN: closeN.toFixed(decimals),
      openB: openB.toFixed(decimals),
      highB: highB.toFixed(decimals),
      lowB: lowB.toFixed(decimals),
      closeB: closeB.toFixed(decimals),
      res4: r4B.toFixed(decimals),
      res3: r3B.toFixed(decimals),
      res2: r2B.toFixed(decimals),
      res1: r1B.toFixed(decimals),
      pivot: pivotB.toFixed(decimals),
      sup1: s1B.toFixed(decimals),
      sup2: s2B.toFixed(decimals),
      sup3: s3B.toFixed(decimals),
      sup4: s4B.toFixed(decimals),
      touchedLevels,
      touchedCount,
      unreachedCount,
      touchedKeys,
      touchedSummary,
      touchedLabels,
    });
  }

  // Market Sessions Clock calculation
  const getSessionStatus = (startUtc, endUtc, curUtcHour) => {
    if (startUtc < endUtc) {
      return curUtcHour >= startUtc && curUtcHour < endUtc ? 'OPEN' : 'CLOSED';
    } else {
      return curUtcHour >= startUtc || curUtcHour < endUtc ? 'OPEN' : 'CLOSED';
    }
  };

  const utcHour = now.getUTCHours();
  const utcMinute = now.getUTCMinutes();
  const fmtTime = (h, m) => `${String(((h % 24) + 24) % 24).padStart(2, '0')}:${String(m).padStart(2, '0')}`;

  const method=getTradingSession(now.getTime());
  const sessions=[['ASIA',method.sessions.tokyo],['EROPA',method.sessions.london],['USA',method.sessions.newYork]].map(([city,s])=>({city,time:`${s.open}–${s.close} WIB`,status:s.active?'OPEN':'CLOSED'}));
  const market=tfCandlesMap.market;
  // USA HSH must be an actual session Open, never a synthetic midpoint.
  const usa=market?.sessionName==='USA'?market.ohlcv_N:null;
  const hshNewYork=usa?Number(usa.open).toFixed(decimals):'Belum tersedia';

  return {
    tableRows,
    rsColumns,
    sessions,
    hshNewYork,
    currentPrice: Number(currentPrice).toFixed(decimals),
    spreadPoints,
    dateString: `JAKARTA, ${currentDayName} ${now.getUTCDate()} ${monthNames[now.getUTCMonth()]} ${now.getUTCFullYear()} | ${fmtTime(utcHour + 7, utcMinute)} WIB`,
  };
}

module.exports = {
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
};
