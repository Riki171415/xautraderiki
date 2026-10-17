export function instrumentTolerance(symbol){
 const bitcoin=/^BTC(?:USD|USDC)(?:c|m)?$/.test(String(symbol).replace('/',''));
 return bitcoin?{defaultValue:25,values:[0,1,5,10,25,50,100,250],unit:'satuan harga BTC',note:'Batas awal 25 satuan harga BTC; dapat diubah. Bukan 25 point MT5 dan bukan jaminan arah.'}:{defaultValue:0,values:[0,.1,.5,1,2,5],unit:'satuan harga',note:'0 berarti sama pada presisi tampilan. Batas selisih tidak mengubah rumus level.'};
}
