import json,statistics as st
from datetime import datetime,timezone,timedelta
from collections import defaultdict
from pathlib import Path
source=json.loads(Path('docs/exness-h1-volatility-source.json').read_text()); rows=source['bars']; latest=max(r['time'] for r in rows)
def summarize(data):
 groups=defaultdict(list)
 for r in data:
  dt=datetime.fromtimestamp(r['time'],timezone.utc)+timedelta(hours=7)
  groups[dt.hour].append(r)
 out=[]
 for hour,rs in groups.items():
  spans=[r['high']-r['low'] for r in rs]; pcts=[100*(r['high']-r['low'])/r['open'] for r in rs]
  out.append({'hour':hour,'n':len(rs),'medianRange':round(st.median(spans),3),'meanRange':round(st.mean(spans),3),'medianPct':round(st.median(pcts),4),'meanPct':round(st.mean(pcts),4),'medianSpreadPoints':st.median(r['spread'] for r in rs)})
 return sorted(out,key=lambda r:r['medianPct'],reverse=True)
result={'source':source['source'],'symbol':source['symbol'],'bars':len(rows),'first':datetime.fromtimestamp(rows[0]['time'],timezone.utc).isoformat(),'last':datetime.fromtimestamp(latest,timezone.utc).isoformat(),'all':summarize(rows),'recent90':summarize([r for r in rows if r['time']>=latest-90*86400]),'recent30':summarize([r for r in rows if r['time']>=latest-30*86400])}
Path('docs/exness-hourly-volatility.json').write_text(json.dumps(result,indent=2))
print(json.dumps(result,indent=2))
