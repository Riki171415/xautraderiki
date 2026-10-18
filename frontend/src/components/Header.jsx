import DataQualityBar from './DataQualityBar';
export default function Header({symbol,timeframe,broker='EXNESS',data,currentPrice,now=Date.now(),onRefresh,onSymbolChange,onTimeframeChange,onBrokerChange,onOpenSources}) {
 const symbols=broker==='BINANCE'?[['PAXG/USDT','PAXG/USDT · Paxos Gold'],['XAUT/USDT','XAUT/USDT · Tether Gold'],['BTC/USDC','BTC/USDC · Bitcoin']]:[['XAUUSD','XAU/USD · Emas'],['BTCUSD','BTC/USD · Bitcoin'],['EURUSD','EUR/USD'],['GBPUSD','GBP/USD']];
 const frames=[['1m','M1'],['5m','M5'],['15m','M15'],['30m','M30'],['1h','H1'],['4h','H4'],['1d','Daily'],['1w','Week'],['1M','Month']];
 return <header className="unified-header">
  <div className="unified-header-controls"><a className="unified-brand" href="#workspace-navigation">COP TAH<small>Analisis lintas timeframe</small></a>
   <label>Sumber<select aria-label="Pilih sumber data" value={broker} onChange={e=>onBrokerChange?.(e.target.value)}><option value="EXNESS">Exness MT5</option><option value="BINANCE">Binance Spot</option></select></label>
   <label>Instrumen<select aria-label="Pilih instrumen" value={symbol} onChange={e=>onSymbolChange?.(e.target.value)}>{symbols.map(([id,label])=><option key={id} value={id}>{label}</option>)}</select></label>
   <label>Timeframe<select aria-label="Pilih timeframe utama" value={timeframe} onChange={e=>onTimeframeChange?.(e.target.value)}>{frames.map(([id,label])=><option key={id} value={id}>{label}</option>)}</select></label>
   <div className="unified-header-actions"><button type="button" onClick={onRefresh}>↻ Perbarui</button><button type="button" onClick={onOpenSources}>Koneksi & bantuan</button></div>
  </div>
  <DataQualityBar data={data} now={now} symbol={symbol} broker={broker} displayPrice={currentPrice}/>
 </header>;
}
