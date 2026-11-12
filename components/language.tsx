'use client';
import {createContext,useContext,useEffect,useState,type ReactNode} from 'react';
type Language='en'|'pt';
const Context=createContext({language:'en' as Language,setLanguage:(_v:Language)=>{},t:(en:string,_pt:string)=>en,locale:'en-US'});
export function LanguageProvider({children}:{children:ReactNode}){
 const [language,setLanguage]=useState<Language>('en');
 useEffect(()=>{try{const v=localStorage.getItem('radar-language');if(v==='pt'||v==='en')setLanguage(v);}catch{}},[]);
 function change(v:Language){setLanguage(v);try{localStorage.setItem('radar-language',v);}catch{}}
 useEffect(()=>{document.documentElement.lang=language==='en'?'en':'pt-BR';},[language]);
 return <Context.Provider value={{language,setLanguage:change,t:(en,pt)=>language==='en'?en:pt,locale:language==='en'?'en-US':'pt-BR'}}>{children}</Context.Provider>;
}
export const useLanguage=()=>useContext(Context);
export const labels:Record<string,string>={'Novidades':'News','Ecossistemas':'Ecosystems','Comparativos':'Compare','Planos':'Plans','Minhas IAs':'My AIs','Não lidas':'Unread','Salvos':'Saved','Fontes':'Sources','Todas':'All','Todos':'All','Modelos':'Models','Imagem':'Image','Vídeo':'Video','Áudio':'Audio','Aplicativos':'Apps','Empresas':'Companies','Novo modelo':'New model','Teste grátis':'Free trial','Ecossistema':'Ecosystem','Assistentes':'Assistants','Imagem e vídeo':'Image & video','Música e voz':'Music & voice','Pesquisa e estudo':'Research & learning','Desenvolvimento':'Development','Produtividade':'Productivity','Modelos e API':'Models & API','Integrações':'Integrations','Ferramenta':'Tool','Produto':'Product','Recurso':'Feature','Modelo':'Model','Plataforma':'Platform','Experimento':'Experiment','Integração':'Integration','Biblioteca':'Library','Ver condições':'Check terms','Plano grátis':'Free plan','Faixa grátis':'Free tier','Lista de espera':'Waitlist'};
export function useLabels(){const {language}=useLanguage();return (s:string)=>language==='en'?(labels[s]||s):s;}
