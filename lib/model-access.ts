import {freeOffer,initialFreeAccess,isPaidGrok47,type FreeOffer,type FreeModality} from './free-access.ts';
// Access is checked independently from benchmark quality and open-weight licences.
export function modelAccess(company:string,model:string,offers:FreeOffer[]=initialFreeAccess.offers,modality:FreeModality='text'){
 const offer=freeOffer(company,model,offers,modality);
 if(modality==='text'&&isPaidGrok47(company,model))return {kind:'paid',en:'Paid API / plan',pt:'API / plano pagos',url:'https://x.ai/news/grok-4-7#pricing-and-availability'};
 if(offer)return {kind:'mixed',en:offer.reportedByUser?'Free chat · reported':offer.route==='web'?'Free · credits':offer.route==='api'?'Free API · limits':'Free chat · limits',pt:offer.reportedByUser?'Chat grátis · informado':offer.route==='web'?'Grátis · créditos':offer.route==='api'?'API grátis · limites':'Chat grátis · limites',url:offer.url,limitsEn:offer.limitsEn,limitsPt:offer.limitsPt};
 if(company==='xAI'||company==='Kimi')return {kind:'check',en:'Chat · free version to check',pt:'Chat · versão grátis a confirmar',url:company==='xAI'?'https://grok.com/':'https://www.kimi.com/'};
 if(company==='Midjourney')return {kind:'paid',en:'Paid plan',pt:'Plano pago',url:'https://docs.midjourney.com/hc/en-us/articles/27870484040333-Comparing-Midjourney-Plans'};
 if(company==='Runway')return {kind:'paid',en:'Paid · limited trial',pt:'Pago · teste limitado',url:'https://runway.com/pricing'};
 if(company==='Luma')return {kind:'paid',en:'Paid plan / API',pt:'Plano / API pagos',url:'https://lumalabs.ai/pricing'};
 const api:Record<string,string>={OpenAI:'https://openai.com/api/pricing/',Google:'https://ai.google.dev/gemini-api/docs/pricing',Anthropic:'https://claude.com/pricing',DeepSeek:'https://api-docs.deepseek.com/quick_start/pricing/',Kimi:'https://www.kimi.ai/help/membership/membership-pricing',xAI:'https://x.ai/pricing','Black Forest Labs':'https://bfl.ai/pricing',Mistral:'https://mistral.ai/pricing/'};
 if(api[company])return {kind:'paid',en:'Paid API / plan',pt:'API / plano pagos',url:api[company]};
 // Avoid extrapolating an open-weight licence or a free chat tier to an exact tested release.
 return {kind:'check',en:'Access unconfirmed',pt:'Acesso a confirmar',url:company==='Meta'?'https://www.meta.ai/':company==='Alibaba'?'https://qwen.ai/apiplatform':'https://artificialanalysis.ai/'};
}
