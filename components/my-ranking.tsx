'use client';
import {useMemo,useState} from 'react';
import {Trophy,Search,X,ArrowUpRight,Crown,Medal,Sparkles,Terminal,Zap,Check,Code2,Palette,FileText,Globe,Layers,Cpu,Atom,ShieldCheck} from 'lucide-react';
import {RANKING_CATEGORIES,RANKED_AIS,type RankingCategory,type RankedAI} from '../lib/my-ranking';
import Brand from './brand';
import {useLanguage} from './language';

export default function MyRanking(){
  const {t,language}=useLanguage();
  const [selectedCategory,setSelectedCategory]=useState<RankingCategory>('all');
  const [query,setQuery]=useState('');
  const [variantFilter,setVariantFilter]=useState<'all'|'antigravity'|'codex'|'aistudio'>('all');

  const filteredItems=useMemo(()=>{
    const q=query.toLowerCase().trim();
    return RANKED_AIS.filter(item=>{
      if(selectedCategory!=='all'&&item.category!==selectedCategory) return false;
      if(variantFilter==='antigravity'&&!item.antigravity) return false;
      if(variantFilter==='codex'&&!item.codex) return false;
      if(variantFilter==='aistudio'&&!item.aiStudio) return false;
      if(!q) return true;

      const searchable=[
        item.model,
        item.company,
        item.accountName,
        item.tier,
        item.tierEn,
        item.badge,
        item.badgeEn,
        item.scoreMetric,
        item.scoreValue,
        item.whyBestPt,
        item.whyBestEn
      ].join(' ').toLowerCase();

      return searchable.includes(q);
    });
  },[selectedCategory,variantFilter,query]);

  const categoryGroups=useMemo(()=>{
    const groups:Record<string,RankedAI[]>={};
    for(const cat of RANKING_CATEGORIES){
      const items=filteredItems.filter(i=>i.category===cat.id);
      if(items.length>0){
        groups[cat.id]=items;
      }
    }
    return groups;
  },[filteredItems]);

  const categoryIcon=(catId:RankingCategory)=>{
    switch(catId){
      case 'code': return <Code2 size={16}/>;
      case 'writing': return <FileText size={16}/>;
      case 'webdesign': return <Palette size={16}/>;
      case 'image': return <Sparkles size={16}/>;
      case 'research': return <Globe size={16}/>;
      case 'science': return <Atom size={16}/>;
      case 'security': return <ShieldCheck size={16}/>;
      default: return <Trophy size={16}/>;
    }
  };

  return (
    <section className="my-ranking-panel" aria-label={t('My AI Ranking','Ranking das Minhas IAs')}>
      <div className="ranking-category-tabs" role="tablist" aria-label={t('Filter ranking by category','Filtrar ranking por categoria')}>
        <button
          type="button"
          role="tab"
          aria-selected={selectedCategory==='all'}
          className={selectedCategory==='all'?'active':''}
          onClick={()=>setSelectedCategory('all')}
        >
          <Trophy size={15}/>
          <span>{t('All categories','Todas as categorias')}</span>
        </button>
        {RANKING_CATEGORIES.map(cat=>(
          <button
            key={cat.id}
            type="button"
            role="tab"
            aria-selected={selectedCategory===cat.id}
            className={selectedCategory===cat.id?'active':''}
            onClick={()=>setSelectedCategory(cat.id)}
          >
            {categoryIcon(cat.id)}
            <span>{language==='en'?cat.nameEn:cat.namePt}</span>
          </button>
        ))}
      </div>

      <div className="ranking-toolbar">
        <div className="ranking-variants-filter">
          <span className="toolbar-caption">{t('Environment:','Ambiente:')}</span>
          <button
            type="button"
            className={variantFilter==='all'?'active':''}
            onClick={()=>setVariantFilter('all')}
          >
            {t('All','Todos')}
          </button>
          <button
            type="button"
            className={variantFilter==='antigravity'?'active':''}
            onClick={()=>setVariantFilter('antigravity')}
          >
            <Brand name="Google" small/>
            <span>Antigravity</span>
          </button>
          <button
            type="button"
            className={variantFilter==='codex'?'active':''}
            onClick={()=>setVariantFilter('codex')}
          >
            <Brand name="OpenAI" small/>
            <span>Codex</span>
          </button>
          <button
            type="button"
            className={variantFilter==='aistudio'?'active':''}
            onClick={()=>setVariantFilter('aistudio')}
          >
            <Cpu size={13}/>
            <span>Google AI Studio</span>
          </button>
        </div>

        <label className="search-box">
          <Search size={16}/>
          <input
            type="search"
            placeholder={t('Search ranked models, categories or scores…','Buscar modelos no ranking, notas ou categorias…')}
            aria-label={t('Search My AI Ranking','Buscar no Ranking de IAs')}
            value={query}
            onChange={e=>setQuery(e.target.value)}
          />
          {query&&<button aria-label={t('Clear search','Limpar busca')} onClick={()=>setQuery('')}><X size={15}/></button>}
        </label>
      </div>

      {Object.keys(categoryGroups).length>0 ? (
        <div className="ranking-groups-container">
          {RANKING_CATEGORIES.map(cat=>{
            const items=categoryGroups[cat.id];
            if(!items||!items.length) return null;
            return (
              <section key={cat.id} className="ranking-category-section">
                <div className="ranking-cards-list">
                  {items.map(item=>(
                    <article key={item.id} className={`ranking-card rank-${item.rank}`}>
                      <div className="rank-position-col">
                        <div className={`rank-badge rank-badge-${item.rank}`}>
                          {item.rank===1 ? (
                            <>
                              <Crown size={14}/>
                              <strong>#1</strong>
                            </>
                          ) : item.rank===2 ? (
                            <>
                              <Medal size={13}/>
                              <strong>#2</strong>
                            </>
                          ) : item.rank===3 ? (
                            <>
                              <Medal size={13}/>
                              <strong>#3</strong>
                            </>
                          ) : (
                            <strong>#{item.rank}</strong>
                          )}
                        </div>
                      </div>

                      <div className="rank-content-main">
                        <div className="rank-model-header">
                          <Brand name={item.company}/>
                          <div className="model-titles">
                            <h4>{item.model}</h4>
                            <div className="model-account-meta">
                              <span>
                                {variantFilter==='antigravity' ? 'Antigravity' : variantFilter==='codex' ? 'Codex' : item.accountName}
                              </span>
                              <span className="bullet-dot">·</span>
                              <span className={`tier-badge tier-${item.tierBadge}`}>
                                {variantFilter==='antigravity' ? 'Google Antigravity' : variantFilter==='codex' ? 'OpenAI Codex' : (language==='en'?item.tierEn:item.tier)}
                              </span>
                            </div>
                          </div>

                          <div className="score-highlight-pill">
                            <span className="highlight-text">{language==='en'?item.badgeEn:item.badge}</span>
                            <span className="score-val">{item.scoreValue}</span>
                          </div>
                        </div>

                        <div className="why-best-block">
                          <span className="why-best-label">
                            {t('Why it is the top choice:','Por que é a melhor escolha:')}
                          </span>
                          <p>{language==='en'?item.whyBestEn:item.whyBestPt}</p>
                        </div>

                        <div className="rank-card-actions">
                          <div className="rank-variants">
                            {item.antigravity&&(
                              <span className="variant-pill antigravity" title={language==='en'?item.antigravityNoteEn:item.antigravityNotePt}>
                                <Brand name="Google" small/>
                                <span>Antigravity</span>
                              </span>
                            )}
                            {item.codex&&(
                              <span className="variant-pill codex" title={language==='en'?item.codexNoteEn:item.codexNotePt}>
                                <Brand name="OpenAI" small/>
                                <span>Codex</span>
                              </span>
                            )}
                            {item.aiStudio&&(
                              <span className="variant-pill aistudio" title={language==='en'?item.aiStudioNoteEn:item.aiStudioNotePt}>
                                <Cpu size={11}/>
                                <span>Google AI Studio</span>
                              </span>
                            )}
                          </div>

                          <a
                            href={item.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="open-ai-button"
                            aria-label={`${t('Open','Abrir')} ${item.model}`}
                          >
                            <span>{t('Open AI','Abrir IA')}</span>
                            <ArrowUpRight size={14}/>
                          </a>
                        </div>
                      </div>
                    </article>
                  ))}
                </div>
              </section>
            );
          })}
        </div>
      ) : (
        <div className="empty-state">
          <span><Search size={28}/></span>
          <h3>{t('No ranked models match your search.','Nenhum modelo no ranking corresponde à busca.')}</h3>
          <p>{t('Try selecting another category or resetting search filters.','Tente selecionar outra categoria ou limpar a busca.')}</p>
          <button type="button" onClick={()=>{setQuery('');setSelectedCategory('all');setVariantFilter('all');}}>
            {t('Reset filters','Limpar filtros')}
          </button>
        </div>
      )}

      <details className="quiet-details page-details">
        <summary>{t('How the My AI Ranking was evaluated','Como o Ranking de IAs foi avaliado')}</summary>
        <div className="details-body">
          <div className="pricing-explainer">
            <Trophy size={16}/>
            <p>
              {t(
                'This personalized ranking cross-references your active accounts (Gemini Pro Estudos, Google AI Studio, ChatGPT Go & Free, Claude Free, Grok Free, Kimi Free, GLM Free, Deep Search Free and Muse Free) with official benchmark datasets tracked by Radar IA: DesignArena (Web Design), LMSYS Chatbot Arena (Creative Writing and General Elo), Artificial Analysis Intelligence Index, and SWE-bench.',
                'Este ranking personalizado cruza suas contas ativas (Gemini Pro Estudos, Google AI Studio, ChatGPT Go e Free, Claude Free, Grok Free, Kimi Free, GLM Free, Deep Search Free e Muse Free) com os dados de benchmarks oficiais do Radar IA: DesignArena (Web Design), LMSYS Chatbot Arena (Escrita Criativa e Elo Geral), Artificial Analysis Intelligence Index e SWE-bench.'
              )}
            </p>
          </div>
          <p>
            {t(
              'Rankings prioritize practical performance, output nuance, context retention and developer variant availability (Antigravity and Codex).',
              'As colocações priorizam desempenho prático real, nuance de escrita, retenção de contexto e suporte às variantes para desenvolvedores (Antigravity e Codex).'
            )}
          </p>
        </div>
      </details>
    </section>
  );
}
