import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {selectComparisonRows} from '../lib/benchmark-selection.ts';
import {freeOffer,modelKey,parseFreeRouter,parseFreeGoogle,collectFreeAccess,initialFreeAccess,parseFreeOpenAI,parseFreeClaude} from '../lib/free-access.ts';
const data=JSON.parse(fs.readFileSync(new URL('../lib/initial-benchmarks.json',import.meta.url)));
test('free ranking preserves verified distinct models and source scores',()=>{
 const b=data.boards[0],offers=(data.freeAccess||initialFreeAccess).offers,rows=selectComparisonRows(b.rows,'free','text',offers);assert(rows.length<=10);assert.equal(new Set(rows.map(r=>modelKey(r.model))).size,rows.length);
 for(const [i,r] of rows.entries()){assert(b.rows.includes(r));assert(freeOffer(r.company,r.model,offers));if(i)assert(rows[i-1].score>=r.score);}
});
test('free selection excludes trials and unknown models and does not pad or repeat efforts',()=>{
 const rows=[{model:'Unknown paid model',company:'Google',score:99},{model:'Gemini 3.8 Flash (high)',company:'Google',score:41},{model:'Gemini 3.8 Flash (medium)',company:'Google',score:40}].map(r=>({...r,preview:false}));
 assert.deepEqual(selectComparisonRows(rows,'free','text').map(r=>r.score),[41]);assert.deepEqual(selectComparisonRows(rows,'free','image'),[]);assert.deepEqual(selectComparisonRows(rows,'free','text',[]),[]);
 const fixture=Array.from({length:12},(_,i)=>({model:'Verified '+i,company:'Test',score:i,preview:false})),offers=fixture.map(r=>({model:r.model,company:r.company,route:'api',url:'https://example.com/',source:'https://example.com/',checkedAt:'2026-10-30'}));
 assert.deepEqual(selectComparisonRows(fixture,'free','text',offers).map(r=>r.score),[11,10,9,8,7,6,5,4,3,2]);
 assert.notEqual(modelKey('Model (June 2026)'),modelKey('Model (May 2026)'));
});
test('free API catalogue requires a zero price in both directions and explicit free route',()=>{
 const m=(id,prompt,completion)=>({id,name:'Google: Test (free)',pricing:{prompt,completion}});
 const rows=parseFreeRouter({data:[m('x:free','0','0'),m('y:free','0','0.0001'),m('z','0','0'),m('a:free','','0'),m('b:free',null,'0')]},'2026-10-30');assert.equal(rows.length,1);assert(rows[0].url.endsWith('x:free'));
});
test('Gemini free pricing requires free input and output in the same model table',()=>{
 const section=(name,input,output)=>`<h2>${name}</h2><table><tr><th>Input price</th><td>${input}</td><td>1</td></tr><tr><th>Output price (including thinking tokens)</th><td>${output}</td><td>2</td></tr></table>`;
 const rows=parseFreeGoogle(section('Gemini 4 Argon','Not available','Not available')+section('Gemini 3.8 Flash','Free of charge','Free of charge')+section('Gemini 3.1 Pro','Free of charge','Not available'),'2026-10-30');assert.deepEqual(rows.map(o=>o.model),['Gemini 3.8 Flash']);
});
test('failed free source checks preserve dated offers rather than claiming new verification',async()=>{
 const original=globalThis.fetch;globalThis.fetch=async()=>{throw Error('offline');};
 try{const result=await collectFreeAccess(initialFreeAccess);assert.deepEqual(result.offers,initialFreeAccess.offers);assert(result.sources.every(s=>s.status==='saved'));assert.deepEqual(result.sources.map(s=>s.checkedAt),initialFreeAccess.sources.map(s=>s.checkedAt));}finally{globalThis.fetch=original;}
});

test('ChatGPT Free matrix includes Luna and excludes paid Astra',()=>{
 const html='<p>Plan: Free, Feature: GPT-6 Luna, Yes Plan: Go, Feature: GPT-6 Luna, Yes Plan: Free, Feature: GPT-6 Astra, No Plan: Plus, Feature: GPT-6 Astra, Yes</p>';
 const offers=parseFreeOpenAI(html,'2026-10-30');assert.deepEqual(offers.map(o=>o.model),['GPT-6 Luna']);
 const rows=[{model:'GPT-6 Luna (max)',company:'OpenAI',score:28,preview:false},{model:'GPT-6 Astra (max)',company:'OpenAI',score:57,preview:false}];assert.deepEqual(selectComparisonRows(rows,'free','text',offers).map(r=>r.model),['GPT-6 Luna (max)']);
});
test('Claude uses the Free column and never upgrades a paid family to free',()=>{
 const html='<p>Sonnet 5.5 Haiku 5.5 Opus 5.5</p><table><tr><th>Features</th><th>Free</th><th>Pro</th></tr><tr><td>Sonnet</td><td>Yes</td><td>Yes</td></tr><tr><td>Haiku</td><td>Yes</td><td>Yes</td></tr><tr><td>Opus</td><td>No</td><td>Yes</td></tr></table>';
 const offers=parseFreeClaude(html,'2026-10-30');assert.deepEqual(offers.map(o=>o.model),['Claude Sonnet 5.5','Claude Haiku 5.5']);assert(offers.every(o=>o.scope==='family'));
});

test('creative rankings show up to five verified models per modality without modifying scores',()=>{
 for(const id of ['image','video']){const board=data.boards.find(b=>b.id===id),rows=selectComparisonRows(board.rows,'free',id);assert(rows.length<=5);assert.equal(new Set(rows.map(r=>r.model)).size,rows.length);for(const [i,row] of rows.entries()){assert(board.rows.includes(row));assert(freeOffer(row.company,row.model,initialFreeAccess.offers,id));if(i)assert(rows[i-1].score>=row.score);}}
});
test('free access stays in its modality and excludes paid Nano Banana and Veo variants',()=>{
 assert(!freeOffer('Google','Nano Banana 2.1',initialFreeAccess.offers,'image'));assert(!freeOffer('Google','Veo 3.1',initialFreeAccess.offers,'video'));assert(!freeOffer('Google','Veo 3.1 Fast',initialFreeAccess.offers,'text'));assert(freeOffer('Google','Nano Banana 2 (Gemini 3.1 Flash Image)',initialFreeAccess.offers,'image'));
});

test('OpenRouter free routes match exact EQ-Bench IDs without mixing versions',()=>{
 const source='https://openrouter.ai/api/v1/models';
 const offer={model:'Gemma 4 31B',company:'Google',route:'api',url:'https://openrouter.ai/google/gemma-4-31b-it:free',source,checkedAt:'2026-11-09'};
 assert.equal(freeOffer('Google','google/gemma-4-31B-it',[offer]),offer);
 assert.equal(freeOffer('Google','google/gemma-4-31b-it:free',[offer]),offer);
 assert.equal(freeOffer('Google','google/gemma-4-31b-base',[offer]),undefined);
 assert.equal(freeOffer('Google','other/gemma-4-31b-it',[offer]),undefined);
 assert.equal(freeOffer('Google','gemini-3.1-flash-lite-preview',[{...offer,model:'Gemini 3.1 Flash-Lite',url:'https://aistudio.google.com/'}]),undefined);
 const row={model:'google/gemma-4-31B-it',company:'Google',score:75};
 assert.deepEqual(selectComparisonRows([row],'free','text',[offer]),[row]);
});
