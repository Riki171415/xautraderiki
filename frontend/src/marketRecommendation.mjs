export function marketRecommendation(data) {
 const e=data?.marketEntry;
 if(!e?.current || !e?.previous || !e?.plan || !e?.rs) return null;
 const text=i=>e.analysis?.[i]?.text || e.reason;
 return {tf:'market',name:`Market ${e.session}`,style:`Sesi ${e.session} · WIB`,category:'N = sesi hari ini · B = sesi sejenis sebelumnya',
  currentPrice:e.quote?.bid ?? e.current.close,openN:e.current.open,openB:e.previous.open,highN:e.current.high,lowN:e.current.low,
  observation:e.observation,alternatives:e.alternatives,jika:e.jika,perahu:e.perahu,rs:e.rs,busur:e.plan,hsh:e.hsh,
  warnings:[e.reason,...(e.checklist || [])],
  coptahRationale:{whyEntryHere:text(4),antiFomoRule:e.reason,jikaRole:text(1),perahuRole:text(2),hshRole:text(5),riskRewardRatio:e.plan.riskReward},
  globalMacroStoryline:{decadeCycle:text(0),year2026Phase:text(3),fractalRole:text(2),alignmentRecommendation:text(6)},
 };
}
