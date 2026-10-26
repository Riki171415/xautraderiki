import MetaTrader5 as m,json
from datetime import datetime,timezone,timedelta
from pathlib import Path
if not m.initialize(timeout=10000): raise RuntimeError(m.last_error())
try:
 symbol='XAUUSDc'
 end=datetime(2026,10,21,tzinfo=timezone.utc)
 start=datetime(2016,10,20,tzinfo=timezone.utc)
 report={}
 for name,tf,since in [('d1',m.TIMEFRAME_D1,start),('mn1',m.TIMEFRAME_MN1,datetime(2015,9,1,tzinfo=timezone.utc)),('h1',m.TIMEFRAME_H1,start),('h4',m.TIMEFRAME_H4,datetime(2016,10,1,tzinfo=timezone.utc)),('w1',m.TIMEFRAME_W1,datetime(2016,10,1,tzinfo=timezone.utc)),('m1',m.TIMEFRAME_M1,end-timedelta(days=60))]:
  rows=m.copy_rates_range(symbol,tf,since,end)
  error=m.last_error()
  if rows is None or len(rows)==0:
   rows=m.copy_rates_from_pos(symbol,tf,0,90000 if name in ['h1','m1'] else 4000)
  if rows is None or len(rows)==0:
   report[name]={'error':str(error),'fallbackError':str(m.last_error())};print(name,report[name],flush=True);continue
  bars=[{k:int(r[k]) if k in ['time','tick_volume','spread'] else float(r[k]) for k in ['time','open','high','low','close','tick_volume','spread']} for r in rows if int(r['time'])>=since.timestamp() and int(r['time'])<end.timestamp()]
  payload={'symbol':symbol,'source':'MT5 Exness','requestedFrom':since.isoformat(),'requestedTo':end.isoformat(),'retrievedAt':datetime.now(timezone.utc).isoformat(),'timeframe':name,'bars':bars}
  Path(f'docs/exness-support-audit-{name}.json').write_text(json.dumps(payload))
  report[name]={'count':len(bars),'first':datetime.fromtimestamp(bars[0]['time'],timezone.utc).isoformat() if bars else None,'last':datetime.fromtimestamp(bars[-1]['time'],timezone.utc).isoformat() if bars else None}
  print(name,report[name],flush=True)
 Path('docs/exness-support-history-coverage.json').write_text(json.dumps(report,indent=2))
finally:m.shutdown()
