import type {Article, Feed} from './feed';
import type {Benchmarks} from './benchmarks';

export type MyAccount = {
  id: string;
  name: string;
  company: string;
  tier: string;
  tierEn: string;
  tierBadge: 'pro' | 'free' | 'go' | 'edu';
  url: string;
  summaryPt: string;
  summaryEn: string;
  models: {
    name: string;
    descriptionPt: string;
    descriptionEn: string;
    isLatest?: boolean;
    badge?: string;
  }[];
  antigravity: {
    supported: boolean;
    models: string[];
    notesPt: string;
    notesEn: string;
  };
  codex: {
    supported: boolean;
    models: string[];
    notesPt: string;
    notesEn: string;
  };
};

export const MY_ACCOUNTS: MyAccount[] = [
  {
    id: 'gemini',
    name: 'Gemini',
    company: 'Google',
    tier: 'Gemini Pro Estudos',
    tierEn: 'Gemini Pro Education',
    tierBadge: 'edu',
    url: 'https://gemini.google.com/',
    summaryPt: 'Conta institucional / Google Workspace for Education com acesso aos recursos avançados do Gemini, cotas ampliadas e integração Google AI.',
    summaryEn: 'Institutional / Google Workspace for Education account with Gemini Advanced features, expanded quotas and Google AI integration.',
    models: [
      {
        name: 'Gemini 3.8 Flash',
        descriptionPt: 'Versão mais recente: multimodal ultrarrápido com raciocínio e síntese integrada.',
        descriptionEn: 'Latest release: ultra-fast multimodal with integrated reasoning and synthesis.',
        isLatest: true,
        badge: 'Mais Recente'
      },
      {
        name: 'Gemini 3.1 Pro / 2.5 Pro',
        descriptionPt: 'Raciocínio profundo de alto desempenho com janela de contexto estendida de 2M tokens.',
        descriptionEn: 'High-performance deep reasoning with extended 2M token context window.',
        isLatest: true,
        badge: 'Pro / Avançado'
      },
      {
        name: 'Gemini 2.5 Flash',
        descriptionPt: 'Multimodal de baixa latência ideal para respostas imediatas e tarefas diárias.',
        descriptionEn: 'Low-latency multimodal ideal for immediate responses and everyday workflows.'
      },
      {
        name: 'Gemini Advanced Thinking',
        descriptionPt: 'Cadeia de pensamento explícita para resolver problemas lógicos e matemáticos complexos.',
        descriptionEn: 'Explicit chain of thought to solve complex logical and mathematical problems.'
      },
      {
        name: 'Imagen 3 / Google Flow',
        descriptionPt: 'Geração fotorrealista de imagens e assets visuais integrados ao ecossistema Google.',
        descriptionEn: 'Photorealistic image generation and visual assets integrated with Google ecosystem.'
      }
    ],
    antigravity: {
      supported: true,
      models: ['Gemini 3.8 Flash', 'Gemini 2.5 Pro', 'Gemini 2.5 Flash', 'Flash Thinking'],
      notesPt: 'Nativamente integrado no Antigravity CLI e IDE via Google AI Studio e Google Cloud.',
      notesEn: 'Natively integrated in Antigravity CLI and IDE via Google AI Studio and Google Cloud.'
    },
    codex: {
      supported: true,
      models: ['Gemini 3.8 Flash', 'Gemini 2.5 Pro (Code)'],
      notesPt: 'Suporte completo no terminal Codex via Google Cloud Code CLI e APIs de automação.',
      notesEn: 'Full support in Codex terminal via Google Cloud Code CLI and automation APIs.'
    }
  },
  {
    id: 'chatgpt',
    name: 'ChatGPT',
    company: 'OpenAI',
    tier: 'GPT Go & GPT Free',
    tierEn: 'GPT Go & GPT Free',
    tierBadge: 'go',
    url: 'https://chatgpt.com/',
    summaryPt: 'Duas modalidades ativas: assinatura intermediária Go com cotas expandidas e plano Free contínuo.',
    summaryEn: 'Two active modes: intermediate Go tier with expanded quotas and continuous Free plan.',
    models: [
      {
        name: 'GPT-6 Luna',
        descriptionPt: 'Nova geração ágil e multimodal de alta capacidade de resposta.',
        descriptionEn: 'New agile and highly responsive multimodal generation.',
        isLatest: true,
        badge: 'Mais Recente'
      },
      {
        name: 'GPT-5 Thinking Mini',
        descriptionPt: 'Raciocínio lógico, analítico e de programação com reflexão guiada.',
        descriptionEn: 'Logical, analytical and coding reasoning with guided reflection.',
        isLatest: true,
        badge: 'Thinking'
      },
      {
        name: 'GPT-4o',
        descriptionPt: 'Modelo principal multimodal de ponta para visão, documentos e conversação fluida.',
        descriptionEn: 'Flagship multimodal model for vision, document analysis and fluid conversation.'
      },
      {
        name: 'GPT-4o mini',
        descriptionPt: 'Versão rápida e leve padrão sem limites severos de cota.',
        descriptionEn: 'Fast and lightweight standard model without tight quota limits.'
      },
      {
        name: 'o3-mini / o1-mini',
        descriptionPt: 'Especialista em exatas, refatoração de código e problemas de lógica algorítmica.',
        descriptionEn: 'Specialized in STEM, code refactoring and algorithmic logic.'
      },
      {
        name: 'SearchGPT',
        descriptionPt: 'Busca na web em tempo real conectada ao índice com links verificados.',
        descriptionEn: 'Real-time web search connected to index with verified citations.'
      }
    ],
    antigravity: {
      supported: true,
      models: ['GPT-4o', 'GPT-4o mini', 'o3-mini', 'GPT-5 Thinking'],
      notesPt: 'Compatível com subagentes do Antigravity via OpenAI API e conectores MCP.',
      notesEn: 'Compatible with Antigravity subagents via OpenAI API and MCP connectors.'
    },
    codex: {
      supported: true,
      models: ['OpenAI Codex', 'GPT-4o', 'o3-mini'],
      notesPt: 'Ambiente nativo para automação, CLI autônoma e geração de software no Codex.',
      notesEn: 'Native environment for automation, autonomous CLI and software gen in Codex.'
    }
  },
  {
    id: 'claude',
    name: 'Claude',
    company: 'Anthropic',
    tier: 'Claude Free',
    tierEn: 'Claude Free',
    tierBadge: 'free',
    url: 'https://claude.ai/',
    summaryPt: 'Plano gratuito da Anthropic com cota diária recorrente nos modelos líderes de raciocínio e escrita.',
    summaryEn: 'Anthropic free plan with recurring daily quota on leading reasoning and writing models.',
    models: [
      {
        name: 'Claude Sonnet 5.5',
        descriptionPt: 'Topo de linha em engenharia de software, raciocínio complexo e redação natural.',
        descriptionEn: 'Top-of-the-line in software engineering, complex reasoning and natural writing.',
        isLatest: true,
        badge: 'Destaque'
      },
      {
        name: 'Claude Haiku 5.5',
        descriptionPt: 'Modelo ultrarrápido para tarefas ágeis, síntese rápida e bate-papo dinâmico.',
        descriptionEn: 'Ultra-fast model for agile tasks, quick synthesis and fast chat.',
        isLatest: true
      },
      {
        name: 'Claude 3.5 Sonnet',
        descriptionPt: 'Referência consolidada em arquitetura de código, clareza e análise contextual.',
        descriptionEn: 'Consolidated reference in code architecture, clarity and contextual analysis.'
      },
      {
        name: 'Claude Artifacts',
        descriptionPt: 'Painel visual lateral interativo para renderização de HTML, código e protótipos.',
        descriptionEn: 'Interactive side panel for rendering HTML, live code and prototypes.'
      }
    ],
    antigravity: {
      supported: true,
      models: ['Claude Sonnet 5.5', 'Claude Haiku 5.5', 'Claude 3.5 Sonnet'],
      notesPt: 'Suporte a subagentes de pesquisa e geração de artefatos com a API da Anthropic.',
      notesEn: 'Support for research subagents and artifact generation with Anthropic API.'
    },
    codex: {
      supported: true,
      models: ['Claude Sonnet 5.5 (Claude Code)', 'Claude 3.5 Sonnet'],
      notesPt: 'Integrável via Claude Code CLI e automações de engenharia no Codex.',
      notesEn: 'Integratable via Claude Code CLI and engineering automations in Codex.'
    }
  },
  {
    id: 'grok',
    name: 'Grok',
    company: 'xAI',
    tier: 'Grok Free',
    tierEn: 'Grok Free',
    tierBadge: 'free',
    url: 'https://grok.com/',
    summaryPt: 'Acesso sem custo na plataforma Grok.com e na rede social X com busca em tempo real.',
    summaryEn: 'No-cost access on Grok.com and X social platform with real-time web search.',
    models: [
      {
        name: 'Grok 3',
        descriptionPt: 'Geração mais recente de raciocínio de ponta com índice ao vivo do X e da web.',
        descriptionEn: 'Latest frontier reasoning generation with live X and web index.',
        isLatest: true,
        badge: 'Mais Recente'
      },
      {
        name: 'Grok 3 Mini / Grok 2',
        descriptionPt: 'Modelos rápidos e eficientes com visão multimodal para inspeção de imagens.',
        descriptionEn: 'Fast, efficient models with multimodal vision for image inspection.'
      },
      {
        name: 'Think Mode & DeepSearch',
        descriptionPt: 'Modo de reflexão detalhada para resolver desafios lógicos e investigações profundas.',
        descriptionEn: 'Detailed reflection mode for logical challenges and deep investigative queries.'
      }
    ],
    antigravity: {
      supported: true,
      models: ['Grok 3', 'Grok 2 (API)'],
      notesPt: 'Compatível no Antigravity via xAI API oficial e rotas OpenRouter.',
      notesEn: 'Compatible in Antigravity via official xAI API and OpenRouter routes.'
    },
    codex: {
      supported: true,
      models: ['Grok 3 Mini', 'Grok 2'],
      notesPt: 'Acessível via scripts CLI e chaves de API compatíveis com terminal.',
      notesEn: 'Accessible via CLI scripts and terminal-compatible API keys.'
    }
  },
  {
    id: 'kimi',
    name: 'Kimi (Moonshot)',
    company: 'Kimi',
    tier: 'Kimi Free',
    tierEn: 'Kimi Free',
    tierBadge: 'free',
    url: 'https://www.kimi.com/',
    summaryPt: 'Chat gratuito da Moonshot AI com a maior janela de contexto do mercado e navegação web.',
    summaryEn: 'Free chat by Moonshot AI with the largest context window on the market and web browsing.',
    models: [
      {
        name: 'Kimi K3',
        descriptionPt: 'Modelo de raciocínio analítico com leitura e compreensão em larga escala.',
        descriptionEn: 'Analytical reasoning model with large-scale reading and comprehension.',
        isLatest: true,
        badge: 'Mais Recente'
      },
      {
        name: 'Kimi K3.1 Pro',
        descriptionPt: 'Janela massiva de 2M tokens para processar livros inteiros, repositórios e PDFs volumosos.',
        descriptionEn: 'Massive 2M token context window to process full books, repos and large PDFs.',
        isLatest: true,
        badge: '2M Contexto'
      },
      {
        name: 'Kimi 1.5',
        descriptionPt: 'Versão estável consolidada para síntese rápida e conferência de fontes.',
        descriptionEn: 'Stable consolidated model for fast synthesis and source checking.'
      },
      {
        name: 'Kimi Autonomous Search',
        descriptionPt: 'Agente de pesquisa que navega em múltiplos sites para coletar dados atualizados.',
        descriptionEn: 'Research agent that browses multiple websites to collect fresh data.'
      }
    ],
    antigravity: {
      supported: true,
      models: ['Kimi K3', 'Kimi K3.1 Pro'],
      notesPt: 'Excelente para subagentes de leitura de repositórios gigantes e documentações no Antigravity.',
      notesEn: 'Outstanding for reading giant repos and deep documentation subagents in Antigravity.'
    },
    codex: {
      supported: true,
      models: ['Kimi K3.1 Pro', 'Moonshot API'],
      notesPt: 'Inspeção profunda de bases de código complexas direto nas sessões de desenvolvimento.',
      notesEn: 'Deep inspection of complex codebases directly within dev sessions.'
    }
  },
  {
    id: 'glm',
    name: 'GLM (Z.ai)',
    company: 'Z AI',
    tier: 'GLM Free',
    tierEn: 'GLM Free',
    tierBadge: 'free',
    url: 'https://chat.z.ai/',
    summaryPt: 'Acesso sem custo na plataforma Z.ai / Zhipu AI para chat ilimitado e rotas de API com cota grátis.',
    summaryEn: 'Free access on Z.ai / Zhipu AI platform for unlimited chat and free API routes.',
    models: [
      {
        name: 'GLM-5.3',
        descriptionPt: 'Versão de ponta destacada em escrita criativa e raciocínio estruturado no ranking Arena.',
        descriptionEn: 'Top version highlighted in creative writing and structured reasoning on Arena.',
        isLatest: true,
        badge: 'Top Escrita'
      },
      {
        name: 'GLM-4-Plus',
        descriptionPt: 'Modelo robusto para tarefas analíticas, resumos longos e conversação multilíngue.',
        descriptionEn: 'Robust model for analytical tasks, long summaries and multilingual chat.'
      },
      {
        name: 'GLM-4-Flash',
        descriptionPt: 'Versão gratuita com velocidade extrema para respostas instantâneas.',
        descriptionEn: 'Zero-cost fast version with extreme speed for instant answers.'
      },
      {
        name: 'GLM Code Interpreter',
        descriptionPt: 'Execução de scripts Python e análise de dados tabulares no navegador.',
        descriptionEn: 'Python script execution and tabular data analysis in the browser.'
      }
    ],
    antigravity: {
      supported: true,
      models: ['GLM-5.3', 'GLM-4-Flash'],
      notesPt: 'Conexão via API Z.ai com compatibilidade OpenAI para subagentes do Antigravity.',
      notesEn: 'Connection via Z.ai API with OpenAI compatibility for Antigravity subagents.'
    },
    codex: {
      supported: true,
      models: ['GLM-4-Plus', 'GLM-4-Flash'],
      notesPt: 'Automações ágeis de código e refatoração assistida no Codex.',
      notesEn: 'Fast code automations and assisted refactoring in Codex.'
    }
  },
  {
    id: 'deepseek',
    name: 'DeepSeek (Deep Search)',
    company: 'DeepSeek',
    tier: 'Deep Search Free',
    tierEn: 'Deep Search Free',
    tierBadge: 'free',
    url: 'https://chat.deepseek.com/',
    summaryPt: 'Chat totalmente gratuito com modo de raciocínio profundo R1 e DeepSearch sem necessidade de plano pago.',
    summaryEn: 'Fully free chat with deep reasoning R1 and DeepSearch without requiring a paid plan.',
    models: [
      {
        name: 'DeepSeek-V4.1-Flash',
        descriptionPt: 'Versão mais rápida e recente com raciocínio e síntese integrada.',
        descriptionEn: 'Fastest and latest release with integrated reasoning and synthesis.',
        isLatest: true,
        badge: 'Mais Recente'
      },
      {
        name: 'DeepSeek-R1',
        descriptionPt: 'Modelo de raciocínio de código aberto de ponta mundial em matemática, lógica e código.',
        descriptionEn: 'Frontier open-weights reasoning model in mathematics, logic and coding.',
        isLatest: true,
        badge: 'Raciocínio R1'
      },
      {
        name: 'DeepSeek-V3',
        descriptionPt: 'Arquitetura MoE de 671B parâmetros com altíssima precisão e conhecimento enciclopédico.',
        descriptionEn: '671B-parameter MoE architecture with exceptional precision and knowledge.'
      },
      {
        name: 'DeepSeek DeepSearch',
        descriptionPt: 'Varredura profunda na web com agregação analítica de dezenas de fontes em simultâneo.',
        descriptionEn: 'Deep web scan with simultaneous analytical aggregation of dozens of sources.'
      }
    ],
    antigravity: {
      supported: true,
      models: ['DeepSeek-R1', 'DeepSeek-V3', 'DeepSeek-V4.1-Flash'],
      notesPt: 'Nativamente suportado via DeepSeek API / OpenRouter nos subagentes do Antigravity.',
      notesEn: 'Natively supported via DeepSeek API / OpenRouter in Antigravity subagents.'
    },
    codex: {
      supported: true,
      models: ['DeepSeek-R1 (Coding)', 'DeepSeek-V3'],
      notesPt: 'Excelente custo-benefício e acurácia cirúrgica para geração de software no Codex.',
      notesEn: 'Outstanding accuracy and cost efficiency for software generation in Codex.'
    }
  },
  {
    id: 'muse',
    name: 'Muse / Meta AI',
    company: 'Meta',
    tier: 'Muse Free (Meta AI)',
    tierEn: 'Muse Free (Meta AI)',
    tierBadge: 'free',
    url: 'https://www.meta.ai/',
    summaryPt: 'Ecossistema gratuito da Meta disponível no meta.ai, WhatsApp, Instagram e pesos abertos Llama.',
    summaryEn: 'Meta free ecosystem available on meta.ai, WhatsApp, Instagram and open-weight Llama models.',
    models: [
      {
        name: 'Muse Wonder (max)',
        descriptionPt: 'Top 1 mundial em Web Design e criação visual de interfaces no ranking DesignArena.',
        descriptionEn: 'Rank #1 worldwide in Web Design and visual UI creation on DesignArena.',
        isLatest: true,
        badge: '#1 Web Design'
      },
      {
        name: 'Muse Spark 1.3 (xhigh)',
        descriptionPt: 'Modelo de raciocínio avançado da família Muse com alta pontuação Elo.',
        descriptionEn: 'Advanced reasoning model from the Muse family with top Elo scores.',
        isLatest: true
      },
      {
        name: 'Muse Spark Open',
        descriptionPt: 'Variante aberta para experimentação e integração em pipelines de design.',
        descriptionEn: 'Open-weights variant for prototyping and design pipelines.'
      },
      {
        name: 'Llama 3.3 70B',
        descriptionPt: 'Modelo aberto de linguagem mais potente da Meta para tarefas analíticas e texto.',
        descriptionEn: 'Meta’s most powerful open language model for analytical tasks and text.'
      }
    ],
    antigravity: {
      supported: true,
      models: ['Llama 3.3 70B', 'Muse Spark Open', 'Llama 3.1 405B'],
      notesPt: 'Executável localmente (Ollama) ou em nuvem (Groq/OpenRouter) com os agentes Antigravity.',
      notesEn: 'Runnable locally (Ollama) or in cloud (Groq/OpenRouter) with Antigravity agents.'
    },
    codex: {
      supported: true,
      models: ['Llama 3.3 70B (Code)', 'CodeLlama'],
      notesPt: 'Compatível com tarefas de programação e autocompletar em ambientes Codex.',
      notesEn: 'Compatible with coding tasks and code completion in Codex environments.'
    }
  }
];

export function findLatestProviderRelease(company: string, feed?: Feed | null, benchmarks?: Benchmarks | null): { modelName?: string; date?: string; url?: string; title?: string } | null {
  if (feed?.articles) {
    const article = feed.articles.find(a => a.company === company && a.date);
    if (article) {
      return {
        modelName: article.title,
        date: article.date || undefined,
        url: article.url,
        title: article.title
      };
    }
  }
  if (benchmarks?.webDesign?.rows) {
    const webRow = benchmarks.webDesign.rows.find(r => r.company === company);
    if (webRow) {
      return {
        modelName: webRow.model,
        date: benchmarks.webDesign.publishedAt || undefined,
        url: benchmarks.webDesign.source,
        title: `${webRow.model} (${benchmarks.webDesign.metric} ${webRow.score})`
      };
    }
  }
  return null;
}
