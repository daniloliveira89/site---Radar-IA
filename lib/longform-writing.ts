import type {Board,BenchmarkRow} from './benchmarks.ts';

export const LONGFORM_CONFIG={
 id:'text' as const,title:'Creative Writing',metric:'EQ-Bench Longform · 0–100',scope:'Longform Writing',evaluation:'eq-bench' as const,
 description:'Story planning, revision and writing across eight chapters, scored by an AI judge.',
 source:'https://eqbench.com/creative_writing_longform.html',methodology:'https://eqbench.com/creative_writing_longform.html#metrics-explanation',
};

function companyFor(id:string):string{
 const name=id.toLowerCase().split('/').at(-1)!;
 const families:[RegExp,string][]=[
  [/^claude-/,'Anthropic'],[/^(gpt-|chatgpt-|o[134](?:-|$))/,'OpenAI'],[/^gem(?:ini|ma)-/,'Google'],[/^kimi-/,'Kimi'],[/^glm-/,'Z AI'],[/^deepseek-/,'DeepSeek'],[/^grok-/,'xAI'],[/^(muse-|llama-)/,'Meta'],[/^(qwen|qwq-)/,'Alibaba'],[/^(mistral-|ministral-)/,'Mistral'],[/^minimax-/,'MiniMax'],[/^mimo-/,'Xiaomi'],[/^nemotron-/,'NVIDIA'],[/^phi-/,'Microsoft'],[/^bytedance-/,'ByteDance'],[/^longcat-/,'Meituan'],[/^nova-/,'Amazon'],
 ];
 return families.find(([pattern])=>pattern.test(name))?.[1]||'Não informado';
}

const nameWords:Record<string,string>={
 claude:'Claude',opus:'Opus',sonnet:'Sonnet',haiku:'Haiku',fable:'Fable',gemini:'Gemini',gemma:'Gemma',argon:'Argon',carbon:'Carbon',gpt:'GPT',chatgpt:'ChatGPT',glm:'GLM',kimi:'Kimi',deepseek:'DeepSeek',grok:'Grok',qwen:'Qwen',qwq:'QwQ',mimo:'MiMo',minimax:'MiniMax',nemotron:'Nemotron',mistral:'Mistral',ministral:'Ministral',muse:'Muse',llama:'Llama',it:'IT',oss:'OSS',a4b:'A4B',a3b:'A3B',fp8:'FP8',vl:'VL',k3:'K3',k2:'K2',
};
export function formatLongformModel(id:string):string{
 const name=id.split('/').at(-1)!.replace(/:free$/i,'')
  .replace(/^(claude-(?:opus|sonnet|haiku|fable)-)(\d)-(\d)(?=-|$)/i,'$1$2.$3')
  .replace(/^(claude-)(\d)-(\d)(?=-|$)/i,'$1$2.$3');
 return name.split(/[-_]+/).map(word=>{
  const lower=word.toLowerCase();
  return nameWords[lower]||(/^(?:[kv]\d+(?:\.\d+)*|\d+(?:\.\d+)?[bm])$/i.test(word)?word.toUpperCase():word.charAt(0).toUpperCase()+word.slice(1));
 }).join(' ').replace(/^(GPT|GLM) (\d)/,'$1-$2').replace(/\bFlash Lite\b/,'Flash-Lite');
}

export function parseLongform(js:string):BenchmarkRow[]{
 // Read only the published data literal; never execute the page's JavaScript.
 const csv=js.match(/\b(?:const|let|var)\s+leaderboardDataLongformV\d+\s*=\s*`([^`]+)`/)?.[1];
 if(!csv)throw Error('Longform leaderboard data missing');
 const [header,...lines]=csv.trim().split(/\r?\n/);
 const columns=header.split(',');
 if(columns[0]!=='model_name'||columns[1]!=='overall_score_100'||!columns.includes('chapter8_avg'))throw Error('Longform leaderboard format changed');
 const seen=new Set<string>();
 const rows=lines.filter(line=>line.trim()).map(line=>{
  const cells=line.split(',');
  const id=cells[0].trim().replace(/^[*!]+/,''); // new and adult-content markers are not part of the model ID
  const value=cells[1]?.trim()||'',score=Number(value);
  if(cells.length!==columns.length||!/^[\w.-]+(?:\/[\w.:-]+)?(?::[\w-]+)?$/.test(id)||!/^(\d+)(\.\d+)?$/.test(value)||score<0||score>100||seen.has(id.toLowerCase()))throw Error('Invalid longform leaderboard row');
  seen.add(id.toLowerCase());
  return {model:id,company:companyFor(id),score,preview:false};
 });
 if(rows.length<15)throw Error('Longform leaderboard returned too few results');
 return rows.sort((a,b)=>b.score-a.score);
}

export async function collectLongform(fallback?:Board):Promise<Board>{
 try{
  const signal=AbortSignal.timeout(15000);
  const page=await fetch(LONGFORM_CONFIG.source,{signal});
  if(!page.ok)throw Error('Longform leaderboard unavailable');
  const html=await page.text();
  const script=html.match(/<script\b[^>]*\bsrc=["']((?:\.\/|\/)?creative_writing_longform\.js(?:\?v=[\w.-]+)?)["']/i)?.[1];
  if(!script)throw Error('Longform leaderboard script missing');
  const data=await fetch(new URL(script,LONGFORM_CONFIG.source).href,{signal});
  if(!data.ok)throw Error('Longform leaderboard data unavailable');
  const js=await data.text();
  if(js.length>5_000_000)throw Error('Longform leaderboard response too large');
  return {...LONGFORM_CONFIG,rows:parseLongform(js),checkedAt:new Date().toISOString(),status:'live'};
 }catch{
  const saved=fallback?.evaluation==='eq-bench'&&fallback.scope===LONGFORM_CONFIG.scope?fallback:undefined;
  return {...LONGFORM_CONFIG,rows:saved?.rows||[],checkedAt:saved?.checkedAt||'',status:'saved',error:'EQ-Bench Longform could not be refreshed.'};
 }
}
