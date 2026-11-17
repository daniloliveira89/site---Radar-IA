import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {selectComparisonRows} from '../lib/benchmark-selection.ts';
import {newsBrief,conciseSourceText,newsCardSummary} from '../lib/news-brief.ts';
import {parseRss,SOURCES} from '../lib/feed.ts';
const data=JSON.parse(fs.readFileSync(new URL('../lib/initial-benchmarks.json',import.meta.url)));
test('language company view has 15 distinct providers with original scores',()=>{const b=data.boards[0],rows=selectComparisonRows(b.rows,'companies','text');assert.equal(rows.length,15);assert.equal(new Set(rows.map(r=>r.company)).size,15);for(const r of rows)assert(b.rows.includes(r));assert(rows.every((r,i)=>!i||rows[i-1].score>=r.score));});
test('top view limits are 15 for text, 20 for image and 12 for video',()=>{for(const [id,limit] of [['text',15],['image',20],['video',12]]){const {rows}=data.boards.find(b=>b.id===id);assert.equal(selectComparisonRows(rows,'top',id).length,Math.min(limit,rows.length));}assert.equal(selectComparisonRows(data.boards[0].rows.slice(0,3),'top','text').length,3);});
test('sentence cleanup preserves decimal model names and removes RSS boilerplate',()=>{const text='Kimi K3.1 Pro improves coding. It has a 1.5 million token context. The post Kimi K3.1 Pro appeared first on News.';assert.equal(conciseSourceText(text),'Kimi K3.1 Pro improves coding. It has a 1.5 million token context.');});
test('Kimi brief replaces the old cut-off fragment in both languages',()=>{const article={company:'Kimi',url:'https://www.kimi.com/en/blog/kimi-k3-1-pro',excerpt:'Introducing Kimi K3.1 Pro, our most capable 3T-class open-weight model with 1M-token context and major advances in coding, 3D modeling, and financial'};for(const language of ['en','pt']){const b=newsBrief(article,language);assert(b.summary&&b.evolution);assert.match(b.summary,/1 milh|one-million/);assert.notEqual(b.summary,b.evolution);assert(!newsCardSummary(article,language).includes('financial…'));}});
test('full source metadata is retained instead of cutting it after 22 words',()=>{const description='A new model with a large context window and multimodal capabilities for complex work across documents and applications, with improved coding and detailed financial research.';const xml=`<rss><channel><item><title>Introducing GPT-6.1 Terra</title><link>https://openai.com/index/introducing-gpt-6-1-terra/</link><description>${description}</description><pubDate>Thu, 29 Oct 2026 12:00:00 GMT</pubDate></item></channel></rss>`;const a=parseRss(xml,SOURCES[0])[0];assert.equal(a.excerpt,description);});

test('Qwen4-Max appears in comparative tables and news feed with editorial briefs', () => {
 const benchmarks = JSON.parse(fs.readFileSync(new URL('../lib/initial-benchmarks.json', import.meta.url)));
 const textBoard = benchmarks.boards.find(b => b.id === 'text');
 const qwenText = textBoard.rows.find(r => r.model.includes('Qwen4-Max'));
 assert(qwenText, 'Qwen4-Max must appear in Language & reasoning table');
 assert.equal(qwenText.company, 'Alibaba');
 assert.equal(qwenText.score, 48);

 const feed = JSON.parse(fs.readFileSync(new URL('../lib/initial-feed.json', import.meta.url)));
 const qwenNews = feed.articles.find(a => a.id.includes('qwen4-max') || a.title.includes('Qwen4-Max'));
 assert(qwenNews, 'Qwen4-Max must appear in news feed');
 assert.equal(qwenNews.company, 'Alibaba');

 for (const lang of ['en', 'pt']) {
  const brief = newsBrief(qwenNews, lang);
  assert(brief.summary && brief.summary.length > 0);
  assert(brief.evolution && brief.evolution.length > 0);
 }
});

test('Compare Video Generators top 8 order matches user rankings', () => {
 const benchmarks = JSON.parse(fs.readFileSync(new URL('../lib/initial-benchmarks.json', import.meta.url)));
 const videoBoard = benchmarks.boards.find(b => b.id === 'video');
 const top8 = videoBoard.rows.slice(0, 8);

 assert.match(top8[0].model, /Kling 4/i, 'Rank 1 must be Kling 4.0');
 assert.match(top8[1].model, /Seedance 2\.5/i, 'Rank 2 must be Seedance 2.5');
 assert.match(top8[2].model, /MiniMax H3/i, 'Rank 3 must be MiniMax H3');
 assert.match(top8[3].model, /Seedance 2\.0/i, 'Rank 4 must be Seedance 2.0');
 assert.match(top8[4].model, /Wan 3/i, 'Rank 5 must be Wan 3.0');
 assert.match(top8[5].model, /FLUX/i, 'Rank 6 must be Flux');
 assert.match(top8[6].model, /Omni/i, 'Rank 7 must be Gemini Omni');
 assert.match(top8[7].model, /Grok/i, 'Rank 8 must be Grok 1.5');

 for (let i = 1; i < top8.length; i++) {
  assert(top8[i - 1].score > top8[i].score, 'Scores must be strictly descending');
 }
});
