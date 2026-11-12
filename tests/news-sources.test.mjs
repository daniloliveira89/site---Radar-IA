import test from 'node:test';
import assert from 'node:assert/strict';
import {NEWS_START, SOURCES, isNewsEligible, parseHtml} from '../lib/feed.ts';

test('Midjourney releases use their original date and link to the specific official version', () => {
 const source=SOURCES.find(s=>s.id==='midjourney');
 const html='<h2 id="v9">V9</h2><p>V9 was released on October 28, 2026. A new image model.</p><h2 id="v8">V8</h2><p>V8 was released on July 24, 2026.</p><h2 id="v10">V10</h2><p>Discussion posted November 1, 2026.</p>';
 const rows=parseHtml(html,source);
 assert.deepEqual(rows.map(r=>[r.originalTitle,r.date,r.category,r.newsKind]),[
  ['Midjourney V9','2026-10-28T12:00:00.000Z','Imagem','Novo modelo'],
  ['Midjourney V8','2026-07-24T12:00:00.000Z','Imagem','Novo modelo'],
 ]);
 assert.equal(rows[0].url,source.url+'#v9');
 assert.deepEqual(rows.filter(r=>isNewsEligible(r,Date.parse('2026-11-01'))),rows.slice(0,1));
});

test('GLM listing reads the publisher dates, accepts its official blog and rejects external links', () => {
 const source=SOURCES.find(s=>s.id==='z-ai');
 const posts=[
  {id:1,title_en:'GLM-5.3: Frontier Coding with improved tool use',createAt:NEWS_START,externalUrl_en:'https://z.ai/blog/glm-5.3?ref=source'},
  {id:2,title_zh:'GLM-5.3-Flash：新模型',createAt:NEWS_START},
  {id:3,title_en:'GLM-5.4: Launch',createAt:NEWS_START,externalUrl_en:'https://example.com/blog/glm-5.4'},
  {id:4,title_en:'GLM-5.4: Launch'},
 ];
 const record='6:'+JSON.stringify(['$', 'div', null, {children:['$', '$L18',null,{blogsItems:posts}]}]);
 const frame=str=>'<script>self.__next_f.push('+JSON.stringify([1,str])+')</script>';
 const rows=parseHtml(frame(record.slice(0,140))+frame(record.slice(140)),source);
 assert.deepEqual(rows.map(r=>[r.url,r.date,r.newsKind]),[
  ['https://z.ai/blog/glm-5.3',NEWS_START,'Novo modelo'],
  ['https://www.zhipuai.cn/zh/research/2',NEWS_START,'Novo modelo'],
 ]);
});

test('Google AI Studio changelog parses Gemini 4 Hydrogen and Argon releases', () => {
 const source = SOURCES.find(s => s.id === 'google-aistudio');
 assert(source, 'google-aistudio source should be defined');
 const markdown = `## November 12, 2026\n\n* **Gemini 4 Hydrogen (gemini-4-hydrogen) generally available (GA)**: Released [Gemini 4 Hydrogen](/docs/models/gemini-4-hydrogen), bringing cutting-edge intelligence to everyone with speed and efficiency.\n\n## October 13, 2026\n\n* **Gemini 4 Argon (gemini-4-argon) generally available (GA)**: Released [Gemini 4 Argon](/docs/models/gemini-4-argon), our frontier reasoning model.`;
 const rows = parseHtml(markdown, source);
 assert.equal(rows.length, 2);
 assert.equal(rows[0].originalTitle, 'Gemini 4 Hydrogen (gemini-4-hydrogen) generally available (GA)');
 assert.equal(rows[0].url, 'https://ai.google.dev/docs/models/gemini-4-hydrogen');
 assert.equal(rows[0].category, 'Modelos');
 assert.equal(rows[0].newsKind, 'Novo modelo');
});
