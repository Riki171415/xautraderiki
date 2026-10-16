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

import argparse

def main():
    parser = argparse.ArgumentParser(description="Exness MT5 Direct Bridge")
    parser.add_argument("--login", type=int, help="Nomor akun Exness MT5 (Login)", default=None)
    parser.add_argument("--password", type=str, help="Password Akun / Investor Password", default=None)
    parser.add_argument("--server", type=str, help="Server Exness MT5 (cth: Exness-MT5Real36)", default="Exness-MT5Real36")
    args = parser.parse_args()

    print("=" * 60)
    print("  COP TAH Analytics — Exness MT5 Direct Bridge")
    print("=" * 60)

    # Inisialisasi koneksi ke MetaTrader 5 yang sedang berjalan di Windows
    if not mt5.initialize():
        print(f"[ERROR] Gagal inisialisasi MT5: {mt5.last_error()}")
        print("Pastikan aplikasi MetaTrader 5 Exness Anda sudah terinstall dan terbuka di komputer ini.")
        return

    # Jika login dan password diberikan, lakukan login eksplisit
    if args.login and args.password:
        print(f"Mencoba login ke server {args.server} dengan akun #{args.login}...")
        authorized = mt5.login(login=args.login, password=args.password, server=args.server)
        if not authorized:
            print(f"[ERROR] Gagal login ke MT5: {mt5.last_error()}")
            print("Periksa kembali nomor akun, password, dan nama server Anda.")
            return

    account_info = mt5.account_info()
    if account_info is None:
        print("[ERROR] Tidak dapat membaca akun MT5.")
        return

    server_name = account_info.server
    login = account_info.login
    company = account_info.company

    print(f"[OK] Terhubung ke MT5!")
    print(f"     Server : {server_name}")
    print(f"     Akun   : {login} ({company})")
    print(f"     Target : {BACKEND_URL}")
    print("=" * 60)
    print(f"Mulai streaming tick {SYMBOL} setiap 1.0 detik...\n")

    # Pastikan simbol aktif di Market Watch
    if not mt5.symbol_select(SYMBOL, True):
        # Coba simbol varian Exness seperti XAUUSDm
        alt_sym = "XAUUSDm"
        if mt5.symbol_select(alt_sym, True):
            target_symbol = alt_sym
        else:
            print(f"[WARNING] Simbol {SYMBOL} tidak ditemukan. Menggunakan {SYMBOL}")
            target_symbol = SYMBOL
    else:
        target_symbol = SYMBOL

    while True:
        try:
            # Ambil live tick
            tick = mt5.symbol_info_tick(target_symbol)
            if tick is None:
                time.sleep(1)
                continue

            bid = float(tick.bid)
            ask = float(tick.ask)
            price = round((bid + ask) / 2.0, 2)
            spread = round(ask - bid, 2)

            # Ambil candle H1 untuk analisis
            rates = mt5.copy_rates_from_pos(target_symbol, mt5.TIMEFRAME_H1, 0, 30)
            candles_list = []
            ohlcv_N = None
            ohlcv_B = None

            if rates is not None and len(rates) >= 2:
                for r in rates:
                    ts = int(r['time']) * 1000
                    candles_list.append([ts, float(r['open']), float(r['high']), float(r['low']), float(r['close']), int(r['tick_volume'])])

                # Candle N (terakhir) dan Candle B (sebelumnya)
                last_r = rates[-1]
                prev_r = rates[-2]
                ohlcv_N = {
                    "open": float(last_r['open']),
                    "high": float(last_r['high']),
                    "low": float(last_r['low']),
                    "close": float(last_r['close']),
                    "volume": int(last_r['tick_volume']),
                    "timestamp": int(last_r['time']) * 1000,
                }
                ohlcv_B = {
                    "open": float(prev_r['open']),
                    "high": float(prev_r['high']),
                    "low": float(prev_r['low']),
                    "close": float(prev_r['close']),
                    "volume": int(prev_r['tick_volume']),
                    "timestamp": int(prev_r['time']) * 1000,
                }

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
                "ohlcv_N": ohlcv_N,
                "ohlcv_B": ohlcv_B,
                "candles": candles_list,
                "timestamp": int(time.time() * 1000),
            }

            resp = requests.post(BACKEND_URL, json=payload, timeout=2)
            if resp.status_code == 200:
                print(f"[STREAM] {server_name} | {target_symbol}: Bid={bid:.2f} Ask={ask:.2f} Mid={price:.2f} Spread={spread:.2f} -> OK", end="\r")

        except Exception as e:
            print(f"\n[ERROR] {e}")

        time.sleep(1.0)

if __name__ == "__main__":
    main()
