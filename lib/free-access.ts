import snapshot from './initial-free-access.json' with {type:'json'};
import creativeCatalog from './creative-free-catalog.json' with {type:'json'};
import {OPENROUTER_CATALOGUE as routerSource,type RouterCatalogue} from './openrouter.ts';
export type FreeModality='text'|'image'|'video';
export type FreeOffer={model:string;company:string;route:'api'|'chat'|'web';url:string;source:string;checkedAt:string;scope?:'model'|'family';modality?:FreeModality;aliases?:string[];modelIds?:string[];limitsEn?:string;limitsPt?:string;reportedByUser?:boolean};
export type FreeAccess={offers:FreeOffer[];sources:{id:string;name?:string;url:string;checkedAt:string;status:'live'|'saved'}[]};
export const initialFreeAccess=snapshot as FreeAccess;
const flowImage={id:'flow-image-free',name:'Google Flow · Images',url:'https://support.google.com/flow/answer/16729550?hl=en'};
export const FLOW_IMAGE_SOURCE=flowImage.url;
// Older published benchmark snapshots predate this source. A later verified removal takes precedence.
export function withFlowImageAccess(access:FreeAccess):FreeAccess{
 if(access.sources.some(s=>s.id===flowImage.id))return access;
 return {offers:[...access.offers,...initialFreeAccess.offers.filter(o=>o.source===flowImage.url)],sources:[...access.sources,...initialFreeAccess.sources.filter(s=>s.id===flowImage.id)]};
}
export const modelKey=(model:string)=>model.replace(/\((?:non-reasoning|xhigh|max|high|medium|low)(?: with fallback)?\)/gi,'').toLowerCase().replace(/[^a-z0-9]/g,'');
export const writingChatAccess:FreeOffer[]=[{
 model:'GLM-5.3',company:'Z AI',route:'chat',url:'https://chat.z.ai/',source:'https://chat.z.ai/',checkedAt:'',reportedByUser:true,
 limitsEn:'Free chat access reported by the user. Check the selected model and quota in Z.ai; the API is separate.',
 limitsPt:'Acesso grátis no chat informado pelo usuário. Confira o modelo selecionado e a cota no Z.ai; a API é separada.',
}];
export const webDesignChatAccess:FreeOffer[]=[
 {
  model:'Inkling 2 Small',company:'Thinking Machines',route:'api',
  url:'https://openrouter.ai/thinkingmachines/inkling-small:free',source:'https://openrouter.ai/api/v1/models',checkedAt:'',
  aliases:['Inkling 2 Small (high)'],
  limitsEn:'Free API route with limits on OpenRouter.',limitsPt:'Rota de API grátis com limites no OpenRouter.'
 },
 {
  model:'Kimi K3',company:'Kimi',route:'chat',
  url:'https://www.kimi.com/',source:'https://www.kimi.com/',checkedAt:'',reportedByUser:true,
  aliases:['Kimi K3 (high)'],
  limitsEn:'Free chat access on Kimi. Check daily quotas on the site.',limitsPt:'Acesso grátis no chat da Kimi. Confira as cotas diárias no site.'
 },
 {
  model:'DeepSeek-V4.1-Flash',company:'DeepSeek',route:'chat',
  url:'https://chat.deepseek.com/',source:'https://chat.deepseek.com/',checkedAt:'',
  aliases:['DeepSeek V4.1 Flash 1017','DeepSeek-V4.1-Flash (medium)'],
  limitsEn:'Free web chat access on DeepSeek.',limitsPt:'Acesso grátis no chat web da DeepSeek.'
 },
 {
  model:'Muse Spark Open (xhigh)',company:'Meta',route:'chat',
  url:'https://www.meta.ai/',source:'https://www.meta.ai/',checkedAt:'',reportedByUser:true,
  aliases:['Muse Spark Open'],
  limitsEn:'Free access on Meta AI.',limitsPt:'Acesso gratuito no Meta AI.'
 },
 {
  model:'Gemini 3.7 Flash',company:'Google',route:'api',
  url:'https://ai.google.dev/gemini-api/docs/pricing',source:'https://ai.google.dev/gemini-api/docs/pricing',checkedAt:'',
  aliases:['Gemini 3.7 Flash (medium)'],
  limitsEn:'Free tier with rate limits in Google AI Studio.',limitsPt:'Plano gratuito com limites de requisição no Google AI Studio.'
 }
];
export const isPaidGrok47=(company:string,model:string)=>modelKey(company)==='xai'&&modelKey(model.split('/').at(-1)!.replace(/:free$/i,''))==='grok47';
const routeModelId=(id:string)=>id.trim().toLowerCase().replace(/:free$/,'');
export function freeOffer(company:string,model:string,offers:FreeOffer[]=initialFreeAccess.offers,modality:FreeModality='text'){
 if(modality==='text'&&isPaidGrok47(company,model))return;
 const fullId=routeModelId(model);
 return offers.find(o=>{
  if((o.modality||'text')!==modality||modelKey(o.company)!==modelKey(company))return false;
  if([o.model,...(o.aliases||[])].some(n=>modelKey(n)===modelKey(model)))return true;
  // Older saved catalogues keep the exact provider/model ID in their OpenRouter URL.
  const savedId=o.source===routerSource?o.url.match(/^https:\/\/openrouter\.ai\/([^/]+\/[^/?#]+:free)$/i)?.[1]:undefined;
  return [savedId,...(o.modelIds||[])].some(id=>id&&routeModelId(id)===fullId);
 });
}

const plain=(html:string)=>html.replace(/<[^>]*>/g,' ').replace(/&amp;/g,'&').replace(/\s+/g,' ').trim();
const visible=(html:string)=>plain(html.replace(/<(script|style)\b[\s\S]*?<\/\1>/gi,' '));
export function parseFreeFlowImages(html:string,checkedAt:string):FreeOffer[]{
 for(const table of html.matchAll(/<table\b[^>]*>([\s\S]*?)<\/table>/gi)){
  const rows=[...table[1].matchAll(/<tr\b[^>]*>([\s\S]*?)<\/tr>/gi)].map(r=>[...r[1].matchAll(/<t[dh]\b[^>]*>([\s\S]*?)<\/t[dh]>/gi)].map(c=>plain(c[1])));
  const header=rows.find(r=>r[0]==='Model'&&r.includes('Without a Google AI plan'));if(!header)continue;
  const quota=rows.find(r=>r[0]==='Nano Banana Pro')?.[header.indexOf('Without a Google AI plan')]||'';
  if(/^Not available\b/i.test(quota))return [];
  const daily=quota.match(/^(?:Up to\s+)?([\d,]+)\s*(?:\/\s*|per\s+)day\b/i);
  if(!daily)continue;
  const limit=Number(daily[1].replaceAll(',',''));if(limit===0)return [];
  if(!Number.isSafeInteger(limit))continue;
  return [{
   model:'Nano Banana Pro',company:'Google',route:'web',url:'https://labs.google/fx/tools/flow',source:flowImage.url,checkedAt,scope:'model',modality:'image',
   aliases:['Nano Banana Pro (Gemini 3 Pro Image)','Gemini 3 Pro Image','Gemini 3 Pro Image (nano-banana-pro, 2K)'],
   limitsEn:`Google Flow: up to ${limit.toLocaleString('en-US')} images per day without a Google AI plan. Gemini API billing is separate.`,
   limitsPt:`Google Flow: até ${limit.toLocaleString('pt-BR')} imagens por dia sem plano Google AI. A API Gemini é cobrada à parte.`,
  }];
 }
 throw Error('Google Flow image quotas unavailable');
}
export function parseCreativeOffers(html:string,id:string,checkedAt:string):FreeOffer[]{
 const c=creativeCatalog.find(c=>c.id===id);if(!c)throw Error('Unknown creative source');
 const text=visible(html).toLowerCase();if(!c.checks.every(s=>text.includes(s.toLowerCase())))throw Error('Free creative access needs review');
 return c.models.map(m=>({...m,source:c.url,checkedAt})) as FreeOffer[];
}
// Read the Free column, rather than assuming all models at a free service qualify.
export function parseFreeOpenAI(html:string,checkedAt:string):FreeOffer[]{
 const text=visible(html),offers:FreeOffer[]=[];
 for(const match of text.matchAll(/Plan:\s*Free,\s*Feature:\s*(GPT-\d[^,]*),\s*Yes\b/gi)){
  const model=match[1].trim();if(offers.some(o=>o.model===model))continue;
  offers.push({model,company:'OpenAI',route:'chat',url:'https://chatgpt.com/',source:'https://chatgpt.com/pricing/',checkedAt});
 }
 if(!offers.length)throw Error('ChatGPT Free model matrix unavailable');return offers;
}
export function parseFreeClaude(html:string,checkedAt:string):FreeOffer[]{
 const offers:FreeOffer[]=[],text=visible(html);
 for(const table of html.matchAll(/<table\b[^>]*>([\s\S]*?)<\/table>/gi)){
  const rows=[...table[1].matchAll(/<tr\b[^>]*>([\s\S]*?)<\/tr>/gi)].map(r=>[...r[1].matchAll(/<t[dh]\b[^>]*>([\s\S]*?)<\/t[dh]>/gi)].map(c=>plain(c[1])));
  const header=rows.find(r=>r[0]==='Features'&&r.includes('Free'));if(!header)continue;
  const column=header.indexOf('Free');
  for(const row of rows){
   if(!['Sonnet','Haiku','Opus','Fable'].includes(row[0])||row[column]!=='Yes')continue;
   const version=text.match(new RegExp('\\b'+row[0]+'\\s+(\\d+(?:\\.\\d+)+)\\b'))?.[1];
   if(version)offers.push({model:'Claude '+row[0]+' '+version,company:'Anthropic',route:'chat',url:'https://claude.ai/',source:'https://claude.com/pricing',checkedAt,scope:'family'});
  }
 }
 if(!offers.length)throw Error('Claude Free model matrix unavailable');return offers;
}
export function parseFreeRouter(data:RouterCatalogue,checkedAt:string):FreeOffer[]{
 if(!Array.isArray(data.data)||data.data.length<3)throw Error('Free catalogue unavailable');
 const zero=(price:unknown)=>typeof price==='string'&&price.trim()!==''&&Number(price)===0;
 return data.data.filter(m=>m.id.endsWith(':free')&&zero(m.pricing?.prompt)&&zero(m.pricing?.completion)&&(!m.architecture?.output_modalities||m.architecture.output_modalities.includes('text'))).map(m=>({model:m.name.replace(/^[^:]+:\s*/,'').replace(/\s*\(free\)\s*$/i,'').trim(),company:m.name.split(':')[0].trim(),route:'api',url:'https://openrouter.ai/'+m.id,source:routerSource,checkedAt,modelIds:[routeModelId(m.id),...(m.canonical_slug?[routeModelId(m.canonical_slug)]:[])]}));
}
export function parseFreeGoogle(html:string,checkedAt:string):FreeOffer[]{
 const offers:FreeOffer[]=[];
 for(const section of html.split(/(?=<h2\b)/i)){
  const name=plain(section.match(/<h2\b[^>]*>([\s\S]*?)<\/h2>/i)?.[1]||'');
  if(!/^Gemini \d/.test(name)||/,| and /i.test(name))continue;
  const table=section.match(/<table\b[^>]*>([\s\S]*?)<\/table>/i)?.[1]||'';
  const rows=[...table.matchAll(/<tr\b[^>]*>([\s\S]*?)<\/tr>/gi)].map(m=>[...m[1].matchAll(/<t[dh]\b[^>]*>([\s\S]*?)<\/t[dh]>/gi)].map(c=>plain(c[1])));
  if(['Input price','Output price'].every(label=>rows.some(r=>r[0]?.startsWith(label)&&/^Free of charge$/i.test(r[1]||''))))offers.push({model:name,company:'Google',route:'api',url:'https://aistudio.google.com/',source:'https://ai.google.dev/gemini-api/docs/pricing',checkedAt});
 }
 if(!offers.length)throw Error('Free Gemini pricing unavailable');return offers;
}
// The chat page establishes free use; API docs identify the exact currently served release.
export function parseFreeDeepSeek(web:string,docs:string,checkedAt:string):FreeOffer[]{
 const version=plain(docs).match(/now served by (DeepSeek-V[\w.\-]+)[,\s]/i)?.[1];
 if(!version||!web.includes('Chat with leading AI models for free'))throw Error('Free chat release unavailable');
 return [{model:version.replace(/-/g,' '),company:'DeepSeek',route:'chat',url:'https://chat.deepseek.com/',source:'https://www.deepseek.com/en/',checkedAt}];
}
export async function collectFreeAccess(fallback:FreeAccess=initialFreeAccess,router?:Promise<RouterCatalogue|undefined>):Promise<FreeAccess>{
 const configs=[{id:'router',url:routerSource},{id:'google',url:'https://ai.google.dev/gemini-api/docs/pricing'},{id:'deepseek',url:'https://www.deepseek.com/en/'},{id:'openai',url:'https://chatgpt.com/pricing/'},{id:'anthropic',url:'https://claude.com/pricing'},...creativeCatalog,flowImage];
 const request=async(url:string)=>{const r=await fetch(url,{headers:{'User-Agent':'Mozilla/5.0 (compatible; RadarIA/2.0)'},signal:AbortSignal.timeout(15000)});if(!r.ok)throw Error('Source unavailable');return r.text();};
 const results=await Promise.all(configs.map(async c=>{
  try{const checkedAt=new Date().toISOString();let offers:FreeOffer[];
   const creative=creativeCatalog.find(s=>s.id===c.id);
   if(creative){const pages=await Promise.all([c.url,...creative.extraUrls].map(request));offers=parseCreativeOffers(pages.join(' '),c.id,checkedAt);}
   else if(c.id==='router')offers=parseFreeRouter(router?(await router)||{}:JSON.parse(await request(c.url)),checkedAt);
   else if(c.id==='google')offers=parseFreeGoogle(await request(c.url),checkedAt);
   else if(c.id==='openai')offers=parseFreeOpenAI(await request(c.url),checkedAt);
   else if(c.id==='anthropic')offers=parseFreeClaude(await request(c.url),checkedAt);
   else if(c.id===flowImage.id)offers=parseFreeFlowImages(await request(c.url),checkedAt);
   else{const [web,docs]=await Promise.all([request(c.url),request('https://api-docs.deepseek.com/')]);offers=parseFreeDeepSeek(web,docs,checkedAt);}
   return {offers,source:{...c,checkedAt,status:'live' as const}};
  }catch{const previous=fallback.sources.some(s=>s.id===c.id)?fallback:initialFreeAccess;return {offers:previous.offers.filter(o=>o.source===c.url),source:{...c,checkedAt:previous.sources.find(s=>s.id===c.id)?.checkedAt||'',status:'saved' as const}};}
 }));return {offers:results.flatMap(r=>r.offers),sources:results.map(r=>r.source)};
}
