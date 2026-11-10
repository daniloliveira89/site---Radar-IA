import type {BenchmarkRow,Board} from './benchmarks.ts';
import type {RouterCatalogue} from './openrouter.ts';

const namespaces:Record<string,string>={Anthropic:'anthropic',OpenAI:'openai',Google:'google',Kimi:'moonshotai','Z AI':'z-ai',DeepSeek:'deepseek',xAI:'x-ai',Meta:'meta',Alibaba:'qwen',Mistral:'mistralai',MiniMax:'minimax',Xiaomi:'xiaomi',NVIDIA:'nvidia',Microsoft:'microsoft',ByteDance:'bytedance',Amazon:'amazon'};
const equivalentId=(id:string)=>id.toLowerCase().trim().replace(/^(anthropic\/claude-(?:opus|sonnet|haiku|fable)-)(\d)-(\d)(?=-|$)/,'$1$2.$3');
function modelIds(row:BenchmarkRow):string[]{
 const name=row.model.toLowerCase().replace(/:free$/,'');
 const namespace=namespaces[row.company];
 // EQ-Bench sometimes gives the HF publisher rather than the API namespace.
 // Match the full source ID or the exact model name under its known provider.
 const short=name.split('/').at(-1)!;
 return [...new Set([...(name.includes('/')?[name]:[]),...(namespace?[namespace+'/'+short]:[])].map(equivalentId))];
}
function numberPrice(value:unknown):number|undefined{
 if(typeof value!=='string'||!value.trim())return;
 const price=Number(value);if(Number.isFinite(price)&&price>=0)return price;
}
export function withLongformPrices(board:Board,catalogue:RouterCatalogue|undefined,checkedAt:string,fallback?:Board):Board{
 if(!catalogue?.data){
  const previous=fallback?.evaluation==='eq-bench'?fallback:undefined;
  const byId=new Map(previous?.rows.map(r=>[r.company+'\0'+r.model,r])||[]);
  return {...board,priceCheckedAt:previous?.priceCheckedAt,rows:board.rows.map(row=>{
   const prior=byId.get(row.company+'\0'+row.model);
   return prior?.costUnit==='1m-tokens'?{...row,costUSD:prior.costUSD,costUnit:prior.costUnit}:row;
  })};
 }
 const routes=new Map<string,NonNullable<RouterCatalogue['data']>[number]>();
 for(const entry of catalogue.data){
  if(typeof entry.id!=='string'||entry.id.includes(':')||(entry.architecture?.output_modalities&&!entry.architecture.output_modalities.includes('text')))continue;
  routes.set(equivalentId(entry.id),entry);
  if(typeof entry.canonical_slug==='string'&&!routes.has(equivalentId(entry.canonical_slug)))routes.set(equivalentId(entry.canonical_slug),entry);
 }
 const rows=board.rows.map(row=>{
  const {costUSD:_oldCost,costUnit:_oldUnit,...score}=row;
  const route=modelIds(row).map(id=>routes.get(id)).find(Boolean);
  const input=numberPrice(route?.pricing?.prompt),output=numberPrice(route?.pricing?.completion);
  return input===undefined||output===undefined?score:{...score,costUSD:(input+output)*500_000,costUnit:'1m-tokens' as const};
 });
 return {...board,rows,priceCheckedAt:checkedAt};
}
