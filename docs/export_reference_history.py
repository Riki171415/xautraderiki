"""Read-only MT5 history export into ignored cache; never login or send orders."""
from pathlib import Path
from datetime import datetime, timezone
import json, MetaTrader5 as mt5

out=Path(__file__).resolve().parents[1]/'.cache'/'reference-history'
out.mkdir(parents=True,exist_ok=True)
end=datetime.now(timezone.utc)
start=end.replace(year=end.year-10)
if not mt5.initialize(timeout=10000):raise RuntimeError('MT5 unavailable')
try:
 server=mt5.account_info().server
 for base in ['XAUUSD','EURUSD','GBPUSD']:
  symbol=next((s for s in [base+'c',base+'m',base] if mt5.symbol_info(s) is not None),None)
  if not symbol:continue
  info=mt5.symbol_info(symbol)
  for tf,code in [('1h',mt5.TIMEFRAME_H1),('4h',mt5.TIMEFRAME_H4),('1d',mt5.TIMEFRAME_D1),('1w',mt5.TIMEFRAME_W1),('1M',mt5.TIMEFRAME_MN1),('30m',mt5.TIMEFRAME_M30),('15m',mt5.TIMEFRAME_M15)]:
   rows=mt5.copy_rates_range(symbol,code,start,end)
   fallback=False
   if rows is None or not len(rows):
    rows=mt5.copy_rates_from_pos(symbol,code,0,90000 if tf in ['1h','30m','15m'] else 5000)
    fallback=True
   bars=[] if rows is None else [[int(r['time'])*1000,float(r['open']),float(r['high']),float(r['low']),float(r['close']),int(r['tick_volume'])] for r in rows if start.timestamp()<=int(r['time'])<end.timestamp()]
   data={'symbol':base,'sourceSymbol':symbol,'server':server,'digits':info.digits,'requestedStart':start.isoformat(),'requestedEnd':end.isoformat(),'retrievedAt':end.isoformat(),'timeframe':tf,'fallback':fallback,'bars':bars}
   (out/(base+'-'+tf+'.json')).write_text(json.dumps(data),encoding='utf-8')
   print(json.dumps({'symbol':base,'tf':tf,'count':len(bars),'first':bars[0][0] if bars else None,'last':bars[-1][0] if bars else None}),flush=True)
finally:mt5.shutdown()
