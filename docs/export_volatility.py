import MetaTrader5 as mt5,json
from datetime import datetime,timezone
if not mt5.initialize(): raise RuntimeError(mt5.last_error())
symbol='XAUUSDc'
rows=mt5.copy_rates_from_pos(symbol,mt5.TIMEFRAME_H1,1,12000)
if rows is None: raise RuntimeError(mt5.last_error())
valid=[{k:int(r[k]) if k in ['time','tick_volume','spread'] else float(r[k]) for k in ['time','open','high','low','close','tick_volume','spread']} for r in rows if r['low']<=min(r['open'],r['close'])<=max(r['open'],r['close'])<=r['high']]
with open('docs/exness-h1-volatility-source.json','w') as f: json.dump({'symbol':symbol,'source':'MT5 Exness','retrievedAt':datetime.now(timezone.utc).isoformat(),'bars':valid},f)
print(json.dumps({'count':len(valid),'rejected':len(rows)-len(valid),'first':datetime.fromtimestamp(valid[0]['time'],timezone.utc).isoformat(),'last':datetime.fromtimestamp(valid[-1]['time'],timezone.utc).isoformat()}))
mt5.shutdown()
