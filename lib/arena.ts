import {clean} from './feed.ts';
import type {Board,BenchmarkRow} from './benchmarks.ts';

export const ARENA_CONFIG=[
 {id:'text' as const,title:'Text Arena · English',metric:'Arena · English · human preference',scope:'English',source:'https://arena.ai/leaderboard/chat/text/english'},
 {id:'image' as const,title:'Text-to-image Arena',metric:'Arena · text-to-image · human preference',scope:'Overall',source:'https://arena.ai/leaderboard/image/text-to-image'},
 {id:'video' as const,title:'Text-to-video Arena',metric:'Arena · text-to-video · human preference',scope:'Overall',source:'https://arena.ai/leaderboard/video/text-to-video'},
];
export const CREATIVE_WRITING_CONFIG={
 id:'text' as const,title:'Creative Writing',metric:'Arena · Creative Writing · human preference',scope:'Creative Writing',source:'https://arena.ai/leaderboard/chat/text/creative-writing',
};
// Arena lists input/output USD per million tokens. Use a clearly labelled
// 50:50 token mix, never its client-only P50 estimate or an AA task cost.
export function parseArenaPrice(text:string,id:Board['id']):Pick<BenchmarkRow,'costUSD'|'costUnit'>|undefined{
 if(id!=='text')return;
 const match=text.match(/^\$\s*(\d+(?:\.\d+)?)\s*\/\s*\$\s*(\d+(?:\.\d+)?)$/);
 if(!match)return;
 const costUSD=(Number(match[1])+Number(match[2]))/2;
 if(Number.isFinite(costUSD)&&costUSD>=0)return {costUSD,costUnit:'1m-tokens'};
}
export function parseArena(html:string,id:Board['id'],scope='English'):{rows:BenchmarkRow[],publishedAt?:string}{
 const heading=clean(html.match(/<h1\b[^>]*>([\s\S]*?)<\/h1>/i)?.[1]||'');
 if(id==='text'&&!(scope==='Creative Writing'?/Text Arena.*Creative Writing\s*$/i:/Text Arena.*English\s*$/i).test(heading))throw Error('Arena text category not confirmed');
 if(id==='image'&&!/Text.to.Image Arena/i.test(heading))throw Error('Image category not confirmed');
 if(id==='video'&&!/Text.to.Video Arena/i.test(heading))throw Error('Video category not confirmed');
 const table=html.match(/<table\b[^>]*>([\s\S]*?)<\/table>/i)?.[1]||'';
 const headers=[...table.matchAll(/<th\b[^>]*>([\s\S]*?)<\/th>/gi)].map(m=>clean(m[1]));
 if(headers[2]!=='Model'||headers[3]!=='Score'||headers[4]!=='Votes')throw Error('Arena table changed');
 const priceColumn=headers.findIndex(h=>h==='Price $/M');
 const rows:BenchmarkRow[]=[];
 for(const tr of table.matchAll(/<tr\b[^>]*>([\s\S]*?)<\/tr>/gi)){
  const raw=[...tr[1].matchAll(/<td\b[^>]*>([\s\S]*?)<\/td>/gi)].map(m=>m[1]);
  const model=clean(raw[2]?.match(/<a\b[^>]*>([\s\S]*?)<\/a>/i)?.[1]||'');
  const result=clean(raw[3]||'').match(/^(\d+(?:\.\d+)?)\s*±\s*(\d+(?:\.\d+)?)/);
  const samples=Number(clean(raw[4]||'').replaceAll(',',''));if(!model||!result||!Number.isFinite(samples)||samples<1)continue;
  const score=Number(result[1]),margin=Number(result[2]);if(score<100||score>2500||margin<0||margin>500)continue;
  // Logo accessibility titles may repeat the company before the model name.
  // Read the explicit metadata span instead of slicing the entire cell text.
  const metadata=[...raw[2].matchAll(/<span\b[^>]*>([\s\S]*?)<\/span>/gi)].map(m=>clean(m[1])).filter(s=>s.includes('·')).at(-1)||'';
  let company=metadata?metadata.split('·')[0].trim():'Não informado';
  company=({'Moonshot':'Kimi','Microsoft AI':'Microsoft','SpaceXAI':'xAI','Bytedance':'ByteDance','Alibaba-ATH':'Alibaba','KlingAI':'Kling','Luma AI':'Luma','Z.ai':'Z AI','Nvidia':'NVIDIA'} as Record<string,string>)[company]||company;
  rows.push({model,company,score,low:score-margin,high:score+margin,samples,...(priceColumn>=0?parseArenaPrice(clean(raw[priceColumn]||''),id):{}),preview:/Preliminary|preview|beta|experimental/i.test(clean(raw[3]||'')+' '+model)});
 }
 if(rows.length<3)throw Error('Arena results unavailable');
 const date=html.match(/<time\b[^>]*datetime="([^"]+)"/i)?.[1];
 return {rows:rows.sort((a,b)=>b.score-a.score),...(date&&Number.isFinite(Date.parse(date))?{publishedAt:date}:{})};
}
async function collectArenaBoard(config:(typeof ARENA_CONFIG)[number]|typeof CREATIVE_WRITING_CONFIG,old?:Board):Promise<Board>{
  try{
   const r=await fetch(config.source,{signal:AbortSignal.timeout(15000)});if(!r.ok)throw Error('Arena unavailable');
   const html=await r.text();if(html.length>6_000_000)throw Error('Response too large');
   return {...config,evaluation:'arena' as const,description:'Human preference; scores are separate from Artificial Analysis.',methodology:'https://arena.ai/how-it-works',checkedAt:new Date().toISOString(),status:'live' as const,...parseArena(html,config.id,config.scope)};
  }catch{
   return old?{...old,status:'saved' as const,error:'Arena could not be refreshed. Showing the dated saved edition.'}:{...config,evaluation:'arena' as const,description:'Human preference',methodology:'https://arena.ai/how-it-works',checkedAt:'',status:'saved' as const,rows:[],error:'Arena is currently unavailable.'};
  }
}
export async function collectArena(fallback:Board[]=[]):Promise<Board[]>{
 return Promise.all(ARENA_CONFIG.map(config=>collectArenaBoard(config,fallback.find(b=>b.id===config.id))));
}
export function collectCreativeWriting(fallback?:Board):Promise<Board>{
 return collectArenaBoard(CREATIVE_WRITING_CONFIG,fallback?.scope===CREATIVE_WRITING_CONFIG.scope?fallback:undefined);
}
