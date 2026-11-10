'use client';
import {useMemo,useState} from 'react';
import {Search,X,ArrowUpRight,Network,Code2,Music2,Film,BookOpen,Briefcase,Boxes,Sparkles,Globe2,Check,Info} from 'lucide-react';
import catalog from '../lib/ecosystems.json';
import Brand from './brand';
import {useLanguage,useLabels} from './language';
const icons:Record<string,typeof Sparkles>={'Assistentes':Sparkles,'Imagem e vídeo':Film,'Música e voz':Music2,'Pesquisa e estudo':BookOpen,'Desenvolvimento':Code2,'Produtividade':Briefcase,'Modelos e API':Boxes,'Integrações':Network};
export default function Ecosystems(){
 const {t,language}=useLanguage(),label=useLabels();
 const [company,setCompany]=useState('Google'),[group,setGroup]=useState('Todos'),[query,setQuery]=useState(''),[free,setFree]=useState(false);
 const normalize=(s:string)=>s.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g,'');
 const search=normalize(query).trim();
 const companyItems=catalog.items.filter(i=>company==='Todos'||i.company===company),groups=['Todos',...new Set(companyItems.map(i=>i.group))];
 const items=useMemo(()=>catalog.items.filter(i=>(company==='Todos'||i.company===company)&&(group==='Todos'||i.group===group)&&(!free||/grátis/.test(i.access))&&(!search||normalize([i.name,i.company,i.description,i.descriptionEn,i.aliases].join(' ')).includes(search))),[company,group,search,free]);
 const byGroup=groups.filter(g=>g!=='Todos').map(g=>({group:g,items:items.filter(i=>i.group===g)})).filter(g=>g.items.length),hubs=company==='Todos'?[]:(catalog.hubs as Record<string,string[]>)[company]||[];
 return <section className="ecosystems-panel">

 <div className="ecosystem-company-tabs" aria-label={t('Choose an ecosystem','Escolher ecossistema')}><button className={company==='Todos'?'active':''} aria-pressed={company==='Todos'} onClick={()=>{setCompany('Todos');setGroup('Todos');}}>{t('All','Todos')}</button>{catalog.companies.map(c=><button key={c} className={company===c?'active':''} aria-pressed={company===c} onClick={()=>{setCompany(c);setGroup('Todos');}}><Brand name={c} small/>{c==='Alibaba / Qwen'?'Qwen':c==='Black Forest Labs'?'FLUX':c}</button>)}</div>
 <div className="ecosystem-toolbar">
  <div className="ecosystem-search" role="search">
   <Search size={17} aria-hidden="true"/>
   <input type="search" aria-label={t('Search ecosystem tools','Buscar ferramentas no ecossistema')} placeholder={t('Search tools…','Buscar ferramentas…')} value={query} onChange={e=>setQuery(e.target.value)}/>
   {query&&<button type="button" onClick={e=>{e.currentTarget.parentElement?.querySelector('input')?.focus();setQuery('');}} aria-label={t('Clear search','Limpar busca')}><X size={16}/></button>}
  </div>
  <label className="free-filter"><input type="checkbox" checked={free} onChange={e=>setFree(e.target.checked)}/>{t('Confirmed free access','Acesso grátis confirmado')}</label>
 </div>
 <div className="ecosystem-groups" role="group" aria-label={t('Tool categories','Categorias de ferramentas')}>{groups.map(g=><button key={g} aria-pressed={group===g} className={group===g?'active':''} onClick={()=>setGroup(g)}>{label(g)}<span>{g==='Todos'?companyItems.length:companyItems.filter(i=>i.group===g).length}</span></button>)}</div>


 {byGroup.map(({group:g,items:rows})=>{const Icon=icons[g]||Boxes;return <section key={g} className="ecosystem-group-section"><div className="ecosystem-section-heading"><Icon size={19}/><h3>{label(g)}</h3><span>{rows.length}</span></div><div className="ecosystem-grid">{rows.map(item=><article key={item.id} className="ecosystem-card"><div className="ecosystem-card-top"><Brand name={item.company} small/><span className="tool-kind">{label(item.kind)}</span>{company==='Todos'&&<span>{item.company}</span>}<a href={item.source} target="_blank" rel="noopener noreferrer" aria-label={t('Source: ','Fonte: ')+item.name} title={t('Official source','Fonte oficial')}><Info size={14}/></a></div><h4>{item.name}</h4><p>{language==='en'?item.descriptionEn:item.description}</p><div className="tool-bottom"><span className={/grátis/.test(item.access)?'free-access':''}>{label(item.access)}</span><a href={item.url} target="_blank" rel="noopener noreferrer">{t('Explore','Explorar')} <ArrowUpRight size={14}/></a></div></article>)}</div></section>})}
 {!items.length&&<div className="empty-state"><Search size={28}/><h3>{t('No tools match this selection.','Nenhuma ferramenta nesta seleção.')}</h3><p>{t('Change the search, category or free-access filter.','Altere a busca, a categoria ou o filtro de acesso grátis.')}</p><button onClick={()=>{setQuery('');setGroup('Todos');setFree(false);}}>{t('Clear filters','Limpar filtros')}</button></div>}
 <details className="quiet-details page-details catalog-sources"><summary>{t('Details','Detalhes')}</summary><div className="details-body"><p>{t('Editorial review: Oct 23, 2026','Revisão editorial: 23/10/2026')}</p> {company==='Google'&&<div className="plan-note"><Sparkles size={17}/><p>{t('You have Google AI Pro. Benefits and limits differ across Gemini, Flow and Antigravity. AI Studio, Cloud credits and API use have their own terms.','Você tem Google AI Pro. Benefícios e limites variam entre Gemini, Flow e Antigravity. AI Studio, créditos Cloud e API têm condições próprias.')} <a href="https://gemini.google/subscriptions/" target="_blank" rel="noopener noreferrer">{t('See official benefits','Consultar benefícios oficiais')} <ArrowUpRight size={12}/></a></p></div>}<p>{t('This editorial map covers the public catalogue reviewed for this edition. It is not a list of every historical model version. New products require an editorial site update. Experiments and regional features may require an invitation, subscription or availability in your country.','Este mapa editorial reúne o catálogo público consultado nesta edição. Não é uma lista de todas as versões históricas dos modelos. Novos produtos exigem atualização editorial do site. Experimentos e recursos regionais podem exigir convite, assinatura ou disponibilidade no seu país.')}</p>{hubs.map(url=><a key={url} href={url} target="_blank" rel="noopener noreferrer">{new URL(url).hostname.replace('www.','')}<ArrowUpRight size={14}/></a>)}</div></details>
 </section>;
}
