import {clean} from './feed.ts';
import {collectFreeAccess,initialFreeAccess,type FreeAccess} from './free-access.ts';
import {collectArena,collectCreativeWriting} from './arena.ts';
import {collectLongform} from './longform-writing.ts';
import {fetchRouterCatalogue} from './openrouter.ts';
import {withLongformPrices} from './longform-pricing.ts';
import {collectWebDesign} from './web-design.ts';
import initialWebDesign from './initial-web-design.json' with {type:'json'};
export type CostUnit='task'|'1k-images'|'minute'|'1m-tokens';
export type BenchmarkRow={model:string;company:string;score:number;low?:number;high?:number;samples?:number;preview:boolean;costUSD?:number;costUnit?:CostUnit};
export type Board={id:'text'|'image'|'video';title:string;metric:string;description:string;source:string;methodology:string;checkedAt:string;rows:BenchmarkRow[];status:'live'|'saved';error?:string;evaluation?:'aa'|'arena'|'eq-bench'|'design-arena';scope?:string;publishedAt?:string;priceCheckedAt?:string};
export type Benchmarks={boards:Board[];arenas?:Board[];creativeWriting?:Board;creativeWritingLongform?:Board;webDesign?:Board;freeAccess?:FreeAccess};
export const BOARD_CONFIG=[
 {id:'text' as const,title:'Texto e raciocínio',metric:'AA Intelligence Index',description:'Desempenho agregado nas avaliações da Artificial Analysis. Configuração de raciocínio preservada no nome.',source:'https://artificialanalysis.ai/leaderboards/models',methodology:'https://artificialanalysis.ai/methodology/intelligence-benchmarking'},
 {id:'image' as const,title:'Criação de imagem',metric:'AA-Image-T2I v2.1 · Elo',description:'Geração de imagem a partir de texto. Preferências humanas em comparações cegas; não mede edição de imagem.',source:'https://artificialanalysis.ai/image/leaderboard/text-to-image',methodology:'https://artificialanalysis.ai/methodology/image'},
 {id:'video' as const,title:'Criação de vídeo',metric:'AA-Video-T2V v2.1 · Elo',description:'Geração de vídeo com áudio a partir de texto. Não mistura resultados de imagem para vídeo ou vídeo sem áudio.',source:'https://artificialanalysis.ai/video/leaderboard/text-to-video',methodology:'https://artificialanalysis.ai/video/methodology'},
];
// Require the source's currency and unit. Missing prices are never zero prices.
export function parseBenchmarkCost(value:string,id:Board['id']):Pick<BenchmarkRow,'costUSD'|'costUnit'>|undefined{
 const pattern=id==='text'?/^\$\s*([\d,]+(?:\.\d+)?)\s*$/:id==='image'?/^\$\s*([\d,]+(?:\.\d+)?)\s*\/\s*1k\s+imgs\s*$/i:/^\$\s*([\d,]+(?:\.\d+)?)\s*\/\s*min\s*$/i;
 const match=value.match(pattern);if(!match)return;
 const costUSD=Number(match[1].replaceAll(',',''));if(!Number.isFinite(costUSD)||costUSD<0)return;
 return {costUSD,costUnit:id==='text'?'task':id==='image'?'1k-images':'minute'};
}
export function parseBoard(html:string,id:Board['id']):BenchmarkRow[]{
 const table=html.match(/<table\b[^>]*>([\s\S]*?)<\/table>/i)?.[1];if(!table)throw Error('Tabela da fonte não reconhecida');
 const headerRows=[...table.matchAll(/<tr\b[^>]*>([\s\S]*?)<\/tr>/gi)].filter(m=>/<th\b/i.test(m[1]));
 const headers=[...(headerRows.at(-1)?.[1]||'').matchAll(/<th\b[^>]*>([\s\S]*?)<\/th>/gi)].map(m=>clean(m[1]));
 const costColumn=headers.findIndex(h=>id==='text'?/^Cost per Task\s+USD$/i.test(h):/^Pricing(?:\s+\d+)?$/i.test(h));
 const rows:BenchmarkRow[]=[];
 for(const tr of table.matchAll(/<tr\b[^>]*>([\s\S]*?)<\/tr>/gi)){
  const raw=[...tr[1].matchAll(/<td\b[^>]*>([\s\S]*?)<\/td>/gi)].map(m=>m[1]),cells=raw.map(clean);
  const model=id==='text'?cells[0]:cells[2],scoreText=id==='text'?cells[3]:cells[3];
  if(!model||!scoreText||scoreText.includes('*'))continue;
  const score=Number(scoreText.match(/^\s*(\d+(?:\.\d+)?)/)?.[1]);if(!Number.isFinite(score)||score<=0||score>(id==='text'?100:2500))continue;
  const provider=id==='text'?cells[2]:raw[2]?.match(/alt="([^"]+) logo"/)?.[1]||'';
  const company=provider.replace('SpaceXAI','xAI').replace('SpaceXSI','xAI').replace('Microsoft AI','Microsoft').replace('Luma Labs','Luma').replace('Bytedance','ByteDance').replace('ByteDance Seed','ByteDance').replace('Alibaba-ATH','Alibaba').replace('KlingAI','Kling');
  const interval=scoreText.match(/interval\s+(\d+)\s+to\s+(\d+)/i);
  rows.push({model,company:company||'Não informado',score,...(costColumn>=0?parseBenchmarkCost(cells[costColumn]||'',id):{}),...(interval?{low:Number(interval[1]),high:Number(interval[2])}:{}),...(id!=='text'?{samples:Number(cells[4]?.replace(/[^0-9]/g,''))||0}:{}),preview:/\bpreview|beta|experimental/i.test(model)});
 }
 if(rows.length<3)throw Error('A fonte retornou poucos resultados');
 return rows.sort((a,b)=>b.score-a.score);
}
export async function collectBenchmarks(fallback:Benchmarks):Promise<Benchmarks>{
 const router=fetchRouterCatalogue().catch(()=>undefined);
 const freeAccess=collectFreeAccess(fallback.freeAccess||initialFreeAccess,router);
 const arenas=collectArena(fallback.arenas);
 const creativeWriting=collectCreativeWriting(fallback.creativeWriting);
 const webDesign=collectWebDesign(fallback.webDesign||initialWebDesign as Board);
 const creativeWritingLongform=Promise.all([collectLongform(fallback.creativeWritingLongform),router]).then(([board,prices])=>withLongformPrices(board,prices,new Date().toISOString(),fallback.creativeWritingLongform));
 const boards=await Promise.all(BOARD_CONFIG.map(async config=>{
  try{const response=await fetch(config.source,{headers:{'User-Agent':'Mozilla/5.0 (compatible; RadarIA/2.0)'},signal:AbortSignal.timeout(15000)});if(!response.ok)throw Error('Fonte indisponível');const html=await response.text();if(html.length>5_000_000)throw Error('Resposta muito grande');return {...config,checkedAt:new Date().toISOString(),rows:parseBoard(html,config.id),status:'live' as const};}
  catch{return {...fallback.boards.find(b=>b.id===config.id)!,status:'saved' as const,error:'Não foi possível atualizar esta avaliação. Exibindo a coleta identificada abaixo.'};}
 }));return {boards,arenas:await arenas,creativeWriting:await creativeWriting,creativeWritingLongform:await creativeWritingLongform,webDesign:await webDesign,freeAccess:await freeAccess};
}
