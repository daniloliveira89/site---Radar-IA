export const OPENROUTER_CATALOGUE='https://openrouter.ai/api/v1/models';
export type RouterCatalogue={data?:{id:string;name:string;canonical_slug?:string;pricing?:{prompt?:string;completion?:string};architecture?:{output_modalities?:string[]}}[]};
export async function fetchRouterCatalogue():Promise<RouterCatalogue>{
 const response=await fetch(OPENROUTER_CATALOGUE,{signal:AbortSignal.timeout(15000)});
 if(!response.ok)throw Error('OpenRouter catalogue unavailable');
 const catalogue:RouterCatalogue=await response.json();
 if(!Array.isArray(catalogue.data)||catalogue.data.length<3)throw Error('OpenRouter catalogue incomplete');
 return catalogue;
}
