export type Category = 'Modelos' | 'Imagem' | 'Vídeo' | 'Áudio' | 'Aplicativos' | 'Empresas';
export type NewsKind = 'Novo modelo' | 'Teste grátis' | 'Ecossistema';
export type Article = { id: string; company: string; title: string; originalTitle: string; excerpt: string; summary: string; url: string; date: string | null; category: Category; important: boolean; topics: string[]; newsKind?: NewsKind };
export type SourceStatus = { id: string; company: string; name: string; url: string; status: 'ok' | 'error'; count: number; checkedAt: string; error?: string };
export type Feed = { articles: Article[]; sources: SourceStatus[]; fetchedAt: string; nextCheckAt: string };
type Source = { id: string; company: string; name: string; url: string; kind: 'rss' | 'html' | 'runway' | 'midjourney-versions' | 'z-ai-research'; path?: string };
export const SOURCES: Source[] = [
  { id: 'openai', company: 'OpenAI', name: 'OpenAI News', url: 'https://openai.com/news/rss.xml', kind: 'rss' },
  { id: 'deepmind', company: 'Google', name: 'Google DeepMind', url: 'https://deepmind.google/blog/rss.xml', kind: 'rss' },
  { id: 'google', company: 'Google', name: 'Google AI', url: 'https://blog.google/technology/ai/rss/', kind: 'rss' },
  { id: 'google-dev', company: 'Google', name: 'Google Developers · AI Studio e Antigravity', url: 'https://developers.googleblog.com/feeds/posts/default', kind: 'rss' },
  { id: 'anthropic', company: 'Anthropic', name: 'Anthropic · Claude', url: 'https://www.anthropic.com/news', kind: 'html', path: '/news/' },
  { id: 'anthropic-models', company: 'Anthropic', name: 'Anthropic · Modelos', url: 'https://www.anthropic.com/news/models', kind: 'html', path: '/news/' },
  { id: 'deepseek', company: 'DeepSeek', name: 'DeepSeek News', url: 'https://www.deepseek.com/en/news/', kind: 'html', path: '/en/news/' },
  { id: 'xai', company: 'xAI', name: 'xAI · Grok', url: 'https://x.ai/news', kind: 'html', path: '/news/' },
  { id: 'kimi', company: 'Kimi', name: 'Kimi · Moonshot', url: 'https://www.kimi.com/en/blog/', kind: 'html', path: '/en/blog/' },
  { id: 'z-ai', company: 'Z AI', name: 'Z.ai · GLM', url: 'https://www.zhipuai.cn/en/research', kind: 'z-ai-research' },
  { id: 'bfl', company: 'Black Forest Labs', name: 'Black Forest Labs · FLUX', url: 'https://blackforestlabs.ai/blog', kind: 'html', path: '/blog/' },
  { id: 'runway', company: 'Runway', name: 'Runway Changelog', url: 'https://runwayml.com/changelog', kind: 'runway' },
  { id: 'luma', company: 'Luma', name: 'Luma AI News', url: 'https://lumalabs.ai/news', kind: 'html', path: '/news/' },
  { id: 'midjourney', company: 'Midjourney', name: 'Midjourney · Model Releases', url: 'https://docs.midjourney.com/hc/en-us/articles/32199405667853-Version', kind: 'midjourney-versions' },
  { id: 'microsoft', company: 'Microsoft', name: 'Microsoft Blog', url: 'https://blogs.microsoft.com/feed/', kind: 'rss' },
  { id: 'meta', company: 'Meta', name: 'Meta Newsroom', url: 'https://about.fb.com/feed/', kind: 'rss' },
  { id: 'mistral', company: 'Mistral', name: 'Mistral News', url: 'https://mistral.ai/news/rss', kind: 'rss' },
];
export const COMPANIES = ['OpenAI', 'Google', 'Anthropic', 'DeepSeek', 'xAI', 'Kimi', 'Z AI', 'Black Forest Labs', 'Runway', 'Luma', 'Midjourney','Microsoft','Meta','Mistral'];
export const SIX_HOURS = 6 * 60 * 60 * 1000;
// Fixed start date requested by the owner, midnight in São Paulo (UTC−3).
export const NEWS_START = '2026-10-23T03:00:00.000Z';
export function newsKind(title:string,excerpt:string,company:string):NewsKind|undefined{
  const text=title+' '+excerpt;
  if(/\b(?:how to|how .* uses|how .* is using|tutorial|guide|tips|vs\.?|compared|comparison|benchmark|case study|safety|safely|policy|funding|investing|fund|partnership|partner network|economic|report|hiring|research paper|scaling storage|cyber mission|verification program)\b/i.test(title))return;
  if(/\b(?:free trial|trial credits|try .{0,60} for free|free (?:access|credits|trial)|(?:days|months|weeks) (?:of .{0,20})?free|teste gr[aá]tis|cr[eé]ditos gr[aá]tis)\b/i.test(text))return 'Teste grátis';
  const named=/\b(?:gpt[- ‑]?\d|claude (?:opus|sonnet|haiku|mythos|fable)|gemini[ -]?\d|deepseek[- ]?[vr]\d|kimi k\d|grok[ -]?\d|flux[ .-]?\d|gen-\d|veo[ -]?\d|sora[ -]?\d|ray[ -]?\d|lyria[ -]?\d|seedance[ -]?\d|kling[ -]?\d|qwen[- ]?[\d]|mistral (?:large|medium|small)|nano banana|wan[ -]?\d)\b/i.test(title);
  const launch=/\b(?:introducing|meet|launch(?:es|ed|ing)?|releas(?:e|es|ed|ing)|unveil(?:s|ed|ing)?|announc(?:e|es|ed|ing)|now available|available now|new model|preview|is here|debuts|new .{0,30}model)\b/i.test(title);
  const releaseHeadline=(company==='Z AI'&&/^GLM[- ](?:\d+(?:\.\d+)*(?:[A-Z]|-[\w]+)*|image|ocr|asr|tts)\s*[:：–—-]/i.test(title))||(company==='Midjourney'&&/^Midjourney (?:V|Niji )\d+(?:\.\d+)*$/i.test(title));
  if(releaseHeadline||named&&(launch||(/^[A-Z0-9]/.test(title)&&title.length<115&&!/\b(?:using|with|wins|achieves|scores|evaluation|performance|costs|benchmark|tips)\b/i.test(title))))return 'Novo modelo';
  const product=/\b(?:flow|antigravity|studio|gemini notebook|notebooklm|codex|chatgpt work|cowork|claude code|claude design|grok bot|grok build|kimi (?:work|code|claw)|stitch|opal|jules|pomelli|playground|genie|muse|vibe|agent platform|creative studio|api platform|ecosystem|workflows|plugins|connectors|skills|agents?|app|canvas|layers|pages)\b/i.test(text);
  if(product&&(launch||/^new\b/i.test(title)))return 'Ecossistema';
  if(named&&/\b(?:in luma|in runway|available on|now live in)\b/i.test(text))return 'Ecossistema';
  if(/\b(?:new model|launch(?:es|ed)? .{0,35}model|introducing .{0,35}model)\b/i.test(title))return 'Novo modelo';
}
export function isNewsEligible(a:Article,now=Date.now()):boolean{
  if(!a.date)return false;const d=Date.parse(a.date);
  return Number.isFinite(d)&&d>=Date.parse(NEWS_START)&&d<=now&&!!newsKind(a.originalTitle,a.excerpt,a.company);
}
export function clean(input: string): string {
  return input.replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g, '$1').replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi, '').replace(/<style\b[^>]*>[\s\S]*?<\/style>/gi, '').replace(/<[^>]+>/g, ' ').replace(/&#(x[\da-f]+|\d+);/gi, (_, n) => { const c = n[0].toLowerCase() === 'x' ? parseInt(n.slice(1), 16) : +n; return c > 0 && c < 0x110000 ? String.fromCodePoint(c) : ''; }).replace(/&(?:amp|lt|gt|quot|apos|nbsp|ndash|mdash|rsquo|lsquo|rdquo|ldquo);/g, x => ({'&amp;':'&','&lt;':'<','&gt;':'>','&quot;':'"','&apos;':"'",'&nbsp;':' ','&ndash;':'–','&mdash;':'—','&rsquo;':'’','&lsquo;':'‘','&rdquo;':'”','&ldquo;':'“'}[x] || x)).replace(/\s+/g, ' ').trim();
}
function tag(s: string, name: string) { return clean(s.match(new RegExp('<' + name + '(?:\\s[^>]*)?>([\\s\\S]*?)<\\/' + name + '>', 'i'))?.[1] || ''); }
function attr(s: string, name: string) { return clean(s.match(new RegExp('(?:^|\\s)' + name + '=["\u0027]([^"\u0027]*)["\u0027]', 'i'))?.[1] || ''); }
export function findDate(s: string): string | null {
  const matches = [s.match(/datetime=["']([^"']+)/i)?.[1], s.match(/\b20\d{2}-\d{2}-\d{2}(?:T[\d:.+Z-]+)?\b/)?.[0], clean(s).match(/\b(?:Jan(?:uary)?|Feb(?:ruary)?|Mar(?:ch)?|Apr(?:il)?|May|Jun(?:e)?|Jul(?:y)?|Aug(?:ust)?|Sep(?:tember)?|Oct(?:ober)?|Nov(?:ember)?|Dec(?:ember)?)\s+\d{1,2},?\s+20\d{2}\b/i)?.[0]];
  for (const value of matches) {
    if (!value) continue;
    if(/^20\d{2}-\d{2}-\d{2}$/.test(value))return value+'T12:00:00.000Z';
    const calendar=value.match(/^(\w+)\s+(\d{1,2}),?\s+(20\d{2})$/);
    if(calendar){const month=['jan','feb','mar','apr','may','jun','jul','aug','sep','oct','nov','dec'].indexOf(calendar[1].slice(0,3).toLowerCase());if(month>=0)return new Date(Date.UTC(+calendar[3],month,+calendar[2],12)).toISOString();}
    const d = new Date(value); if (!isNaN(+d)) return d.toISOString();
  }
  return null;
}
export function classify(title: string, excerpt: string, company: string) {
  const text = (title + ' ' + excerpt).toLowerCase();
  let category: Category = 'Empresas';
  if (/\b(video|veo|sora|ray[ -]?\d|kling|seedance|aleph|gen-\d)\b/.test(text)) category = 'Vídeo';
  else if (/\b(audio|voice|speech|music|sound|lyria|sfx|whisper)\b/.test(text)) category = 'Áudio';
  else if (/\b(image|imagen|flux|midjourney|photo|banana|upscal|background removal|foreground)/.test(text) || company === 'Midjourney') category = 'Imagem';
  else if (/\b(gpt[- ‑]?\d|claude (?:opus|sonnet|haiku|mythos|fable)|gemini[ -]?\d|deepseek[- ]?[vr]\d|kimi k\d|grok[ -]?\d|glm[- ]?\d|model|llm|gemma)\b/.test(text)) category = 'Modelos';
  else if (/\b(chatgpt|codex|agent|app|studio|canvas|search|workspace|flow|tool|mode|playground|games|dots)\b/.test(text)) category = 'Aplicativos';
  const version = /\b(gpt[- ‑]?\d|claude (?:opus|sonnet|haiku|mythos|fable)|gemini[ -]?\d|deepseek[- ]?[vr]\d|kimi k\d|grok[ -]?\d|flux[ .-]?\d|gen-\d|veo[ -]?\d|sora[ -]?\d|ray[ -]?\d|v\d+(?:\.\d+)?)\b/i.test(title);
  const launch = /\b(introducing|introduce|launch|launches|launched|releasing|released|release|unveiling|announcing|announces|new model|new features|now available|price|pricing|cheaper|free|available to everyone|for everyone)\b/i.test(title);
  const noise = /\b(benchmark|bench|study|research|report|safety|safely|policy|hiring|investment|fund|economic|education|university|quantum|peptide|forest types|matches senior|cuts model costs|how we|how .* uses|how .* is using|vs\.?|best .*generators|comparison|guide|tutorial|prompts for|tips for|case study)\b/i.test(title);
  const important = !noise && (version || launch || /\b(devday|i\/o|new .*agent|new .*video|new .*image)\b/i.test(title) || (['Runway','Luma','Midjourney'].includes(company)&&category!=='Empresas'&&/\b\d+(?:\.\d+)+\b/.test(title)));
  const topics: string[] = [];
  for (const [re, label] of [[/reason|thinking/, 'raciocínio'], [/cod(?:e|ing)|programming/, 'programação'], [/image.*edit|edit.*image/, 'edição de imagens'], [/text.to.video/, 'vídeo a partir de texto'], [/context/, 'janela de contexto'], [/faster|speed|latency/, 'velocidade'], [/cost|pricing|price|cheaper/, 'custos e preços'], [/agent|tool use/, 'agentes e ferramentas'], [/open.source|open.weight/, 'modelos abertos']] as [RegExp, string][]) if (re.test(text)) topics.push(label);
  const labels: Record<Category,string> = {Modelos:'modelos de IA',Imagem:'criação e edição de imagens',Vídeo:'geração e edição de vídeo',Áudio:'voz, áudio e música',Aplicativos:'aplicativos e ferramentas de IA',Empresas:'novidades da empresa'};
  const summary = topics.length ? `Anúncio sobre ${labels[category]}. Entre os temas citados pela fonte: ${topics.slice(0,3).join(', ')}.` : `Publicação da ${company} sobre ${labels[category]}. Abra o anúncio para conferir os recursos e as condições de acesso.`;
  const kind=newsKind(title,excerpt,company);
  return {category, important:!!kind, topics, summary,newsKind:kind};
}
export function displayTitle(title: string): string {
  return title.replace(/^Introducing\s+(?:the\s+)?/i, 'Conheça ').replace(/^Meet\s+/i, 'Conheça ').replace(/^Announcing\s+/i, 'Anunciado: ').replace(/^Previewing\s+/i, 'Prévia: ').replace(/^New\s+/i, 'Novidade: ').replace(/\bnow available\b/gi, 'já disponível').replace(/\bfor everyone\b/gi, 'para todos').replace(/\bImage to Video\b/gi, 'imagem para vídeo').replace(/\bText to Video\b/gi, 'texto para vídeo').replace(/\bProduct Updates\b/gi, 'Novidades do produto').replace(/\bwith References\b/gi, 'com referências').replace(/\bVideo Upscale\b/gi, 'ampliação de vídeo').replace(/\bImage Editing\b/gi, 'edição de imagens').replace(/\bBackground Removal\b/gi,'remoção de fundo').replace(/\bBuilt to solve your hardest problems\b/gi,'criado para resolver problemas complexos').replace(/\bour next era of frontier intelligence\b/gi,'uma nova etapa de IA de fronteira').replace(/\bfor Robotics\b/gi,'para robótica').replace(/\band Intelligent UI\b/gi,'e a interface inteligente').replace(/DevDay (\d+) Recap/i,'Resumo do DevDay $1');
}
function article(source: Source, title: string, excerpt: string, url: string, date: string | null): Article | null {
  title = clean(title).slice(0,240); excerpt = clean(excerpt);
  if (title.length < 5 || title.length > 239) return null;
  let u: URL; try {u = new URL(url, source.url);} catch {return null;}
  const zaiBlog=source.kind==='z-ai-research'&&u.hostname==='z.ai'&&/^\/blog\/[a-z0-9.-]+\/?$/i.test(u.pathname);
  if (u.protocol !== 'https:' || u.username || u.password || (!zaiBlog&&u.hostname.replace(/^www\./,'') !== new URL(source.url).hostname.replace(/^www\./,''))) return null;
  u.search = '';
  if(source.kind!=='midjourney-versions')u.hash = '';
  u.pathname = u.pathname.replace(/\/$/,'');
  // Keep publication dates as supplied; future-dated posts stay out of the feed.
  if (date && +new Date(date) > Date.now()) return null;
  const id = source.company + ':' + u.href + (source.kind === 'runway' ? ':' + title : '');
  return {id,company:source.company,title:displayTitle(title),originalTitle:title,excerpt:excerpt.slice(0,1600),url:u.href,date,...classify(title,excerpt,source.company)};
}
export function parseRss(xml: string, source: Source): Article[] {
  const result: Article[] = [];
  for (const m of xml.matchAll(/<(item|entry)(?:\s[^>]*)?>([\s\S]*?)<\/\1>/gi)) {
    const s = m[2]; const title = tag(s,'title'); const link = tag(s,'link') || attr(s.match(/<link\b[^>]*\/>/i)?.[0] || '', 'href');
    const rawDate = tag(s,'pubDate') || tag(s,'published') || tag(s,'updated');
    const parsed = rawDate ? new Date(rawDate) : null;
    const a = article(source,title,tag(s,'description') || tag(s,'summary'),link,parsed && !isNaN(+parsed) ? parsed.toISOString() : null);
    if (a) result.push(a);
    if (result.length >= 160) break;
  }
  return result;
}
function parseMidjourneyVersions(html:string,source:Source):Article[] {
  const items:Article[]=[];
  for(const match of html.matchAll(/<h2\b([^>]*)>([\s\S]*?)<\/h2>([\s\S]*?)(?=<h[12]\b|$)/gi)){
    const heading=clean(match[2]),anchor=attr(match[1],'id');
    if(!/^(?:V|Niji )\d+(?:\.\d+)*$/i.test(heading)||!/^[-\w]+$/.test(anchor))continue;
    const paragraphs=[...match[3].matchAll(/<p\b[^>]*>([\s\S]*?)<\/p>/gi)].map(p=>clean(p[1]));
    const release=paragraphs.map(p=>p.match(/\b(?:was |is )?(?:released|launched|made available)(?: as the default version)? on ([A-Za-z]+ \d{1,2},? 20\d{2})\b/i)?.[1]).find(Boolean);
    const date=release?findDate(release):null;
    if(!date)continue;
    const a=article(source,'Midjourney '+heading,paragraphs.slice(0,2).join(' '),'#'+anchor,date);
    if(a)items.push(a);
  }
  return items;
}
type ZaiPost={id?:number;title_en?:string;title_zh?:string;resume_en?:string;resume_zh?:string;createAt?:string;externalUrl_en?:string;contentType_en?:string};
function parseZaiResearch(html:string,source:Source):Article[]{
  // Read the publisher's dated listing data without executing its page scripts.
  const stream=[...html.matchAll(/<script[^>]*>self\.__next_f\.push\((\[1,"(?:[^"\\]|\\[\s\S])*"\])\)<\/script>/g)].map(m=>JSON.parse(m[1])[1] as string).join('');
  const line=stream.split('\n').find(row=>/^\w+:\[/.test(row)&&row.includes('"blogsItems":'));
  if(!line)return [];
  const data=JSON.parse(line.slice(line.indexOf(':')+1)) as [unknown,unknown,unknown,{children?:[unknown,unknown,unknown,{blogsItems?:ZaiPost[]}]}];
  const posts=data[3]?.children?.[3]?.blogsItems;
  if(!Array.isArray(posts))return [];
  return posts.slice(0,60).flatMap(p=>{
    if(!p||!Number.isSafeInteger(p.id)||typeof p.createAt!=='string')return [];
    const title=typeof p.title_en==='string'&&p.title_en||typeof p.title_zh==='string'&&p.title_zh;
    const date=findDate(p.createAt);
    if(!title||!date)return [];
    const url=typeof p.externalUrl_en==='string'&&p.externalUrl_en||`/${p.title_en?'en':'zh'}/research/${p.id}`;
    const summary=p.title_en?p.resume_en:p.resume_zh;
    const a=article(source,title,typeof summary==='string'?summary:'',url,date);
    return a?[a]:[];
  });
}
export function parseHtml(html: string, source: Source): Article[] {
  if(source.kind==='midjourney-versions')return parseMidjourneyVersions(html,source);
  if(source.kind==='z-ai-research')return parseZaiResearch(html,source);
  let safe = html.replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi,'').replace(/<style\b[^>]*>[\s\S]*?<\/style>/gi,'');
  if(source.id==='kimi')safe = safe.match(/<main\b[^>]*>([\s\S]*?)<\/main>/i)?.[1] || safe;
  const results = new Map<string,Article>();
  // Prefer structured publication metadata when the publisher includes it.
  function visit(value: unknown) {
    if (!value || typeof value !== 'object') return;
    if (Array.isArray(value)) {value.forEach(visit);return;}
    const v=value as Record<string,unknown>;
    if (v.headline && v.url && v.datePublished && (source.id!=='luma' || v.articleSection!=='Blog')) {
      const a=article(source,String(v.headline),String(v.description||''),String(v.url),findDate(String(v.datePublished)));
      if(a)results.set(a.id,a);
    }
    Object.values(v).forEach(visit);
  }
  for (const match of html.matchAll(/<script\b[^>]*type="application\/ld\+json"[^>]*>([\s\S]*?)<\/script>/gi)) {try {visit(JSON.parse(match[1]));}catch {}}
  if (source.company==='Anthropic') for(const match of safe.matchAll(/<li\b[^>]*data-listing-row[^>]*>([\s\S]*?)<\/li>/gi)) {
    const row=match[1], title=tag(row,'h3'), link=row.match(/<a\b[^>]*href="([^"]+)"/)?.[1];
    if(title&&link){const a=article(source,title,tag(row,'p'),link,findDate(row));if(a)results.set(a.id,a);}
  }
  if (source.kind === 'runway') {
    const pattern = /<div[^>]*class="[^"]*rw-bodycopy5[^>]*>([^<]+)<\/div>([\s\S]*?)(?=<div[^>]*class="[^"]*rw-bodycopy5|$)/gi;
    for (const match of safe.matchAll(pattern)) {
      const body = match[2]; const title = clean(body.match(/<(?:div|a)[^>]*class="[^"]*rw-h5[^"]*"[^>]*>([\s\S]*?)<\/(?:div|a)>/)?.[1] || '');
      const desc = clean(body.match(/<div[^>]*class="[^"]*rw-bodycopy2[^"]*"[^>]*>([\s\S]*?)<\/div>/)?.[1] || '');
      const a = article(source,title,desc,source.url,findDate(match[1])); if (a) results.set(a.id,a);
    }
    return [...results.values()].slice(0,45);
  }
  for (const m of safe.matchAll(/<a\b([^>]*)>([\s\S]*?)<\/a>/gi)) {
    const href = attr(m[1],'href'); if (!href) continue;
    let u: URL; try {u = new URL(href, source.url);} catch {continue;}
    if (!source.path || !u.pathname.startsWith(source.path) || u.pathname.replace(/\/$/,'') === source.path.replace(/\/$/,'')) continue;
    if (/\/(announcements|research|policy|economic-research|about|tag|page|category|topics|models|features|product|safeguards|partnerships)(\/|$)/.test(u.pathname)) continue;
    const body = m[2];
    let title = clean(body.match(/<h[1-6]\b[^>]*>([\s\S]*?)<\/h[1-6]>/i)?.[1] || attr(m[1],'title') || attr(m[1],'aria-label') || '');
    if (!title) { const withoutDates = body.replace(/<time\b[^>]*>[\s\S]*?<\/time>/gi,''); title = clean(withoutDates).replace(/^(?:Announcements|Product|Research|News|Company|Updates)\s*/,'').replace(/\b(?:Jan(?:uary)?|Feb(?:ruary)?|Mar(?:ch)?|Apr(?:il)?|May|Jun(?:e)?|Jul(?:y)?|Aug(?:ust)?|Sep(?:tember)?|Oct(?:ober)?|Nov(?:ember)?|Dec(?:ember)?)\s+\d{1,2},?\s+20\d{2}/g,'').trim(); }
    title = title.replace(/^Read blog post:\s*/i,'');
    const paragraphs=[...body.matchAll(/<p\b[^>]*>([\s\S]*?)<\/p>/gi)].map(m=>clean(m[1])).filter(p=>p.length>35);
    const excerpt = paragraphs[paragraphs.length-1] || '';
    let date = findDate(body);
    // Kimi's link is an empty overlay; the date lives in its immediate card body.
    if (source.id === 'kimi' && /aria-label=/.test(m[1])) date = findDate(safe.slice(m.index! + m[0].length, m.index! + m[0].length + 2200));
    const a = article(source,title,excerpt,u.href,date); if (!a) continue;
    const prev = results.get(a.id); if (!prev || (!prev.date && a.date)) results.set(a.id,a);
  }
  return [...results.values()].filter(a=>!['Features','Announcements','Product','News','Research'].includes(a.title)).slice(0,60);
}
async function fetchText(url: string): Promise<string> {
  const response = await fetch(url,{headers:{'User-Agent':'Mozilla/5.0 (compatible; RadarIA/1.0; personal news reader)','Accept':'application/rss+xml,application/xml,text/html;q=0.9,*/*;q=0.7'},signal:AbortSignal.timeout(14000)});
  if (!response.ok) throw new Error(`HTTP ${response.status}`);
  const text = await response.text(); if (text.length > 4_000_000) throw new Error('Resposta muito grande');
  return text;
}
export async function collectFeed(): Promise<Feed> {
  const checkedAt = new Date().toISOString();
  const batches = await Promise.all(SOURCES.map(async source => {
    try {
      const html = await fetchText(source.url);
      let articles = source.kind === 'rss' ? parseRss(html,source) : parseHtml(html,source);
      if (!articles.length) throw new Error('Nenhuma publicação reconhecida');
      // Resolve missing metadata on a bounded number of official pages only.
      const missing = articles.filter(a=>!a.date||(a.important&&!a.excerpt)).slice(0,3);
      await Promise.all(missing.map(async a => {try {
        const text = await fetchText(a.url);
        const raw = text.match(/"datePublished"\s*:\s*"([^"]+)"/)?.[1] || text.match(/<meta[^>]*(?:property|name)="(?:article:published_time|date|publish-date)"[^>]*content="([^"]+)"/i)?.[1];
        const date = raw ? findDate(raw) : null;
        if (date) a.date = date;
        const descTag = [...text.matchAll(/<meta\b[^>]*>/gi)].map(m=>m[0]).find(s=>/name="description"|property="og:description"/.test(s));
        const desc = descTag ? attr(descTag,'content') : '';
        if (desc) {a.excerpt=desc.slice(0,1600); Object.assign(a,classify(a.originalTitle,desc,a.company));}
      } catch { /* Listing remains usable even when an individual page is unavailable. */ }}));
      articles = articles.filter(a => isNewsEligible(a));
      return {articles,status:{id:source.id,company:source.company,name:source.name,url:source.url,status:'ok' as const,count:articles.length,checkedAt}};
    } catch(e) {
      return {articles:[] as Article[],status:{id:source.id,company:source.company,name:source.name,url:source.url,status:'error' as const,count:0,checkedAt,error:e instanceof Error ? e.message : 'Fonte indisponível'}};
    }
  }));
  const all = new Map<string,Article>();
  for (const batch of batches) for (const item of batch.articles) all.set(item.id,item);
  // The same announcement can be syndicated across two official Google feeds.
  const unique=new Map<string,Article>();
  for(const a of all.values()){
    const key=a.company+':'+a.originalTitle.toLowerCase().normalize('NFKD').replace(/[^a-z0-9]/g,'');
    if(!unique.has(key))unique.set(key,a);
  }
  const articles = [...unique.values()].sort((a,b)=>+(new Date(b.date||0)) - +(new Date(a.date||0)));
  return {articles,sources:batches.map(b=>b.status),fetchedAt:checkedAt,nextCheckAt:new Date(+new Date(checkedAt)+SIX_HOURS).toISOString()};
}
