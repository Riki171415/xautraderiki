import {macroEqualLevels,MACRO_NAMES} from '../macroEqualLevels.mjs';
import {levelName} from '../h4LevelMatches.mjs';
export default function MacroEqualDetails({columns,timeframe,level,now,decimals=3,showEmpty=false}) {
 const matches=macroEqualLevels(columns,{now,decimals});
 const entries=[...matches].filter(([id])=>id.startsWith(timeframe+'|')&&(!level||id===timeframe+'|'+level));
 if(!entries.length)return showEmpty?<p className="macro-equal-details">Belum ada level bernilai sama pada TF besar lain yang aktif.</p>:null;
 return <section className="macro-equal-details"><h3>≡ Nilai sama · Daily–Year</h3>{entries.map(([id,pairs])=>{const key=id.split('|')[1];return <div key={id}><strong>{MACRO_NAMES[timeframe]} {levelName(key)} · {pairs[0].display}</strong><ul>{pairs.map(p=><li key={p.timeframe+p.key}>≡ {p.label} {levelName(p.key)} · {p.display}</li>)}</ul></div>;})}<p>Sama pada {decimals} digit tampilan, bukan toleransi H4. Dapat berbeda pada digit lebih kecil. Penanda kesamaan harga, bukan sinyal entry atau bukti pantulan.</p></section>;
}
