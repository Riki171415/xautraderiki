"""Verify the freshly built payload and its embedded copy without installing it."""
from pathlib import Path
import hashlib,json,sys,zipfile
root=Path(__file__).resolve().parents[1]
manifest=json.loads((root/'installers/COP-TAH-Windows-build.json').read_text(encoding='utf-8'))
exe=root/'installers/COP-TAH-Windows-x64-Setup.exe'
assert hashlib.sha256(exe.read_bytes()).hexdigest()==manifest['sha256'],'Installer checksum mismatch'
stage=root/'windows-desktop/build'/sys.argv[1]
payload=stage/'payload.zip'
with zipfile.ZipFile(payload) as z:
 assert z.testzip() is None,'Payload CRC failed'
 info=json.loads(z.read('build-info.json'))
 assert info['version']==manifest['version']=='1.2.11'
 assert info['contentSha256']==manifest['contentSha256']
 for name,digest in info['contentSha256'].items():
  assert hashlib.sha256(z.read(name)).hexdigest()==digest,name
  assert hashlib.sha256((root/name).read_bytes()).hexdigest()==digest,'Stale packaged source: '+name
 js=b'\n'.join(z.read(n) for n in z.namelist() if n.startswith('frontend/dist/assets/') and n.endswith('.js'))
 css=b'\n'.join(z.read(n) for n in z.namelist() if n.startswith('frontend/dist/assets/') and n.endswith('.css'))
 assert 'SUP KUAT'.encode() in js and 'Pantauan area support'.encode() in js
 assert b'display:table-cell' in css and b'text-overflow:clip' in css
 assert b'supportHistory' in z.read('backend/server.js')
 assert 'Otomatis mengikuti MT5'.encode() in js and 'Pilih server Exness'.encode() in js
 assert b'sourceSession' in z.read('backend/server.js')
 assert b'session_identity(mt5.account_info())' in z.read('exness_mt5_bridge.py')
 assert b'strengthReferences' in z.read('backend/rule_engine.js') and b'referenceTf' in js
 assert b'MEMANTUL NAIK' in js and b'ARAH BELUM JELAS' in js and b'Alasan & rincian' in js
 assert b'Posisi terbuka MT5' in js and b'/mt5/positions' in js
 assert 'Market Berbisik'.encode() in js and 'Syarat belum muncul'.encode() in js
 assert 'USA sekarang vs USA sebelumnya'.encode() in js
 assert b'usaComparison' in z.read('backend/market_habits.js')
 assert b'PREVIOUS_WEEKDAY' in js and b'usesWeekdayDailyBefore' in z.read('backend/mt5_data.js')
 assert b'BROKER_DAILY' in js and b'BROKER_DAILY' in z.read('backend/market_cycle.js')
 assert 'backend/mt5_positions.js' in z.namelist()
 assert b'positions_get()' in z.read('exness_mt5_bridge.py') and b'order_send' not in z.read('exness_mt5_bridge.py')
 assert 'docs/PERBAIKAN_SUPPORT_UJI_10_TAHUN.md' in z.namelist()
 assert exe.read_bytes().find(payload.read_bytes())>=0,'Embedded payload differs from verified payload'
 print(json.dumps({'version':info['version'],'files':len(z.namelist()),'payloadCRC':'OK','sourceHashes':'OK','embeddedPayload':'OK','sizeMB':round(exe.stat().st_size/1048576,1)},indent=2))
