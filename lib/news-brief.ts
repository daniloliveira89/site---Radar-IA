import type {Article} from './feed.ts';
export type NewsBrief={summary:string;evolution?:string};
type EditorialBrief={company:string;path:RegExp;en:NewsBrief;pt:NewsBrief;source:string};
// Concise editorial summaries verified against the linked official announcements.
// Do not infer improvements for an unreviewed model from its provider or version name.
const reviewed:EditorialBrief[]=[{
 company:'Kimi',path:/\/kimi-k3-1-pro\/?$/,
 source:'https://www.kimi.ai/blog/kimi-k3-1-pro',
 en:{summary:'A new Kimi K3-series model with a one-million-token context window.',evolution:'Compared with K3, the launch reports gains in coding, 3D creation and financial research. A Highspeed variant is also available.'},
 pt:{summary:'Novo modelo da família Kimi K3, com janela de contexto de 1 milhão de tokens.',evolution:'Em relação ao K3, o anúncio relata avanços em programação, criação 3D e pesquisa financeira. Também há uma variante Highspeed.'}
},{
 company:'OpenAI',path:/\/introducing-gpt-6-1-terra\/?$/,
 source:'https://openai.com/index/introducing-gpt-6-1-terra/',
 en:{summary:'A model for visual reasoning and operating desktop applications.',evolution:'Succeeds GPT-5.6 Terra with stronger computer use, fewer factual errors and better coding, according to OpenAI. Standard API token prices are 50% lower.'},
 pt:{summary:'Modelo voltado a raciocínio visual e operação de aplicativos no computador.',evolution:'Sucede o GPT-5.6 Terra com melhor uso do computador, menos erros factuais e avanços em programação, segundo a OpenAI. As tarifas padrão por token da API caíram 50%.'}
},{
 company:'Meta',path:/\/muse-is-now-available-in-singapore-the-worlds-first-personal-ai-agent-built-for-everyone\/?$/,
 source:'https://about.fb.com/news/2026/10/muse-is-now-available-in-singapore-the-worlds-first-personal-ai-agent-built-for-everyone/',
 en:{summary:'Muse, Meta’s personal AI agent, is now available in Singapore.',evolution:'This announcement expands the service’s regional availability.'},
 pt:{summary:'O Muse, agente pessoal de IA da Meta, passa a estar disponível em Singapura.',evolution:'O anúncio amplia a disponibilidade regional do serviço.'}
},{
 company:'Google',path:/\/(?:gemini-4-carbon-our-next-frontier-model|introducing-gemini-4-carbon)\/?$/,
 source:'https://blog.google/innovation-and-ai/models-and-research/gemini-models/introducing-gemini-4-carbon/',
 en:{summary:'A Gemini 4 model for complex coding, sustained agent tasks and cybersecurity defense.',evolution:'Builds on Gemini 4 Argon with improvements in long-running engineering tasks and secure code generation, according to Google. Initial access is restricted to selected defenders and trusted partners.'},
 pt:{summary:'Modelo Gemini 4 para programação complexa, tarefas prolongadas de agentes e defesa cibernética.',evolution:'Evolui o Gemini 4 Argon com avanços em tarefas longas de engenharia e geração de código seguro, segundo o Google. O acesso inicial é restrito a defensores selecionados e parceiros de confiança.'}
}];
export function conciseSourceText(value:string,maxWords=75):string{
 const text=value.replace(/<[^>]*>/g,' ').replace(/\s+/g,' ').replace(/\s+The post [\s\S]*$/i,'').replace(/\s+(?:Read more|Learn more)\.?$/i,'').trim();
 if(!text)return '';
 // Segment sentences without splitting version numbers such as K3.1 or GPT-6.1.
 const sentences=typeof Intl.Segmenter==='function'?[...new Intl.Segmenter('en',{granularity:'sentence'}).segment(text)].map(s=>s.segment.trim()):text.replace(/(\d)\.(?=\d)/g,'$1\uE000').split(/(?<=[.!?])\s+(?=[A-Z])/).map(s=>s.replaceAll('\uE000','.').trim());
 const selected:string[]=[];let words=0;
 for(const sentence of sentences){const count=sentence.split(/\s+/).length;if(words+count>maxWords)break;selected.push(sentence);words+=count;if(selected.length===2)break;}
 if(selected.length)return selected.join(' ');
 // Long descriptions end at a word boundary and explicitly signal omitted text.
 return text.split(/\s+/).slice(0,maxWords).join(' ').replace(/[,:;–—-]+$/,'')+'…';
}
export function newsBrief(article:Article,language:'en'|'pt'):NewsBrief{
 let path='';try{path=new URL(article.url).pathname;}catch{}
 const match=reviewed.find(b=>b.company===article.company&&b.path.test(path));
 if(match)return match[language];
 const source=conciseSourceText(article.excerpt);
 if(language==='en'&&source)return {summary:source};
 if(language==='pt'&&source&&/\b(?:lançamento|lança|novo modelo|disponível|programação|raciocínio)\b/i.test(source))return {summary:source};
 if(language==='pt'&&source){
  const features:[RegExp,string][]=[[/\b(coding|programming|code)\b/i,'programação'],[/\b3D\b/i,'criação 3D'],[/\bfinanc(?:e|ial)\b/i,'pesquisa financeira'],[/\b(image|photo)\b/i,'imagens'],[/\bvideo\b/i,'vídeo'],[/\b(audio|music|voice)\b/i,'áudio e voz'],[/\b(computer use|desktop)\b/i,'uso do computador'],[/\b(agent|agentic)\b/i,'tarefas com agentes'],[/\b(reasoning|thinking)\b/i,'raciocínio']];
  const found=features.filter(([pattern])=>pattern.test(source)).map(([,name])=>name).slice(0,3);
  const focus=found.length>1?found.slice(0,-1).join(', ')+' e '+found.at(-1):found[0];
  return {summary:focus?`O anúncio da ${article.company} apresenta recursos para ${focus}.`:`A ${article.company} apresenta ${article.originalTitle.replace(/^(?:Introducing|Meet|Announcing)\s+/i,'').replace(/[.!?]$/,'')}.`};
 }
 return {summary:language==='en'?`Official announcement from ${article.company}. Product details are available at the source.`:`Anúncio oficial da ${article.company}. Os detalhes do produto estão disponíveis na fonte.`};
}
export function newsCardSummary(article:Article,language:'en'|'pt'):string{const brief=newsBrief(article,language);return [brief.summary,brief.evolution].filter(Boolean).join(' ');}
