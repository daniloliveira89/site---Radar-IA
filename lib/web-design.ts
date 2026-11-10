import type {Board,BenchmarkRow} from './benchmarks.ts';

export const WEB_DESIGN_LIMIT=20;
export const WEB_DESIGN_CONFIG={
 id:'text', title:'Web Design', metric:'DesignArena · Website Elo', scope:'Website',
 description:'Human preferences in blind comparisons of AI-generated websites.',
 source:'https://www.designarena.ai/leaderboard/website',
 methodology:'https://www.designarena.ai/about', evaluation:'design-arena',
} as const;

type WebsiteSeed={
 boards?:{arenaType?:string;category?:string;variationName?:string;inputModality?:string;metadata?:{lastUpdateTime?:string};data?:{modelId:string;elo:number;battles:number}[]}[];
 registry?:{models?:Record<string,{displayName?:string;provider?:string;modeOf?:string}>;providers?:Record<string,{displayName?:string}>};
};
function websiteSeed(html:string):WebsiteSeed{
 // The public page renders only its first 15 rows; read the full board from its embedded data.
 const frames=[...html.matchAll(/<script\b[^>]*>self\.__next_f\.push\((\[1,"(?:[^"\\]|\\[\s\S])*"\])\)<\/script>/g)];
 const stream=frames.map(m=>JSON.parse(m[1])[1] as string).join('');
 for(const line of stream.split('\n')){
  if(!/^\w+:\[/.test(line)||!line.includes('"boards":')||!line.includes('"seed":'))continue;
  const record=JSON.parse(line.slice(line.indexOf(':')+1)) as [unknown,unknown,unknown,{seed?:WebsiteSeed}];
  const seed=record[3]?.seed;
  if(seed?.boards?.some(b=>b.arenaType==='models'&&b.category==='website'&&b.variationName==='public'&&b.inputModality==='text')&&seed.registry?.models&&seed.registry.providers)return seed;
 }
 throw Error('DesignArena Website board data missing');
}
export function parseWebDesign(html:string):{rows:BenchmarkRow[],publishedAt:string}{
 if(!/<link\b[^>]*rel=["']canonical["'][^>]*href=["']https:\/\/(?:www\.)?designarena\.ai\/leaderboard\/website\/?["']/i.test(html))throw Error('DesignArena Website board not confirmed');
 const {boards,registry}=websiteSeed(html);
 const board=boards!.find(b=>b.arenaType==='models'&&b.category==='website'&&b.variationName==='public'&&b.inputModality==='text');
 const publication=Date.parse(board?.metadata?.lastUpdateTime||'');
 if(!Number.isFinite(publication)||!Array.isArray(board?.data))throw Error('DesignArena edition data missing');
 const rows:BenchmarkRow[]=[],families=new Set<string>();
 for(const result of [...board.data].sort((a,b)=>b.elo-a.elo)){
  if(typeof result.modelId!=='string'||!Number.isInteger(result.elo)||result.elo<100||result.elo>3000||!Number.isSafeInteger(result.battles)||result.battles<1)throw Error('Invalid DesignArena ranking data');
  const model=registry?.models?.[result.modelId];
  const name=model?.displayName?.trim();
  const org=model?.provider&&registry?.providers?.[model.provider]?.displayName?.trim();
  if(!name||!org)throw Error('DesignArena model identity missing');
  // Keep the highest-ranked effort variant per model, matching the source's default list.
  const family=model.modeOf||result.modelId;
  if(families.has(family))continue;
  families.add(family);
  const company=({'moonshot ai':'Kimi','moonshot':'Kimi','z.ai':'Z AI','google deepmind':'Google','x.ai':'xAI'} as Record<string,string>)[org.toLowerCase()]||org;
  rows.push({model:name,company,score:result.elo,samples:result.battles,preview:/\b(?:preliminary|preview|beta|experimental)\b/i.test(name)});
  if(rows.length===WEB_DESIGN_LIMIT)break;
 }
 if(rows.length<WEB_DESIGN_LIMIT)throw Error('Incomplete DesignArena leaderboard');
 return {rows,publishedAt:new Date(publication).toISOString()};
}

export async function collectWebDesign(fallback?:Board):Promise<Board>{
 try{
  const response=await fetch(WEB_DESIGN_CONFIG.source,{signal:AbortSignal.timeout(12000)});
  if(!response.ok)throw Error('DesignArena unavailable');
  const html=await response.text();if(html.length>5_000_000)throw Error('DesignArena response too large');
  return {...WEB_DESIGN_CONFIG,...parseWebDesign(html),status:'live',checkedAt:new Date().toISOString()};
 }catch{
  const old=fallback?.evaluation===WEB_DESIGN_CONFIG.evaluation&&fallback.scope===WEB_DESIGN_CONFIG.scope&&fallback.rows.length>=WEB_DESIGN_LIMIT?fallback:undefined;
  return {...WEB_DESIGN_CONFIG,rows:[],checkedAt:'',...old,status:'saved',error:'DesignArena could not be refreshed. Showing the last available edition.'};
 }
}
