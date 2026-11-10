import {clean} from './feed.ts';
export type Plan={name:string,monthly:number|null,annual:number|null,note:string,notePt:string,source?:string,verifiedAt?:string,status?:'live'|'saved'};
export type Service={company:string,name:string,source:string,plans:Plan[],category:string,note:string,notePt:string,currency:string,verifiedAt:string,checkedAt:string|null,status:'live'|'partial'|'saved'|'manual',automatic:boolean};
export type Pricing={services:Service[]};
const number=(s:string)=>Number(s.replaceAll(',',''));
function captures(text:string,re:RegExp){const m=text.match(re);return m?m.slice(1).map(number):null;}
export function parsePrice(company:string,plan:Plan,text:string):{monthly:number,annual:number|null}|null{
 let values:number[]|null=null;
 const name=plan.name,esc=(s:string)=>s.replace(/[.*+?^${}()|[\]\\]/g,'\\$&');
 if(company==='OpenAI'){
  if(name==='Free'&&/\bFree\b/.test(text))values=[0];
  else if(name==='Plus')values=captures(text,/(?:for |Price:\s*)\$\s*([\d.]+)\s*\/month/i);
  else if(name.startsWith('Pro '))values=captures(text,new RegExp(esc(name)+'\\s+\\$\\s*([\\d,.]+)\\b'));
  // The Go help page omits a price. Do not treat an old launch price as a fresh quote.
 }
 if(company==='Google'){
  if(name==='Free')values=captures(text,/\$\s*(0)\s*\/\s*month\s+with a Google Account/i);
  else if(name.includes('Ultra')){
   const multiplier=name.includes('20x')?'20':'5';values=captures(text,new RegExp('\\$\\s*([\\d,.]+)\\s*\\/\\s*month:\\s*'+multiplier+'x','i'));
  }else values=captures(text,new RegExp(esc(name)+'[\\s\\S]{0,250}?\\$\\s*([\\d,.]+)\\s*\\/\\s*month','i'));
 }
 if(company==='Anthropic'){
  if(name==='Free')values=captures(text,/Free\s+Try Claude\s+\$\s*(0)\b/);
  if(name==='Pro'){const monthly=captures(text,/\$\s*([\d,.]+)\s+if billed monthly/i),annual=captures(text,/\$\s*([\d,.]+)\s+billed up front/i);if(monthly&&annual)values=[monthly[0],annual[0]];}
  if(name==='Max 5x')values=captures(text,/Max\s+For people[\s\S]{0,100}?From\s+\$\s*([\d,.]+)\s+Per month/i);
 }
 if(company==='xAI')values=captures(text,new RegExp('\\b'+esc(name)+'\\s+(?:Most popular\\s+)?\\$\\s*([\\d,.]+)\\s*\\/month','i'));
 if(company==='Kimi')values=captures(text,new RegExp('\\b'+esc(name)+'\\s+\\$\\s*([\\d,.]+)\\/month\\s+\\$\\s*([\\d,.]+)\\/year','i'));
 if(company==='Microsoft'){
  if(name==='Copilot Free'&&/limited free version of Copilot/i.test(text))values=[0];
  else {const label='Microsoft '+name;const monthly=captures(text,new RegExp(esc(label)+'\\s+\\$\\s*([\\d,.]+)\\s*\\/month','i'));const annual=captures(text,new RegExp(esc(label)+'\\s+\\$\\s*([\\d,.]+)\\s*\\/year','i'));if(monthly&&(plan.annual===null||annual))values=[monthly[0],...(annual||[])];}
 }
 if(company==='Mistral'){
  if(name==='Free'&&/Free\s+Your personal AI agent/.test(text))values=[0];
  else if(name==='Education')values=captures(text,/Verified students can get Mistral Pro for\s+\$\s*([\d,.]+)\s*\/\s*month/i);
  else values=captures(text,new RegExp('\\b'+esc(name)+'[\\s\\S]{0,180}?\\$\\s*([\\d,.]+)\\s*\\/(?:user\\/)?mo','i'));
 }
 if(company==='Runway'){
  if(name==='Free')values=captures(text,/Free forever[\s\S]{0,130}?\$\s*(0)\s*\/month/i);
  else {const v=captures(text,new RegExp('\\b'+esc(name)+'\\s+(?:Credits roll over 1 mo\\.\\s+)?Billed annually[\\s\\S]{0,140}?\\$\\s*([\\d,.]+)\\s+\\$\\s*([\\d,.]+)\\s*\\/month','i'));if(v)values=[v[0],Math.round(v[1]*12*100)/100];}
 }
 if(company==='Luma')values=captures(text,new RegExp('\\b'+esc(name)+'\\s+\\$\\s*([\\d,.]+)\\s*\\/month\\s+\\$\\s*([\\d,.]+)\\s+billed yearly','i'));
 if(company==='Midjourney'){
  const index=['Basic','Standard','Pro','Mega'].indexOf(name),m=captures(text,/Monthly Price\s+\$\s*([\d,.]+)\s+\$\s*([\d,.]+)\s+\$\s*([\d,.]+)\s+\$\s*([\d,.]+)/i),a=captures(text,/Annual Price\s+\$\s*([\d,.]+)\s*\(\$\s*[\d,.]+\s*\/\s*month\)\s+\$\s*([\d,.]+)\s*\(\$\s*[\d,.]+\s*\/\s*month\)\s+\$\s*([\d,.]+)\s*\(\$\s*[\d,.]+\s*\/\s*month\)\s+\$\s*([\d,.]+)/i);if(index>=0&&m&&a)values=[m[index],a[index]];
 }
 if(!values||!Number.isFinite(values[0])||values[0]<0||values[0]>10000||(plan.annual!==null&&!Number.isFinite(values[1])))return null;
 return {monthly:values[0],annual:plan.annual===null?null:values[1]};
}
export async function collectPricing(fallback:Pricing):Promise<Pricing>{
 const checkedAt=new Date().toISOString(),requests=new Map<string,Promise<string>>();
 const get=(url:string)=>{if(!requests.has(url))requests.set(url,(async()=>{const r=await fetch(url,{headers:{'User-Agent':'RadarIA/1.0 pricing-source-check','Accept':'text/html'},signal:AbortSignal.timeout(15000)});if(!r.ok)throw Error('Source unavailable');const html=await r.text();return clean(html.replace(/<(script|style|svg)\b[^>]*>[\s\S]*?<\/\1>/gi,' '));})());return requests.get(url)!;};
 const services=await Promise.all(fallback.services.map(async s=>{
  if(!s.automatic)return {...s,status:'manual' as const};
  const plans=await Promise.all(s.plans.map(async p=>{try{const text=await get(p.source||s.source),price=parsePrice(s.company,p,text);if(!price)throw Error('No confident quote');return {...p,...price,status:'live' as const,verifiedAt:checkedAt};}catch{return {...p,status:'saved' as const,verifiedAt:p.verifiedAt||s.verifiedAt};}}));
  const count=plans.filter(p=>p.status==='live').length;return {...s,plans,checkedAt,status:(count===plans.length?'live':count?'partial':'saved') as Service['status']};
 }));return {services};
}
