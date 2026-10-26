function normalizePositions(payload,now=Date.now()){
 if(!payload||typeof payload.available!=='boolean'||typeof payload.server!=='string'||!payload.server.trim()||payload.server.length>100||!Number.isSafeInteger(payload.account)||payload.account<=0||!Number.isFinite(payload.timestamp)||payload.timestamp>now+5000||now-payload.timestamp>15000)throw new Error('Snapshot posisi MT5 tidak valid atau kedaluwarsa.');
 if(typeof payload.currency!=='string'||!/^[A-Za-z0-9]{1,12}$/.test(payload.currency))throw new Error('Mata uang akun belum tersedia.');
 if(!payload.available)return {available:false,positions:[],currency:payload.currency,updatedAt:payload.timestamp,error:'Daftar posisi belum dapat dibaca dari MT5.'};
 if(!Array.isArray(payload.positions)||payload.positions.length>5000)throw new Error('Daftar posisi tidak valid.');
 const tickets=new Set();
 const positions=payload.positions.map(p=>{
  if(!p||typeof p.ticket!=='string'||!/^\d{1,24}$/.test(p.ticket)||tickets.has(p.ticket)||!['BUY','SELL'].includes(p.side)||typeof p.symbol!=='string'||!p.symbol||p.symbol.length>80)throw new Error('Identitas posisi tidak valid.');
  tickets.add(p.ticket);
  for(const k of ['volume','priceOpen','priceCurrent','sl','tp','profit','swap','openedAt'])if(typeof p[k]!=='number'||!Number.isFinite(p[k]))throw new Error('Nilai posisi belum lengkap.');
  if(p.volume<=0||p.priceOpen<=0||p.priceCurrent<=0||p.sl<0||p.tp<0||p.openedAt<=0||p.openedAt>now+5000)throw new Error('Harga/waktu posisi tidak valid.');
  const digits=Number.isInteger(p.digits)&&p.digits>=0&&p.digits<=10?p.digits:null;
  return {ticket:p.ticket,symbol:p.symbol,side:p.side,volume:p.volume,priceOpen:p.priceOpen,priceCurrent:p.priceCurrent,sl:p.sl||null,tp:p.tp||null,profit:p.profit,swap:p.swap,openedAt:p.openedAt,digits};
 });
 return {available:true,positions,currency:payload.currency,updatedAt:payload.timestamp,error:null};
}
function positionsView(snapshot,sourceSession,now=Date.now()){
 const fresh=!!snapshot&&snapshot.sourceSession===sourceSession&&now-snapshot.updatedAt<=15000&&snapshot.updatedAt<=now+5000;
 return {success:true,available:fresh&&snapshot.available===true,stale:!!snapshot&&!fresh,server:snapshot?.server||null,sourceSession:snapshot?.sourceSession||null,currency:snapshot?.currency||null,updatedAt:snapshot?.updatedAt||null,positions:fresh&&snapshot.available?snapshot.positions:[],profit:fresh&&snapshot.available?snapshot.positions.reduce((n,p)=>n+p.profit,0):null,swap:fresh&&snapshot.available?snapshot.positions.reduce((n,p)=>n+p.swap,0):null,error:!fresh?'Menunggu snapshot posisi MT5 yang segar.':snapshot.error};
}
function isLocalPositionRequest(remote,host,origin){
 const local=['localhost','127.0.0.1','[::1]'];
 try{return ['127.0.0.1','::1','::ffff:127.0.0.1'].includes(remote)&&local.includes(new URL('http://'+host).hostname)&&(!origin||local.includes(new URL(origin).hostname));}catch{return false;}
}
module.exports={normalizePositions,positionsView,isLocalPositionRequest};
