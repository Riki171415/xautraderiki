//+------------------------------------------------------------------+
//|                                     CopTah_Exness_Bridge.mq5     |
//|                    COP TAH Analytics Dashboard — Exness Bridge    |
//|               Streams 100% Real-Time MT5 Ticks & Candles to Node  |
//+------------------------------------------------------------------+
#property copyright "COP TAH Analytics"
#property link      "http://localhost:3001"
#property version   "1.00"
#property description "Kirim harga realtime XAUUSD dari Exness-MT5Real36 ke COP TAH Dashboard"

//--- Inputs
input string   InpServerUrl     = "http://localhost:3001/api/mt5/tick"; // Backend API URL
input int      InpTimerSeconds  = 1;                                     // Interval Streaming (detik)
input string   InpSymbolOverride= "";                                    // Symbol override (kosongkan = otomatis)

//--- Global variables
datetime g_last_send_time = 0;
double   g_last_bid = 0;
double   g_last_ask = 0;

//+------------------------------------------------------------------+
//| Expert initialization function                                   |
//+------------------------------------------------------------------+
int OnInit()
{
   EventSetTimer(InpTimerSeconds);
   Print("[COP TAH] Exness MT5 Bridge aktif pada server: ", AccountInfoString(ACCOUNT_SERVER));
   Print("[COP TAH] Target Dashboard: ", InpServerUrl);
   Print("[COP TAH] Pastikan http://localhost:3001 diizinkan di Tools > Options > Expert Advisors > Allow WebRequest");
   
   // Kirim tick pertama saat startup
   SendTickData();
   return(INIT_SUCCEEDED);
}

//+------------------------------------------------------------------+
//| Expert deinitialization function                                 |
//+------------------------------------------------------------------+
void OnDeinit(const int reason)
{
   EventKillTimer();
   Print("[COP TAH] Exness MT5 Bridge dinonaktifkan. Reason: ", reason);
}

//+------------------------------------------------------------------+
//| Expert tick function                                             |
//+------------------------------------------------------------------+
void OnTick()
{
   // Kirim data jika harga bergerak
   double current_bid = SymbolInfoDouble(_Symbol, SYMBOL_BID);
   double current_ask = SymbolInfoDouble(_Symbol, SYMBOL_ASK);
   
   if(current_bid != g_last_bid || current_ask != g_last_ask)
   {
      SendTickData();
   }
}

//+------------------------------------------------------------------+
//| Timer function (Menjamin pengiriman setiap 1 detik)              |
//+------------------------------------------------------------------+
void OnTimer()
{
   SendTickData();
}

//+------------------------------------------------------------------+
//| Format Timeframe Period ke String yang dikenal Node.js           |
//+------------------------------------------------------------------+
string PeriodToTfString(ENUM_TIMEFRAMES period)
{
   switch(period)
   {
      case PERIOD_M1:  return "1m";
      case PERIOD_M5:  return "5m";
      case PERIOD_M15: return "15m";
      case PERIOD_M30: return "30m";
      case PERIOD_H1:  return "1h";
      case PERIOD_H4:  return "4h";
      case PERIOD_D1:  return "1d";
      case PERIOD_W1:  return "1w";
      case PERIOD_MN1: return "1M";
      default:         return "1h";
   }
}

//+------------------------------------------------------------------+
//| Fungsi Kirim Tick & Data Candle ke COP TAH Backend               |
//+------------------------------------------------------------------+
void SendTickData()
{
   string sym = (InpSymbolOverride != "") ? InpSymbolOverride : _Symbol;
   
   double bid = SymbolInfoDouble(sym, SYMBOL_BID);
   double ask = SymbolInfoDouble(sym, SYMBOL_ASK);
   if(bid <= 0 || ask <= 0) return;
   
   double spread = ask - bid;
   double mid_price = (bid + ask) / 2.0;
   
   g_last_bid = bid;
   g_last_ask = ask;
   
   string server_name = AccountInfoString(ACCOUNT_SERVER); // Otomatis 'Exness-MT5Real36'
   long account_login = AccountInfoInteger(ACCOUNT_LOGIN);
   string tf_str = PeriodToTfString(_Period);
   
   // Ambil 30 Candle terakhir dari Exness MT5
   MqlRates rates[];
   ArraySetAsSeries(rates, true);
   int copied = CopyRates(sym, _Period, 0, 30, rates);
   
   // Susun JSON string secara manual
   string json_candles = "[";
   if(copied > 0)
   {
      // Urutkan dari terlama ke terbaru (chronological)
      for(int i = copied - 1; i >= 0; i--)
      {
         long ts = (long)rates[i].time * 1000;
         string c_str = StringFormat("[%I64d,%.2f,%.2f,%.2f,%.2f,%I64d]",
            ts, rates[i].open, rates[i].high, rates[i].low, rates[i].close, rates[i].tick_volume);
         json_candles += c_str;
         if(i > 0) json_candles += ",";
      }
   }
   json_candles += "]";
   
   // Candle N (saat ini) dan Candle B (sebelumnya)
   string candle_n = "{}";
   string candle_b = "{}";
   if(copied >= 2)
   {
      candle_n = StringFormat("{\"open\":%.2f,\"high\":%.2f,\"low\":%.2f,\"close\":%.2f,\"volume\":%I64d,\"timestamp\":%I64d}",
         rates[0].open, rates[0].high, rates[0].low, rates[0].close, rates[0].tick_volume, (long)rates[0].time * 1000);
      candle_b = StringFormat("{\"open\":%.2f,\"high\":%.2f,\"low\":%.2f,\"close\":%.2f,\"volume\":%I64d,\"timestamp\":%I64d}",
         rates[1].open, rates[1].high, rates[1].low, rates[1].close, rates[1].tick_volume, (long)rates[1].time * 1000);
   }

   string payload = StringFormat(
      "{\"broker\":\"EXNESS\",\"server\":\"%s\",\"account\":%I64d,\"symbol\":\"%s\",\"bid\":%.2f,\"ask\":%.2f,\"price\":%.2f,\"spread\":%.2f,\"timeframe\":\"%s\",\"ohlcv_N\":%s,\"ohlcv_B\":%s,\"candles\":%s,\"timestamp\":%I64d}",
      server_name, account_login, sym, bid, ask, mid_price, spread, tf_str, candle_n, candle_b, json_candles, (long)TimeCurrent() * 1000
   );

   char post_data[];
   StringToCharArray(payload, post_data, 0, WHOLE_ARRAY, CP_UTF8);
   int post_size = ArraySize(post_data) - 1; // buang null terminator
   
   string headers = "Content-Type: application/json\r\n";
   char result[];
   string result_headers;
   
   int res = WebRequest("POST", InpServerUrl, headers, 1000, post_data, result, result_headers);
   if(res == -1)
   {
      int err = GetLastError();
      if(err == 4060)
      {
         Print("[COP TAH ERROR 4060] URL belum diizinkan. Silakan buka Tools > Options > Expert Advisors > centang 'Allow WebRequest for listed URL' dan tambahkan http://localhost:3001");
      }
   }
}
//+------------------------------------------------------------------+
