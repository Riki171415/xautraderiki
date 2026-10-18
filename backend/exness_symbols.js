function exnessSymbolKey(symbol) {
 if(symbol==='XAU/USDT:USDT')return 'XAUUSD';
 const match=String(symbol||'').match(/^(XAUUSD|BTCUSD|EURUSD|GBPUSD)(?:c|m)?$/i);
 return match?match[1].toUpperCase():null;
}
module.exports={exnessSymbolKey};
