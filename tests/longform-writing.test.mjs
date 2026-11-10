import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {collectLongform,LONGFORM_CONFIG,parseLongform,formatLongformModel} from '../lib/longform-writing.ts';
import {selectComparisonRows} from '../lib/benchmark-selection.ts';
import {withLongformPrices} from '../lib/longform-pricing.ts';
import {costPerScore,filterRedValueRows} from '../lib/benchmark-value.ts';
import {writingChatAccess} from '../lib/free-access.ts';
import {modelAccess} from '../lib/model-access.ts';

const csv=`model_name,overall_score_100,chapter8_avg\n${Array.from({length:15},(_,i)=>`${i===14?'*GLM-5.3':'model-'+i},${70+i/10},16`).join('\n')}`;
const script=`let leaderboardDataLongformV3 = \`${csv}\`;`;

test('Longform reads the official score literal without executing page code',()=>{
 const rows=parseLongform(script+'\nthrow new Error("must not run");');
 assert.equal(rows.length,15);
 assert.deepEqual(rows[0],{model:'GLM-5.3',company:'Z AI',score:71.4,preview:false});
 assert.throws(()=>parseLongform(script.replace('71.4','101')));
 assert.throws(()=>parseLongform(script.replace('overall_score_100','elo')));
});

test('Longform follows the source script version and retains its own dated ranking on failure',async()=>{
 const original=globalThis.fetch, calls=[];
 try{
  globalThis.fetch=async url=>{calls.push(url);return new Response(calls.length===1?'<script src="creative_writing_longform.js?v=2.0.0" defer></script>':script);};
  const board=await collectLongform();
  assert.deepEqual(calls,[LONGFORM_CONFIG.source,'https://eqbench.com/creative_writing_longform.js?v=2.0.0']);
  assert.equal(board.status,'live');assert.equal(board.evaluation,'eq-bench');
  globalThis.fetch=async()=>new Response('<script src="//example.com/creative_writing_longform.js"></script>');
  const fallback=await collectLongform(board);
  assert.equal(fallback.status,'saved');assert.equal(fallback.checkedAt,board.checkedAt);assert.deepEqual(fallback.rows,board.rows);
  assert.equal((await collectLongform({...board,evaluation:'arena'})).rows.length,0);
 }finally{globalThis.fetch=original;}
});

test('bundled EQ-Bench and Arena writing results keep their original scales',()=>{
 const {creativeWritingLongform:eq,creativeWriting:arena}=JSON.parse(readFileSync(new URL('../lib/initial-benchmarks.json',import.meta.url)));
 assert.equal(eq.evaluation,'eq-bench');assert.equal(arena.evaluation,'arena');
 const top=selectComparisonRows(eq.rows,'top','text');
 assert.equal(top.length,15);assert(top.every(r=>r.score>=0&&r.score<=100));
 assert(arena.rows.every(r=>r.score>100));
});

test('Longform labels are readable while retaining each model version',()=>{
 const names=['gemini-3.8-flash','claude-opus-4-7','GLM-5.3','kimi-k3.1-pro','google/gemma-4-26B-A4B-it','gemini-3.1-flash-lite-preview'];
 assert.deepEqual(names.map(formatLongformModel),['Gemini 3.8 Flash','Claude Opus 4.7','GLM-5.3','Kimi K3.1 Pro','Gemma 4 26B A4B IT','Gemini 3.1 Flash-Lite Preview']);
});

test('Longform uses comparable 50/50 token prices for exact standard routes only',()=>{
 const rows=[{model:'claude-opus-5-5',company:'Anthropic',score:84},{model:'GLM-5.3',company:'Z AI',score:81},{model:'GLM-5.3-Flash',company:'Z AI',score:82}];
 const price=(id,prompt,completion)=>({id,pricing:{prompt,completion}});
 const source={...LONGFORM_CONFIG,rows,checkedAt:'2026-11-09T00:00:00Z'};
 const priced=withLongformPrices(source,{data:[price('anthropic/claude-opus-5.5','0.000004','0.000020'),price('z-ai/glm-5.3','0.000002','0.000004'),price('z-ai/glm-5.3-flash:free','0','0'),price('other/glm-5.3-flash','0.000001','0.000002')]},'2026-11-09T01:00:00Z');
 assert.deepEqual(priced.rows.map(r=>r.score),[84,81,82]);assert.equal(priced.checkedAt,source.checkedAt);
 assert.deepEqual(priced.rows.map(r=>r.costUSD),[12,3,undefined]);assert.equal(costPerScore(priced.rows[0],'text'),12/84);
 assert.deepEqual(withLongformPrices(source,undefined,'',priced),priced);
});
test('Creative Writing cost filters keep paid Grok separate from reported GLM chat access',()=>{
 const board={rows:[
  {model:'GLM-5.3',company:'Z AI',score:90,costUSD:3,costUnit:'1m-tokens'},
  {model:'grok-4.7',company:'xAI',score:85,costUSD:5,costUnit:'1m-tokens'},
 ]}, offers=writingChatAccess;
 const all=selectComparisonRows(board.rows,'value','text',offers),filtered=filterRedValueRows(all,'text',true);
 assert.equal(all.length,2);assert.equal(filtered.length,1);assert.equal(costPerScore(filtered[0],'text'),costPerScore(all[0],'text'));
 const free=selectComparisonRows(board.rows,'value-free','text',offers);
 const glm=free.find(r=>r.model==='GLM-5.3');assert(glm&&glm.costUSD>0);assert.equal(modelAccess(glm.company,glm.model,offers).en,'Free chat · reported');
 assert(!free.some(r=>r.model==='grok-4.7'));assert.equal(modelAccess('xAI','grok-4.7',offers).kind,'paid');
 assert.notEqual(modelAccess('Z AI','GLM-5.3-Flash',writingChatAccess).kind,'mixed');
});
