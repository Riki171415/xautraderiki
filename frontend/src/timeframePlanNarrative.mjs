import {h4ConfluencePlan,confluenceCell} from './h4ConfluencePlan.mjs';
export function timeframePlanMarkers(columns,price,timeframe,options={}) {
 const column=columns.find(c=>c.timeframe===timeframe);
 if(!column)return [];
 const raw=h4ConfluencePlan(columns,Number(price),options);
 const plan=options.stale?{...raw,action:'WAIT'}:raw;
 return ['res4','res3','res2','res1','pivot','sup1','sup2','sup3','sup4'].flatMap(key=>confluenceCell(plan,column,key).map(marker=>({...marker,key,value:Number(column[key])})));
}
