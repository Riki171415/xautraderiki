"""
COP TAH Analytics Dashboard — Exness MT5 Python Direct Bridge
Menghubungkan langsung terminal MetaTrader 5 Exness ke COP TAH Backend via REST API

Persyaratan:
  pip install MetaTrader5 requests

Cara Pakai:
  1. Pastikan aplikasi MetaTrader 5 (Exness) Anda sudah terbuka dan login ke akun pada server Exness yang sesuai.
  2. Jalankan: python exness_mt5_bridge.py
  3. Dashboard COP TAH akan otomatis menerima tick dan candle resmi dari server akun MT5 aktif!
"""

import time
import requests
import sys
import socket
import argparse

# Single-instance protection using a localhost socket
_lock_socket = None
def ensure_single_instance(port=39871):
    global _lock_socket
    try:
        _lock_socket = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
        _lock_socket.bind(('127.0.0.1', port))
    except socket.error:
        print("[INFO] Instance bridge MT5 sudah aktif di latar belakang.")
        sys.exit(0)

try:
    import MetaTrader5 as mt5
except ImportError:
    print("[ERROR] Library MetaTrader5 belum terinstall.")
    print("Silakan jalankan perintah: pip install MetaTrader5 requests")
    sys.exit(1)

BACKEND_URL = "http://localhost:3001/api/mt5/tick"
SYMBOL = "XAUUSD"

# Timeframe mapping MT5 -> Dashboard
TIMEFRAME_MAP = {
    "1m": mt5.TIMEFRAME_M1,
    "5m": mt5.TIMEFRAME_M5,
    "15m": mt5.TIMEFRAME_M15,
    "30m": mt5.TIMEFRAME_M30,
    "1h": mt5.TIMEFRAME_H1,
    "4h": mt5.TIMEFRAME_H4,
    "1d": mt5.TIMEFRAME_D1,
    "1w": mt5.TIMEFRAME_W1,
    "1M": mt5.TIMEFRAME_MN1,
}

def session_identity(info):
    return (getattr(info, 'server', None), getattr(info, 'login', None))


def resolve_symbols():
    resolved = []
    for base in ['XAUUSD', 'BTCUSD', 'EURUSD', 'GBPUSD']:
        choices = [base, base+'m', base+'c'] if base == 'XAUUSD' else [base+'c', base+'m', base]
        name = next((candidate for candidate in choices
                     if mt5.symbol_info(candidate) is not None and mt5.symbol_select(candidate, True)), None)
        if name:
            resolved.append(name)
    return resolved


def read_open_positions(expected_source):
    before = mt5.account_info()
    if session_identity(before) != expected_source:
        return None
    rows = mt5.positions_get()
    positions = []
    if rows is not None:
        for p in rows:
            info = mt5.symbol_info(p.symbol)
            positions.append({
                'ticket': str(p.ticket), 'symbol': p.symbol,
                'side': 'BUY' if p.type == 0 else 'SELL' if p.type == 1 else 'UNKNOWN',
                'volume': float(p.volume), 'priceOpen': float(p.price_open),
                'priceCurrent': float(p.price_current), 'sl': float(p.sl), 'tp': float(p.tp),
                'profit': float(p.profit), 'swap': float(p.swap),
                'openedAt': int(p.time_msc or p.time * 1000),
                'digits': info.digits if info is not None else None,
            })
    after = mt5.account_info()
    if session_identity(after) != expected_source:
        return None
    return {'server': after.server, 'account': after.login, 'currency': after.currency,
            'timestamp': int(time.time() * 1000), 'available': rows is not None,
            'positions': positions}


def main():
    ensure_single_instance()

    parser = argparse.ArgumentParser(description="Exness MT5 Direct Bridge")
    parser.add_argument("--login", type=int, help="Nomor akun Exness MT5 (Login)", default=None)
    parser.add_argument("--password", type=str, help="Password Akun / Investor Password", default=None)
    parser.add_argument("--server", type=str, help="Server Exness MT5 (cth: Exness-MT5Real36)", default=None)
    args = parser.parse_args()
    if (args.login or args.password) and not (args.login and args.password and args.server):
        parser.error("Login eksplisit memerlukan --login, --password dan --server yang sesuai akun.")

    print("=" * 60)
    print("  COP TAH Analytics — Exness MT5 Direct Bridge")
    print("=" * 60)

    # Inisialisasi koneksi ke MetaTrader 5 dengan auto-retry
    while not mt5.initialize():
        print(f"[WAIT] Menunggu terminal MetaTrader 5 Exness terbuka... ({mt5.last_error()})", flush=True)
        time.sleep(3)

    # Jika login dan password diberikan, lakukan login eksplisit
    if args.login and args.password:
        print(f"Mencoba login ke server {args.server} dengan akun #{args.login}...")
        authorized = mt5.login(login=args.login, password=args.password, server=args.server)
        if not authorized:
            print(f"[ERROR] Gagal login ke MT5: {mt5.last_error()}")
            print("Periksa kembali nomor akun, password, dan nama server Anda.")
            return

    # Menunggu pembacaan akun MT5
    account_info = None
    while account_info is None:
        account_info = mt5.account_info()
        if account_info is None:
            print("[WAIT] Menunggu akun MT5 login...", flush=True)
            time.sleep(2)

    server_name = account_info.server
    login = account_info.login
    company = account_info.company

    print(f"[OK] Terhubung ke MT5!")
    print(f"     Server : {server_name}")
    print(f"     Akun   : {login} ({company})")
    print(f"     Target : {BACKEND_URL}")
    print("=" * 60)
    print(f"Mulai streaming tick {SYMBOL} setiap sekitar 0.25 detik (mengikuti tick broker)...\n")

    target_symbols = resolve_symbols()
    if not target_symbols:
        print("[WAIT] Simbol yang didukung belum tersedia pada akun MT5.", flush=True)
    loaded_timeframes = set()
    history_updated = {}
    last_positions_poll = -100
    http = requests.Session()
    while True:
        try:
            term = mt5.terminal_info()
            if term is None or not term.connected:
                print("[WARN] Terminal MT5 terputus dari broker Exness. Menunggu koneksi...", end="\r", flush=True)
                time.sleep(2)
                continue

            current_account = mt5.account_info()
            if current_account is None:
                time.sleep(1)
                continue
            source_changed = session_identity(current_account) != (server_name, login)
            if source_changed or not target_symbols:
                server_name, login = session_identity(current_account)
                target_symbols = resolve_symbols()
                if source_changed:
                    last_positions_poll = -100
                loaded_timeframes.clear()
                history_updated.clear()
                print(f"[SOURCE] Akun/server MT5 berubah; memuat ulang riwayat dari {server_name}.", flush=True)

            # Read-only account positions are independent of the selected chart symbol.
            if time.monotonic() - last_positions_poll >= 3:
                last_positions_poll = time.monotonic()
                positions_snapshot = read_open_positions((server_name, login))
                if positions_snapshot is not None:
                    try:
                        http.post(BACKEND_URL.rsplit('/', 1)[0] + '/positions', json=positions_snapshot, timeout=2)
                    except requests.exceptions.RequestException:
                        pass
            for target_symbol in target_symbols:
                digits=mt5.symbol_info(target_symbol).digits
                # Ambil live tick
                tick = mt5.symbol_info_tick(target_symbol)
                if tick is None:
                    time.sleep(1)
                    continue

                # Jika tick lebih tua dari 120 detik, pasar mungkin tutup atau libur
                if time.time() - tick.time > 120:
                    print(f"[WARN] Pasar {target_symbol} mungkin sedang tutup/libur (tick terakhir {int(time.time() - tick.time)}s lalu)", end="\r", flush=True)

                bid = float(tick.bid)
                ask = float(tick.ask)
                price = round((bid + ask) / 2.0, digits)
                spread = round(ask - bid, digits)

                # Refresh candle history separately; lightweight tick posts run faster.
                timeframes = None
                if time.monotonic() - history_updated.get(target_symbol, -100) >= 3:
                    timeframes = {}
                    for tf, mt5_tf in TIMEFRAME_MAP.items():
                        count = 240 if tf in ['1h','1M'] else 50
                        rates = mt5.copy_rates_from_pos(target_symbol, mt5_tf, 0, count)
                        if rates is not None and len(rates) >= 2:
                            if (target_symbol,tf) not in loaded_timeframes:
                                print(f'[READY] {tf}: {len(rates)} bars', flush=True)
                                loaded_timeframes.add((target_symbol,tf))
                            timeframes[tf] = [
                                [int(r['time']) * 1000, float(r['open']), float(r['high']),
                                 float(r['low']), float(r['close']), int(r['tick_volume'])]
                                for r in rates
                            ]

                    history_updated[target_symbol] = time.monotonic()
                # History reads can take time: sample price again immediately before sending.
                tick = mt5.symbol_info_tick(target_symbol)
                if tick is None:
                    continue
                bid, ask = float(tick.bid), float(tick.ask)
                price = round((bid + ask) / 2.0, digits)
                spread = round(ask - bid, digits)

                # Do not label old-account history with a newly selected account/server.
                if session_identity(mt5.account_info()) != (server_name, login):
                    break
                active_terminal = mt5.terminal_info()
                if active_terminal is None or not active_terminal.connected:
                    break
                payload = {
                    "broker": "EXNESS",
                    "server": server_name,
                    "account": login,
                    "symbol": target_symbol,
                    "bid": bid,
                    "ask": ask,
                    "price": price,
                    "spread": spread,
                    "timeframe": "1h",
                    "digits": digits,
                    "tickTimestamp": int(tick.time_msc),
                    "timestamp": int(time.time() * 1000),
                }

                if timeframes is not None:
                    payload['timeframes'] = timeframes
                resp = http.post(BACKEND_URL, json=payload, timeout=2)
                if resp.status_code == 200:
                    print(f"[STREAM] {server_name} | {target_symbol}: Bid={bid:.2f} Ask={ask:.2f} Mid={price:.2f} Spread={spread:.2f} -> OK", end="\r", flush=True)

        except requests.exceptions.RequestException:
            print("[RETRY] Menunggu backend COP TAH (http://localhost:3001)...", end="\r", flush=True)
        except Exception as e:
            print(f"\n[ERROR] {e}")

        time.sleep(0.25)

if __name__ == "__main__":
    try:
        main()
    except KeyboardInterrupt:
        print("\n[INFO] Menutup koneksi MT5...")
        try:
            mt5.shutdown()
        except:
            pass
