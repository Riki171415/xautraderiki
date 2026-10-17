"""
COP TAH Analytics Dashboard — Exness MT5 Python Direct Bridge
Menghubungkan langsung terminal MetaTrader 5 (Exness-MT5Real36) ke COP TAH Backend via REST API

Persyaratan:
  pip install MetaTrader5 requests

Cara Pakai:
  1. Pastikan aplikasi MetaTrader 5 (Exness) Anda sudah terbuka dan login ke akun MT5Real36.
  2. Jalankan: python exness_mt5_bridge.py
  3. Dashboard COP TAH akan otomatis menerima tick dan candle resmi dari Exness-MT5Real36!
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

def main():
    ensure_single_instance()

    parser = argparse.ArgumentParser(description="Exness MT5 Direct Bridge")
    parser.add_argument("--login", type=int, help="Nomor akun Exness MT5 (Login)", default=None)
    parser.add_argument("--password", type=str, help="Password Akun / Investor Password", default=None)
    parser.add_argument("--server", type=str, help="Server Exness MT5 (cth: Exness-MT5Real36)", default="Exness-MT5Real36")
    args = parser.parse_args()

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
    print(f"Mulai streaming tick {SYMBOL} setiap 1.0 detik...\n")

    # Resolve the exact broker symbol, including Standard Cent suffixes.
    candidates = [SYMBOL, 'XAUUSDm', 'XAUUSDc']
    candidates += [item.name for item in (mt5.symbols_get('*XAUUSD*') or [])]
    target_symbol = next((name for name in dict.fromkeys(candidates) if mt5.symbol_select(name, True)), None)
    if not target_symbol:
        print('[ERROR] Simbol emas tidak tersedia pada akun MT5 ini.')
        mt5.shutdown()
        return
    digits = mt5.symbol_info(target_symbol).digits
    print(f'[OK] Broker symbol: {target_symbol}, digits: {digits}')

    target_symbols=[target_symbol]
    for extra in ['BTCUSDc','BTCUSDm','BTCUSD']:
        if mt5.symbol_info(extra) is not None and mt5.symbol_select(extra,True):
            target_symbols.append(extra)
            break
    loaded_timeframes = set()
    while True:
        try:
            term = mt5.terminal_info()
            if term is None or not term.connected:
                print("[WARN] Terminal MT5 terputus dari broker Exness. Menunggu koneksi...", end="\r", flush=True)
                time.sleep(2)
                continue

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

                # Keep every native timeframe tied to the exact broker instrument.
                timeframes = {}
                for tf, mt5_tf in TIMEFRAME_MAP.items():
                    count = 120 if tf == '1M' else 50
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
                candles_list = timeframes.get('1h', [])

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
                    "timeframes": timeframes,
                    "digits": digits,
                    "tickTimestamp": int(tick.time_msc),
                    "candles": candles_list,
                    "timestamp": int(time.time() * 1000),
                }

                resp = requests.post(BACKEND_URL, json=payload, timeout=5)
                if resp.status_code == 200:
                    print(f"[STREAM] {server_name} | {target_symbol}: Bid={bid:.2f} Ask={ask:.2f} Mid={price:.2f} Spread={spread:.2f} -> OK", end="\r", flush=True)

        except requests.exceptions.RequestException:
            print("[RETRY] Menunggu backend COP TAH (http://localhost:3001)...", end="\r", flush=True)
        except Exception as e:
            print(f"\n[ERROR] {e}")

        time.sleep(1.0)

if __name__ == "__main__":
    try:
        main()
    except KeyboardInterrupt:
        print("\n[INFO] Menutup koneksi MT5...")
        try:
            mt5.shutdown()
        except:
            pass
