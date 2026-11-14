'use client';
import {useMemo,useState} from 'react';
import {Search,X,ArrowUpRight,Sparkles,Cpu,Terminal,Check,Info,Zap,ExternalLink} from 'lucide-react';
import {MY_ACCOUNTS,findLatestProviderRelease,type MyAccount} from '../lib/my-ais';
import type {Feed} from '../lib/feed';
import Brand from './brand';
import {useLanguage} from './language';

export default function MyAIs({feed}:{feed?:Feed}){
  const {t,language,locale}=useLanguage();
  const [query,setQuery]=useState('');
  const [filter,setFilter]=useState<string>('all');

  const clock=(v:string)=>new Intl.DateTimeFormat(locale,{dateStyle:'short',timeStyle:'short',timeZone:'America/Sao_Paulo'}).format(new Date(v));

  const filteredAccounts=useMemo(()=>{
    const q=query.toLowerCase().trim();
    return MY_ACCOUNTS.filter(acc=>{
      if(filter==='antigravity'&&!acc.antigravity.supported) return false;
      if(filter==='codex'&&!acc.codex.supported) return false;
      if(filter==='free'&&(acc.tierBadge!=='free')) return false;
      if(filter!=='all'&&filter!=='antigravity'&&filter!=='codex'&&filter!=='free'&&acc.id!==filter) return false;
      if(!q) return true;

      const searchableText=[
        acc.name,
        acc.company,
        acc.tier,
        acc.tierEn,
        acc.summaryPt,
        acc.summaryEn,
        acc.antigravity.notesPt,
        acc.antigravity.notesEn,
        acc.codex.notesPt,
        acc.codex.notesEn,
        ...acc.models.map(m=>`${m.name} ${m.descriptionPt} ${m.descriptionEn} ${m.badge||''}`),
        ...acc.antigravity.models,
        ...acc.codex.models
      ].join(' ').toLowerCase();

      return searchableText.includes(q);
    });
  },[query,filter]);

  const totalModels=useMemo(()=>MY_ACCOUNTS.reduce((sum,acc)=>sum+acc.models.length,0),[]);

  return (
    <section className="my-ais-panel" aria-label={t('My AIs and accounts','Minhas IAs e contas')}>
      <div className="my-ais-hero">
        <div className="my-ais-hero-copy">
          <span className="terminal-label">{t('ACTIVE ACCOUNTS & VARIANTS','CONTAS ATIVAS & VARIANTES')}</span>
          <h2>{t('My AIs & Dev Workspaces','Minhas IAs & Ambientes de Desenvolvimento')}</h2>
        </div>
        <div className="my-ais-stats">
          <div className="my-ais-stat-card">
            <strong>{MY_ACCOUNTS.length}</strong>
            <span>{t('Accounts','Contas')}</span>
          </div>
          <div className="my-ais-stat-card">
            <strong>{totalModels}</strong>
            <span>{t('Frontier models','Modelos de ponta')}</span>
          </div>
          <div className="my-ais-stat-card">
            <strong>2</strong>
            <span>{t('IDE / CLI variants','Variantes IDE/CLI')}</span>
          </div>
        </div>
      </div>

      <div className="my-ais-toolbar">
        <div className="my-ais-filter-group" role="group" aria-label={t('Filter accounts','Filtrar contas')}>
          <button
            type="button"
            className={filter==='all'?'active':''}
            onClick={()=>setFilter('all')}
          >
            {t('All accounts','Todas as contas')} ({MY_ACCOUNTS.length})
          </button>
          {MY_ACCOUNTS.map(acc=>(
            <button
              key={acc.id}
              type="button"
              className={filter===acc.id?'active':''}
              onClick={()=>setFilter(acc.id)}
            >
              <Brand name={acc.company} small/>
              <span>{acc.name}</span>
            </button>
          ))}
          <button
            type="button"
            className={filter==='antigravity'?'active':''}
            onClick={()=>setFilter('antigravity')}
          >
            <Brand name="Google" small/>
            <span>Antigravity</span>
          </button>
          <button
            type="button"
            className={filter==='codex'?'active':''}
            onClick={()=>setFilter('codex')}
          >
            <Brand name="OpenAI" small/>
            <span>Codex</span>
          </button>
          <button
            type="button"
            className={filter==='free'?'active':''}
            onClick={()=>setFilter('free')}
          >
            <span>{t('Free accounts','Contas gratuitas')}</span>
          </button>
        </div>

        <label className="search-box">
          <Search size={16}/>
          <input
            type="search"
            placeholder={t('Search models, accounts or variants…','Buscar modelos, contas ou variantes…')}
            aria-label={t('Search My AIs','Buscar Minhas IAs')}
            value={query}
            onChange={e=>setQuery(e.target.value)}
          />
          {query&&<button aria-label={t('Clear search','Limpar busca')} onClick={()=>setQuery('')}><X size={15}/></button>}
        </label>
      </div>

      {filteredAccounts.length>0 ? (
        <div className="my-ais-grid">
          {filteredAccounts.map(acc=>{
            const latestRelease=findLatestProviderRelease(acc.company,feed,null,acc.id);
            return (
              <article key={acc.id} className="my-ai-card">
                <header className="my-ai-card-header">
                  <div className="my-ai-brand-group">
                    <Brand name={acc.company}/>
                    <div>
                      <h3>{acc.name}</h3>
                      {acc.company!==acc.name&&<span>{acc.company}</span>}
                    </div>
                  </div>
                  <div className="my-ai-header-actions">
                    <span className={`tier-badge tier-${acc.tierBadge}`}>
                      {language==='en'?acc.tierEn:acc.tier}
                    </span>
                    <a
                      href={acc.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="my-ai-link-button"
                      aria-label={`${t('Open','Abrir')} ${acc.name}`}
                      title={`${t('Open official platform: ','Abrir plataforma oficial: ')}${acc.name}`}
                    >
                      <ArrowUpRight size={17}/>
                    </a>
                  </div>
                </header>

                <p className="my-ai-summary">
                  {language==='en'?acc.summaryEn:acc.summaryPt}
                </p>

                {latestRelease&&(
                  <div className="my-ai-latest-box">
                    <span className="tiny-dot"/>
                    <div className="latest-info">
                      <span className="latest-label">{t('Latest update detected: ','Último lançamento detectado: ')}</span>
                      <a href={latestRelease.url} target="_blank" rel="noopener noreferrer">
                        {latestRelease.title}
                      </a>
                      {latestRelease.date&&(
                        <span className="latest-date"> · {clock(latestRelease.date)}</span>
                      )}
                    </div>
                  </div>
                )}

                <div className="my-ai-models-section">
                  <div className="section-title">
                    <Sparkles size={14}/>
                    <h4>{t('Available Models & Frontier Versions','Modelos Disponíveis & Versões de Ponta')}</h4>
                  </div>
                  <div className="models-list">
                    {acc.models.map(m=>(
                      <div key={m.name} className="model-row">
                        <div className="model-main">
                          <strong className="model-name">{m.name}</strong>
                          {m.badge&&(
                            <span className="model-badge">{m.badge}</span>
                          )}
                          {m.isLatest&&!m.badge&&(
                            <span className="model-badge latest-flag">{t('Latest','Recente')}</span>
                          )}
                        </div>
                        <p className="model-description">
                          {language==='en'?m.descriptionEn:m.descriptionPt}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="my-ai-variants-section">
                  <div className="section-title">
                    <Cpu size={14}/>
                    <h4>{t('Developer & Agent Variants','Variantes para Agentes & Desenvolvimento')}</h4>
                  </div>

                  <div className="variants-grid">
                    <div className="variant-box antigravity-box">
                      <div className="variant-box-top">
                        <span className="variant-name">
                          <Brand name="Google" small/>
                          <strong>Antigravity</strong>
                        </span>
                        <span className="variant-status">
                          <Check size={11}/>
                          {t('Ready','Compatível')}
                        </span>
                      </div>
                      <div className="variant-chips">
                        {acc.antigravity.models.map(m=>(
                          <span key={m} className="variant-chip antigravity">{m}</span>
                        ))}
                      </div>
                      <p className="variant-note">
                        {language==='en'?acc.antigravity.notesEn:acc.antigravity.notesPt}
                      </p>
                    </div>

                    <div className="variant-box codex-box">
                      <div className="variant-box-top">
                        <span className="variant-name">
                          <Brand name="OpenAI" small/>
                          <strong>Codex</strong>
                        </span>
                        <span className="variant-status">
                          <Check size={11}/>
                          {t('Ready','Compatível')}
                        </span>
                      </div>
                      <div className="variant-chips">
                        {acc.codex.models.map(m=>(
                          <span key={m} className="variant-chip codex">{m}</span>
                        ))}
                      </div>
                      <p className="variant-note">
                        {language==='en'?acc.codex.notesEn:acc.codex.notesPt}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="my-ai-card-footer">
                  <a href={acc.url} target="_blank" rel="noopener noreferrer" className="open-workspace-link">
                    <span>{t('Open Web Interface','Abrir Interface Web')}</span>
                    <ArrowUpRight size={14}/>
                  </a>
                </div>
              </article>
            );
          })}
        </div>
      ) : (
        <div className="empty-state">
          <span><Search size={28}/></span>
          <h3>{t('No accounts or models match your search.','Nenhuma IA ou modelo corresponde à sua busca.')}</h3>
          <p>{t('Try searching for another model name, company or variant.','Tente buscar por outro modelo, empresa ou variante.')}</p>
          <button type="button" onClick={()=>{setQuery('');setFilter('all');}}>
            {t('Clear filters','Limpar filtros')}
          </button>
        </div>
      )}

      <details className="quiet-details page-details">
        <summary>{t('About accounts, model versions and variants','Sobre contas, versões de modelos e variantes')}</summary>
        <div className="details-body">
          <div className="pricing-explainer">
            <Info size={16}/>
            <p>
              {t(
                'This section tracks your active AI accounts and synchronizes their frontier models with the scheduled collections of Radar IA. As providers launch new model versions or reasoning modes, they are dynamically updated here along with their Antigravity and Codex agentic variants.',
                'Esta seção mapeia suas contas de IA ativas e sincroniza os modelos de ponta com as coletas agendadas do Radar IA. Conforme as empresas lançam novas versões e modos de raciocínio, eles são atualizados dinamicamente aqui junto com as variantes para Antigravity e Codex.'
              )}
            </p>
          </div>
          <p>
            {t(
              'Included tiers: Gemini Pro Estudos (Google Workspace for Education), ChatGPT (GPT Go & GPT Free), Claude Free, Grok Free, Kimi Free, GLM Free (Z.ai), Deep Search Free (DeepSeek) and Muse Free (Meta AI).',
              'Contas catalogadas: Gemini Pro Estudos (Google Workspace for Education), ChatGPT (GPT Go e GPT Free), Claude Free, Grok Free, Kimi Free, GLM Free (Z.ai), Deep Search Free (DeepSeek) e Muse Free (Meta AI).'
            )}
          </p>
        </div>
      </details>
    </section>
  );
}
