import type {BenchmarkRow,Board} from './benchmarks.ts';
import {freeOffer,modelKey,initialFreeAccess,type FreeOffer} from './free-access.ts';
import {costPerScore,filterRedValueRows} from './benchmark-value.ts';
const core=['Anthropic','OpenAI','Google','Kimi','DeepSeek','xAI','Meta','Alibaba','Mistral','Microsoft','Black Forest Labs','ByteDance','Runway','Luma','Midjourney','Kling','MiniMax','HeyGen','Utopai Studios','Ideogram','Recraft'];
export function comparisonLimit(id:Board['id']){return id==='text'?15:12;}
export const DEFAULT_COMPARISON_MODE='value';
export function costComparisonLimit(id:Board['id']){return id==='text'?20:10;}
export function freeComparisonLimit(id:Board['id']){return id==='text'?10:5;}
function sortByValue(a:BenchmarkRow,b:BenchmarkRow,id:Board['id']){
 return (costPerScore(a,id)??Infinity)-(costPerScore(b,id)??Infinity)||b.score-a.score||a.model.localeCompare(b.model);
}
export function selectNonRedLanguageValueRows(rows:BenchmarkRow[]):BenchmarkRow[]{
 const priced=rows.filter(row=>costPerScore(row,'text')!==undefined).sort((a,b)=>sortByValue(a,b,'text'));
 // Filter the whole leaderboard before taking the highest scores, so red rows do not consume a slot.
 return filterRedValueRows(priced,'text',true).sort((a,b)=>b.score-a.score||sortByValue(a,b,'text'))
  .slice(0,costComparisonLimit('text')).sort((a,b)=>sortByValue(a,b,'text'));
}
export function selectComparisonRows(rows:BenchmarkRow[],mode:string,id:Board['id'],offers:FreeOffer[]=initialFreeAccess.offers):BenchmarkRow[]{
 const limit=comparisonLimit(id),ordered=[...rows].sort((a,b)=>b.score-a.score);
 if(mode==='value')return ordered.slice(0,costComparisonLimit(id)).sort((a,b)=>sortByValue(a,b,id));
 if(mode==='free'||mode==='value-free'){
  const seen=new Set<string>();
  const free=ordered.filter(r=>{const offer=freeOffer(r.company,r.model,offers,id);if(!offer)return false;const key=modelKey(offer.company)+':'+modelKey(offer.model);if(seen.has(key))return false;seen.add(key);return true;}).slice(0,freeComparisonLimit(id));
  return mode==='value-free'?free.sort((a,b)=>(costPerScore(a,id)??Infinity)-(costPerScore(b,id)??Infinity)||b.score-a.score):free;
 }
 if(mode==='top')return ordered.slice(0,limit);
 const seen=new Set<string>();
 return ordered.filter(r=>{const company=r.company.trim();if(!company||company==='Não informado'||seen.has(company)||(id!=='text'&&!core.includes(company)))return false;seen.add(company);return true;}).slice(0,limit);
}
