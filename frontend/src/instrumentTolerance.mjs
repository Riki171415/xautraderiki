export function instrumentTolerance(symbol){
 if(/^(EURUSD|GBPUSD)(?:c|m)?$/i.test(String(symbol).replace('/','')))return {defaultValue:0,values:[0,.00001,.00005,.0001,.00025,.0005,.001],unit:'satuan harga forex',note:'Batas selisih dalam harga forex, bukan pip. Tidak mengubah rumus level.'};
 const bitcoin=/^BTC(?:USD|USDC)(?:c|m)?$/.test(String(symbol).replace('/',''));
 return bitcoin?{defaultValue:25,values:[0,1,5,10,25,50,75,100,250],unit:'satuan harga BTC',note:'Batas awal 25 satuan harga BTC; dapat diubah. Bukan 25 point MT5 dan bukan jaminan arah.'}:{defaultValue:0,values:[0,.1,.5,1,2,5],unit:'satuan harga',note:'0 berarti sama pada presisi tampilan. Batas selisih tidak mengubah rumus level.'};
}
