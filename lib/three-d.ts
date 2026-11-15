import type {Board,BenchmarkRow} from './benchmarks.ts';
import initialThreeD from './initial-3d.json' with {type:'json'};

export const THREE_D_LIMIT=10;
export const THREE_D_CONFIG={
 id:'image' as const,
 title:'Modelagem 3D',
 metric:'3D-Arena · Elo',
 scope:'3D Modeling',
 description:'Avaliação de modelos e ferramentas de IA para modelagem 3D, geração de malhas e texturas PBR.',
 source:'https://www.tripo3d.ai/',
 methodology:'https://www.tripo3d.ai/docs',
 evaluation:'arena' as const,
};

export type ThreeDPlanDetail = {
 name: string;
 price: string;
 monthlyUSD: number | null;
 credits: { en: string; pt: string };
 features: { en: string; pt: string };
};

export type ThreeDTool = {
 id: string;
 name: string;
 company: string;
 score: number;
 url: string;
 highlight: { en: string; pt: string };
 formats: string[];
 features: {
  textTo3D: boolean;
  imageTo3D: boolean;
  pbrTextures: boolean;
  autoRigging: boolean;
  retopology: boolean;
 };
 plans: {
  free: ThreeDPlanDetail;
  pro: ThreeDPlanDetail;
  studio?: ThreeDPlanDetail;
 };
};

export const THREE_D_TOOLS: ThreeDTool[] = [
 {
  id: 'tripo3d',
  name: 'Tripo3D (Tripo 3.0)',
  company: 'Tripo AI',
  score: 1215,
  url: 'https://www.tripo3d.ai/pricing',
  highlight: {
   en: 'Full 3D mesh in ~8s with auto-rigging, animation presets, quad retopology and 4K PBR textures.',
   pt: 'Malha 3D completa em ~8s com auto-rigging esquelético, animações, retopologia quad e texturas PBR 4K.'
  },
  formats: ['GLTF', 'FBX', 'OBJ', 'USDZ', 'STL'],
  features: { textTo3D: true, imageTo3D: true, pbrTextures: true, autoRigging: true, retopology: true },
  plans: {
   free: {
    name: 'Free',
    price: '$0',
    monthlyUSD: 0,
    credits: { en: '10 monthly credits (or daily trial bonuses)', pt: '10 créditos/mês (ou bônus diário de teste)' },
    features: { en: 'Standard quality, web 3D viewer, GLTF/USDZ export', pt: 'Qualidade padrão, visualizador web, exportação GLTF/USDZ' }
   },
   pro: {
    name: 'Pro',
    price: '$19.90 / mo',
    monthlyUSD: 19.90,
    credits: { en: '1,200 credits / mo (~40 fast generations)', pt: '1.200 créditos/mês (~40 gerações rápidas)' },
    features: { en: 'Priority speed, auto-rigging & animation, quad retopology, 4K PBR', pt: 'Geração rápida prioritária, auto-rigging e animação, retopologia quad, PBR 4K' }
   },
   studio: {
    name: 'Studio',
    price: '$49.90 / mo',
    monthlyUSD: 49.90,
    credits: { en: '4,000 credits / mo (LOD control & batch)', pt: '4.000 créditos/mês (controle de LOD e lote)' },
    features: { en: 'Dedicated API access, commercial license, custom polycount export', pt: 'Acesso dedicado à API, licença comercial total, exportação com polycount customizado' }
   }
  }
 },
 {
  id: 'rodin',
  name: 'Hyper3D Rodin (Gen-2)',
  company: 'Deemos',
  score: 1208,
  url: 'https://hyper3d.ai/pricing',
  highlight: {
   en: 'Leader in sculpting fidelity, high-density character meshes and baked displacement maps.',
   pt: 'Líder em fidelidade de escultura, malhas densas para personagens e mapas normais/displacement.'
  },
  formats: ['OBJ', 'FBX', 'GLTF', 'USDZ'],
  features: { textTo3D: true, imageTo3D: true, pbrTextures: true, autoRigging: false, retopology: true },
  plans: {
   free: {
    name: 'Trial',
    price: '$0',
    monthlyUSD: 0,
    credits: { en: '50 initial trial credits', pt: '50 créditos iniciais de avaliação' },
    features: { en: 'Watermarked preview, web inspector', pt: 'Prévia com marca d\'água, inspetor web' }
   },
   pro: {
    name: 'Pro',
    price: '$15.00 / mo',
    monthlyUSD: 15.00,
    credits: { en: '300 credits / mo', pt: '300 créditos/mês' },
    features: { en: 'Full PBR textures, clean quad mesh, commercial export', pt: 'Texturas PBR completas, malhas limpas, exportação comercial' }
   },
   studio: {
    name: 'Studio',
    price: '$50.00 / mo',
    monthlyUSD: 50.00,
    credits: { en: '1,200 credits / mo', pt: '1.200 créditos/mês' },
    features: { en: 'Ultra-dense meshes for VFX & games, priority processing', pt: 'Malhas ultra-densas para cinema e games, fila ultra-rápida' }
   }
  }
 },
 {
  id: 'meshy',
  name: 'Meshy-4',
  company: 'Meshy',
  score: 1190,
  url: 'https://www.meshy.ai/pricing',
  highlight: {
   en: 'Complete 3D generative suite: Text-to-3D, Image-to-3D and AI Texturing for existing models.',
   pt: 'Suíte 3D completa: Text-to-3D, Image-to-3D e texturização com IA em malhas existentes.'
  },
  formats: ['OBJ', 'FBX', 'GLTF', 'USDZ', 'BLEND'],
  features: { textTo3D: true, imageTo3D: true, pbrTextures: true, autoRigging: true, retopology: true },
  plans: {
   free: {
    name: 'Free',
    price: '$0',
    monthlyUSD: 0,
    credits: { en: '200 credits / mo', pt: '200 créditos/mês' },
    features: { en: 'Public community models, basic exports', pt: 'Modelos públicos na comunidade, exportação básica' }
   },
   pro: {
    name: 'Pro',
    price: '$20.00 / mo',
    monthlyUSD: 20.00,
    credits: { en: '1,000 credits / mo', pt: '1.000 créditos/mês' },
    features: { en: 'Private models, 4K PBR texturing, no watermark', pt: 'Gerações privadas, texturização 4K PBR, sem marca d\'água' }
   },
   studio: {
    name: 'Max',
    price: '$60.00 / mo',
    monthlyUSD: 60.00,
    credits: { en: '4,000 credits / mo', pt: '4.000 créditos/mês' },
    features: { en: '3 concurrent tasks, priority queue, high-poly exports', pt: '3 tarefas concorrentes simultâneas, maior prioridade, exportação high-poly' }
   }
  }
 },
 {
  id: 'trellis',
  name: 'TRELLIS (SLAT)',
  company: 'Microsoft Research',
  score: 1185,
  url: 'https://github.com/microsoft/TRELLIS',
  highlight: {
   en: 'Structured 3D Latents (SLAT) open research with precise geometry and radiance field decoding.',
   pt: 'Pesquisa aberta de ponta (SLAT) com alta precisão geométrica e decodificação híbrida radiante.'
  },
  formats: ['GLTF', 'OBJ', 'PLY'],
  features: { textTo3D: true, imageTo3D: true, pbrTextures: true, autoRigging: false, retopology: false },
  plans: {
   free: {
    name: 'Open Source',
    price: '$0',
    monthlyUSD: 0,
    credits: { en: 'Unlimited local execution & Hugging Face demo', pt: 'Execução local ilimitada e demo gratuita no Hugging Face' },
    features: { en: 'Weights available under research/open license', pt: 'Pesos abertos sob licença de pesquisa/open-source' }
   },
   pro: {
    name: 'Cloud Hosted',
    price: 'Usage-based',
    monthlyUSD: null,
    credits: { en: 'Pay-per-minute on GPU clouds (~$0.05 / run)', pt: 'Cobrança por GPU cloud (~US$ 0,05 / geração)' },
    features: { en: 'Scalable cloud API deployment', pt: 'Implantação em nuvem com API escalável' }
   }
  }
 },
 {
  id: 'csm',
  name: 'CSM Cube 2.5',
  company: 'CSM',
  score: 1162,
  url: 'https://3d.csm.ai/pricing',
  highlight: {
   en: 'Specialized in multi-view and single-image 3D reconstruction for games, simulation and 3D printing.',
   pt: 'Especializado em reconstrução 3D multi-visão e imagem única para simulação, games e impressão 3D.'
  },
  formats: ['OBJ', 'FBX', 'GLTF', 'USDZ'],
  features: { textTo3D: true, imageTo3D: true, pbrTextures: true, autoRigging: false, retopology: true },
  plans: {
   free: {
    name: 'Free',
    price: '$0',
    monthlyUSD: 0,
    credits: { en: '3 standard generations / mo', pt: '3 gerações padrão/mês' },
    features: { en: 'Interactive 3D viewer, community access', pt: 'Visualizador interativo 3D, acesso à comunidade' }
   },
   pro: {
    name: 'Pro',
    price: '$20.00 / mo',
    monthlyUSD: 20.00,
    credits: { en: 'Unlimited standard + 50 turbo generations / mo', pt: 'Gerações padrão ilimitadas + 50 turbo/mês' },
    features: { en: 'High-density mesh, quad retopology export', pt: 'Malha de alta densidade, exportação com retopologia quad' }
   },
   studio: {
    name: 'Business',
    price: '$100.00 / mo',
    monthlyUSD: 100.00,
    credits: { en: '250 turbo generations / mo', pt: '250 gerações turbo/mês' },
    features: { en: 'API access, commercial licensing, dedicated support', pt: 'Acesso à API, licenciamento comercial, suporte dedicado' }
   }
  }
 },
 {
  id: 'luma-genie',
  name: 'Luma Genie 2.0',
  company: 'Luma',
  score: 1152,
  url: 'https://lumalabs.ai/genie',
  highlight: {
   en: 'Instant asset generation (<10s) with 4 style variants, quad mesh export and Discord/web integration.',
   pt: 'Geração instantânea (<10s) com 4 variantes estilísticas, exportação quad mesh e integração Discord/web.'
  },
  formats: ['GLTF', 'OBJ', 'USDZ'],
  features: { textTo3D: true, imageTo3D: true, pbrTextures: true, autoRigging: false, retopology: true },
  plans: {
   free: {
    name: 'Free',
    price: '$0',
    monthlyUSD: 0,
    credits: { en: 'Daily free credits in web & Discord', pt: 'Créditos gratuitos diários na web e Discord' },
    features: { en: 'Quick prototyping, standard resolution', pt: 'Prototipagem rápida, resolução padrão' }
   },
   pro: {
    name: 'Plus',
    price: '$9.99 / mo',
    monthlyUSD: 9.99,
    credits: { en: 'Expanded generation quota & priority queue', pt: 'Cota ampliada de gerações e fila com prioridade' },
    features: { en: 'Fast queue, commercial downloads, clean quad mesh', pt: 'Fila rápida, downloads comerciais, malha quad limpa' }
   }
  }
 },
 {
  id: 'sloyd',
  name: 'Sloyd Generative 3D',
  company: 'Sloyd',
  score: 1138,
  url: 'https://www.sloyd.ai/pricing',
  highlight: {
   en: 'Parametric and modular game assets with optimized polycount, directly ready for Unreal and Unity.',
   pt: 'Assets de games paramétricos e modulares com polycount otimizado, prontos para Unreal e Unity.'
  },
  formats: ['OBJ', 'GLTF', 'FBX'],
  features: { textTo3D: true, imageTo3D: false, pbrTextures: true, autoRigging: false, retopology: true },
  plans: {
   free: {
    name: 'Free',
    price: '$0',
    monthlyUSD: 0,
    credits: { en: 'Personal non-commercial use', pt: 'Uso pessoal não-comercial' },
    features: { en: 'Basic prompts, low-poly assets', pt: 'Prompts básicos, assets low-poly' }
   },
   pro: {
    name: 'Pro',
    price: '$19.00 / mo',
    monthlyUSD: 19.00,
    credits: { en: 'Unlimited commercial downloads', pt: 'Downloads comerciais ilimitados' },
    features: { en: 'Real-time SDK for game engines, custom styling', pt: 'SDK em tempo real para game engines, estilos customizados' }
   }
  }
 },
 {
  id: 'spline',
  name: 'Spline AI 3D',
  company: 'Spline',
  score: 1125,
  url: 'https://spline.design/pricing',
  highlight: {
   en: 'Interactive web 3D scene & object generation with physics, animations and React Three Fiber code export.',
   pt: 'Geração de objetos e cenas 3D interativas para web com física, animações e exportação React Three Fiber.'
  },
  formats: ['GLTF', 'Spline', 'WebGL Code', 'MP4'],
  features: { textTo3D: true, imageTo3D: true, pbrTextures: true, autoRigging: true, retopology: false },
  plans: {
   free: {
    name: 'Free',
    price: '$0',
    monthlyUSD: 0,
    credits: { en: 'Unlimited files, basic AI generation', pt: 'Arquivos ilimitados, geração básica com IA' },
    features: { en: 'Interactive canvas, basic exports', pt: 'Canvas interativo, exportações básicas' }
   },
   pro: {
    name: 'Super',
    price: '$9.00 / mo',
    monthlyUSD: 9.00,
    credits: { en: 'Unlimited AI generations', pt: 'Gerações com IA ilimitadas' },
    features: { en: 'No watermarks, high-resolution textures, full code export', pt: 'Sem marca d\'água, texturas em alta resolução, exportação de código' }
   }
  }
 }
];

export async function collectThreeD(fallback?: Board): Promise<Board> {
 try {
  return fallback || (initialThreeD as Board);
 } catch {
  return fallback || (initialThreeD as Board);
 }
}
