import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {parseArena,collectArena,collectCreativeWriting,parseArenaPrice,CREATIVE_WRITING_CONFIG} from '../lib/arena.ts';
import {selectComparisonRows} from '../lib/benchmark-selection.ts';
import {costPerScore} from '../lib/benchmark-value.ts';
import {freeOffer,initialFreeAccess} from '../lib/free-access.ts';

const snapshot=JSON.parse(fs.readFileSync(new URL('../lib/initial-benchmarks.json',import.meta.url)));
const fixture=(heading='Text Arena English')=>`<h1>${heading}</h1><time datetime="2026-10-27T20:00:00.000Z">Oct 27</time><table><tr>${['Rank','Rank Spread','Model','Score','Votes','Cost/Task (P50)'].map(x=>`<th>${x}</th>`).join('')}</tr>${[1,2,3].map(i=>`<tr><td>${i}</td><td>1 4</td><td><svg><title>Moonshot</title></svg><a><span>Model ${i} (High)</span></a><span>Moonshot · MIT</span></td><td>${1500-i} ±9 ${i===1?'Preliminary':''}</td><td>4,403</td><td>$0.05</td></tr>`).join('')}</table>`;
test('Arena parses original ratings, intervals, votes and edition without borrowing API prices',()=>{
 const b=parseArena(fixture(),'text');assert.equal(b.rows.length,3);assert.equal(b.publishedAt,'2026-10-27T20:00:00.000Z');const r=b.rows[0];assert.equal(r.model,'Model 1 (High)');assert.equal(r.company,'Kimi');assert.equal(r.samples,4403);assert.equal(r.score,1499);assert.equal(r.low,1490);assert.equal(r.high,1508);assert.equal(r.preview,true);assert.equal(r.costUSD,undefined);
});
test('Arena rejects an overall or wrong-modality result when English text was requested',()=>{
 assert.throws(()=>parseArena(fixture('Text Arena Overall'),'text'));assert.throws(()=>parseArena(fixture('Text-to-image Arena'),'text'));assert.throws(()=>parseArena(fixture().replace('<th>Score</th>','<th>Price</th>'),'text'));
});
test('Creative Writing uses its own Arena category and preserves its dated data on a wrong-category response',async()=>{
 const html=fixture('Text Arena ✍️ Creative Writing');
 assert.throws(()=>parseArena(html,'text'));
 assert.throws(()=>parseArena(fixture(),'text','Creative Writing'));
 const original=globalThis.fetch;
 try{
  globalThis.fetch=async url=>{assert.equal(url,CREATIVE_WRITING_CONFIG.source);return new Response(html);};
  const live=await collectCreativeWriting();
  assert.equal(live.status,'live');assert.equal(live.scope,'Creative Writing');assert.equal(live.rows[0].score,1499);
  globalThis.fetch=async()=>new Response(fixture());
  const saved=await collectCreativeWriting(live);
  assert.equal(saved.status,'saved');assert.equal(saved.checkedAt,live.checkedAt);assert.deepEqual(saved.rows,live.rows);
 }finally{globalThis.fetch=original;}
});
test('the bundled Creative Writing data can supply the Top 15 without using Language results',()=>{
 const board=snapshot.creativeWriting;
 assert.equal(board.source,CREATIVE_WRITING_CONFIG.source);assert.equal(board.scope,'Creative Writing');assert(Number.isFinite(Date.parse(board.publishedAt)));
 const top=selectComparisonRows(board.rows,'top',board.id);
 assert.equal(top.length,15);assert(top.every(r=>r.samples>0));
 assert.notDeepEqual(top,selectComparisonRows(snapshot.arenas[0].rows,'top','text'));
});
test('offline Arena refresh preserves source dates, edition and ratings',async()=>{
 const original=globalThis.fetch;globalThis.fetch=async()=>{throw Error('offline');};try{const next=await collectArena(snapshot.arenas);for(const [i,b] of next.entries()){assert.equal(b.status,'saved');assert.equal(b.checkedAt,snapshot.arenas[i].checkedAt);assert.equal(b.publishedAt,snapshot.arenas[i].publishedAt);assert.deepEqual(b.rows,snapshot.arenas[i].rows);}}finally{globalThis.fetch=original;}
});
test('free value ranking uses only the verified free group, with real source API costs and missing prices last',()=>{
 for(const b of snapshot.boards){const free=selectComparisonRows(b.rows,'free',b.id),value=selectComparisonRows(b.rows,'value-free',b.id);assert(value.length<=(b.id==='text'?10:5));assert.deepEqual(new Set(value),new Set(free));for(const [i,r] of value.entries()){assert(freeOffer(r.company,r.model,initialFreeAccess.offers,b.id));assert(b.rows.includes(r));if(i)assert((costPerScore(value[i-1],b.id)??Infinity)<=(costPerScore(r,b.id)??Infinity));}}
 assert.equal(selectComparisonRows(snapshot.boards[0].rows,'value-free','text',[]).length,0);
});
test('Arena and AA snapshots retain separate modalities, source identities and scales',()=>{
 assert.equal(snapshot.boards.length,3);assert.equal(snapshot.arenas.length,3);for(const b of snapshot.arenas){assert.equal(b.evaluation,'arena');assert(b.source.startsWith('https://arena.ai/'));assert(b.rows.length>=3);assert(b.rows.every(r=>r.score>100));if(b.id==='text'){assert(b.rows.every(r=>r.costUnit===undefined||r.costUnit==='1m-tokens'));}else assert(b.rows.every(r=>r.costUSD===undefined));}assert(snapshot.arenas[0].source.endsWith('/english'));assert(snapshot.boards[0].rows.every(r=>r.score<=100));
});

test('Arena text reference uses its own 50:50 per-million prices and rejects unknown or incompatible units',()=>{
 assert.deepEqual(parseArenaPrice('$2 / $10','text'),{costUSD:6,costUnit:'1m-tokens'});
 assert.deepEqual(parseArenaPrice('$0 / $0','text'),{costUSD:0,costUnit:'1m-tokens'});
 for(const value of ['N/A','$2','$2 /month','$2 / €10','--'])assert.equal(parseArenaPrice(value,'text'),undefined);
 assert.equal(parseArenaPrice('$2 / $10','image'),undefined);assert.equal(parseArenaPrice('$2 / $10','video'),undefined);
 const html=fixture().replace('<th>Cost/Task (P50)</th>','<th>Price $/M</th>').replaceAll('<td>$0.05</td>','<td>$2 / $10</td>');const r=parseArena(html,'text').rows[0];assert.equal(r.costUSD,6);assert.equal(costPerScore(r,'text'),6/1499);
});
test('Arena cost filters use their own candidate group, preserve missing costs and only admit verified free models',()=>{
 for(const b of snapshot.arenas){for(const mode of ['value','value-free']){const rows=selectComparisonRows(b.rows,mode,b.id);assert(rows.every(r=>b.rows.includes(r)));if(mode==='value')assert.equal(rows.length,b.id==='text'?20:10);else assert(rows.every(r=>freeOffer(r.company,r.model,initialFreeAccess.offers,b.id)));for(const [i,r] of rows.entries())if(i)assert((costPerScore(rows[i-1],b.id)??Infinity)<=(costPerScore(r,b.id)??Infinity));}}
});
