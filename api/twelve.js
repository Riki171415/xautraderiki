const {twelveRows}=require('../backend/twelve_data');
module.exports=async function(req,res){
 if(req.method!=='GET')return res.status(405).json({success:false,error:'GET saja.'});
 try {const rows=await twelveRows(req.query.timeframe||'1h');res.setHeader('Cache-Control','s-maxage=60, stale-while-revalidate=0');return res.status(200).json({success:true,source:'Twelve Data · XAU/USD',data:rows});}
 catch(error){return res.status(error.status||502).json({success:false,error:error.message});}
};
