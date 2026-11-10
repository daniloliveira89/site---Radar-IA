import type {Board,BenchmarkRow} from './benchmarks.ts';
import {clean} from './feed.ts';

export const WEB_DESIGN_LIMIT=15;
export const WEB_DESIGN_CONFIG={
 id:'text', title:'Web Design', metric:'DesignArena · Website Elo', scope:'Website',
 description:'Human preferences in blind comparisons of AI-generated websites.',
 source:'https://www.designarena.ai/leaderboard/website',
 methodology:'https://www.designarena.ai/about', evaluation:'design-arena',
} as const;

// Extract only the top-level div cells of the published leaderboard row.
function cellsOf(row:string):string[]{
 const cells:string[]=[];let depth=0,start=0;
 for(const tag of row.matchAll(/<\/?div\b[^>]*>/gi)){
  if(/^<\//.test(tag[0])){
   if(depth===0)break;
   if(--depth===0)cells.push(row.slice(start,tag.index));
  }else if(depth++===0)start=tag.index+tag[0].length;
 }
 return cells;
}
const numberText=(s:string)=>/^\d[\d,]*$/.test(s)?Number(s.replaceAll(',','')):NaN;

export function parseWebDesign(html:string):{rows:BenchmarkRow[],publishedAt:string}{
 if(!/<link\b[^>]*rel=["']canonical["'][^>]*href=["']https:\/\/(?:www\.)?designarena\.ai\/leaderboard\/website\/?["']/i.test(html))throw Error('DesignArena Website board not confirmed');
 const heading=/<h2\b[^>]*>\s*The Leaderboard\s*<\/h2>/i.exec(html);
 if(!heading)throw Error('DesignArena leaderboard missing');
 const section=html.slice(heading.index);
 const date=section.match(/<p\b[^>]*>\s*Updated ([^<]+?)\s*<\/p>/i)?.[1]||'';
 const publication=Date.parse(date);
 if(!Number.isFinite(publication)||!/\bUTC$/i.test(date))throw Error('DesignArena edition date missing');
 const matches=[...section.matchAll(/<div\b[^>]*\bdata-model-id=["']([^"']+)["'][^>]*>/gi)];
 const header=section.slice(0,matches[0]?.index??0);
 if(!['Elo Rating','Win Rate','Battles','Organization'].every(name=>header.includes(name)))throw Error('DesignArena table columns changed');
 const rows:BenchmarkRow[]=[],ids=new Set<string>();
 for(const [index,match] of matches.slice(0,WEB_DESIGN_LIMIT).entries()){
  const cells=cellsOf(section.slice(match.index+match[0].length,matches[index+1]?.index));
  if(cells.length!==8||ids.has(match[1]))throw Error('DesignArena row structure changed');
  const rank=Number(clean(cells[0]).replace(/^#\s*/,'')), model=clean(cells[1].match(/<span\b[^>]*font-concrette[^>]*>([\s\S]*?)<\/span>/i)?.[1]||'');
  const score=numberText(clean(cells[2].match(/<div\b[^>]*>([\s\S]*?)<\/div>/i)?.[1]||''));
  const samples=numberText(clean(cells[5])),org=clean(cells[6]);
  const company=({'moonshot ai':'Kimi','moonshot':'Kimi','z.ai':'Z AI','google deepmind':'Google','x.ai':'xAI'} as Record<string,string>)[org.toLowerCase()]||org;
  if(!Number.isInteger(rank)||rank<1||(index===0&&rank!==1)||!model||!company||!Number.isSafeInteger(samples)||samples<1||score<100||score>3000||!Number.isInteger(score)||(index>0&&score>rows[index-1].score))throw Error('Invalid DesignArena ranking data');
  ids.add(match[1]);
  rows.push({model,company,score,samples,preview:/\b(?:preliminary|preview|beta|experimental)\b/i.test(clean(cells[1]))});
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
  const old=fallback?.evaluation===WEB_DESIGN_CONFIG.evaluation&&fallback.scope===WEB_DESIGN_CONFIG.scope?fallback:undefined;
  return {...WEB_DESIGN_CONFIG,rows:[],checkedAt:'',...old,status:'saved',error:'DesignArena could not be refreshed. Showing the last available edition.'};
 }
}
