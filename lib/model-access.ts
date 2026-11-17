import {freeOffer,initialFreeAccess,isPaidGrok47,FLOW_IMAGE_SOURCE,type FreeOffer,type FreeModality} from './free-access.ts';
// Access is checked independently from benchmark quality and open-weight licences.
export function modelAccess(company:string,model:string,offers:FreeOffer[]=initialFreeAccess.offers,modality:FreeModality='text'){
 const offer=freeOffer(company,model,offers,modality);
 if(modality==='text'&&isPaidGrok47(company,model))return {kind:'paid',en:'Paid API / plan',pt:'API / plano pagos',url:'https://x.ai/news/grok-4-7#pricing-and-availability'};
 if(offer?.source===FLOW_IMAGE_SOURCE)return {kind:'mixed',en:'Free in Flow',pt:'Grátis no Flow',url:offer.url,limitsEn:offer.limitsEn,limitsPt:offer.limitsPt};
 if(offer)return {kind:'mixed',en:offer.reportedByUser?'Free chat · reported':offer.route==='web'?'Free · credits':offer.route==='api'?'Free API · limits':'Free chat · limits',pt:offer.reportedByUser?'Chat grátis · informado':offer.route==='web'?'Grátis · créditos':offer.route==='api'?'API grátis · limites':'Chat grátis · limites',url:offer.url,limitsEn:offer.limitsEn,limitsPt:offer.limitsPt};
 if(company==='xAI'||company==='Kimi')return {kind:'check',en:'Chat · free version to check',pt:'Chat · versão grátis a confirmar',url:company==='xAI'?'https://grok.com/':'https://www.kimi.com/'};
 if(company==='Midjourney')return {kind:'paid',en:'Paid plan',pt:'Plano pago',url:'https://docs.midjourney.com/hc/en-us/articles/27870484040333-Comparing-Midjourney-Plans'};
 if(company==='Runway')return {kind:'paid',en:'Paid · limited trial',pt:'Pago · teste limitado',url:'https://runway.com/pricing'};
 if(company==='Luma')return {kind:'paid',en:'Paid plan / API',pt:'Plano / API pagos',url:'https://lumalabs.ai/pricing'};
 if(company==='Kling')return {kind:'mixed',en:'Free credits · plans',pt:'Créditos grátis · planos',url:'https://klingai.com/'};
 if(company==='Higgsfield')return {kind:'paid',en:'Paid plan / trial',pt:'Plano pago / teste',url:'https://higgsfield.ai/'};
 if(company==='Adobe')return {kind:'paid',en:'Paid plan / credits',pt:'Plano pago / créditos',url:'https://www.adobe.com/products/firefly.html'};
 if(company==='Stability AI')return {kind:'mixed',en:'API / Open weights',pt:'API / Pesos abertos',url:'https://stability.ai/pricing'};
 if(company==='Amazon')return {kind:'paid',en:'AWS Bedrock API',pt:'API no AWS Bedrock',url:'https://aws.amazon.com/bedrock/pricing/'};
 if(company==='01.AI')return {kind:'paid',en:'Paid API / Yi Platform',pt:'API paga / Plataforma Yi',url:'https://platform.lingyiwanwu.com/'};
 if(company==='Baidu')return {kind:'paid',en:'Baidu Qianfan API',pt:'API Baidu Qianfan',url:'https://cloud.baidu.com/product/wenxinworkshop'};
 if(company==='AI21 Labs')return {kind:'paid',en:'AI21 Studio API',pt:'API AI21 Studio',url:'https://www.ai21.com/pricing'};
 if(company==='Haiper AI')return {kind:'mixed',en:'Free tier · credits',pt:'Grátis · créditos',url:'https://haiper.ai/pricing'};
 if(company==='Tripo AI')return {kind:'mixed',en:'Free tier · credits',pt:'Grátis · créditos',url:'https://www.tripo3d.ai/pricing'};
 if(company==='Deemos')return {kind:'mixed',en:'Free trial · credits',pt:'Teste grátis · créditos',url:'https://hyper3d.ai/pricing'};
 if(company==='Meshy')return {kind:'mixed',en:'Free tier · credits',pt:'Grátis · créditos',url:'https://www.meshy.ai/pricing'};
 if(company==='Microsoft Research')return {kind:'mixed',en:'Open source / demo',pt:'Código aberto / demo',url:'https://github.com/microsoft/TRELLIS'};
 if(company==='CSM')return {kind:'mixed',en:'Free tier · credits',pt:'Grátis · créditos',url:'https://3d.csm.ai/pricing'};
 if(company==='Sloyd')return {kind:'mixed',en:'Free tier · credits',pt:'Grátis · créditos',url:'https://www.sloyd.ai/pricing'};
 if(company==='Spline')return {kind:'mixed',en:'Free tier · plans',pt:'Grátis · planos',url:'https://spline.design/pricing'};
 const api:Record<string,string>={OpenAI:'https://openai.com/api/pricing/',Google:'https://ai.google.dev/gemini-api/docs/pricing',Anthropic:'https://claude.com/pricing',DeepSeek:'https://api-docs.deepseek.com/quick_start/pricing/',Kimi:'https://www.kimi.ai/help/membership/membership-pricing',xAI:'https://x.ai/pricing','Black Forest Labs':'https://bfl.ai/pricing',Mistral:'https://mistral.ai/pricing/'};
 if(api[company])return {kind:'paid',en:'Paid API / plan',pt:'API / plano pagos',url:api[company]};
 // Avoid extrapolating an open-weight licence or a free chat tier to an exact tested release.
 return {kind:'check',en:'Access unconfirmed',pt:'Acesso a confirmar',url:company==='Meta'?'https://www.meta.ai/':company==='Alibaba'?'https://qwen.ai/apiplatform':'https://artificialanalysis.ai/'};
}
