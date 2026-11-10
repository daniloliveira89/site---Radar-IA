import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {isNewsEligible} from '../lib/feed.ts';
import {collectPricing} from '../lib/pricing.ts';
const read=async p=>JSON.parse(await readFile(new URL('../'+p,import.meta.url),'utf8'));
test('published news enforces the requested cutoff',async()=>{
 const feed=await read('lib/initial-feed.json');assert(feed.articles.every(a=>isNewsEligible(a)));assert(!isNewsEligible({date:'2026-10-22T12:00:00Z',originalTitle:'Introducing GPT-6',excerpt:'A new model',company:'OpenAI'}));
});
test('data snapshots preserve all three benchmark modalities and fourteen price services',async()=>{
 const b=await read('lib/initial-benchmarks.json'),p=await read('lib/initial-pricing.json');assert.deepEqual(b.boards.map(x=>x.id),['text','image','video']);assert(b.boards.every(x=>x.rows.length>=3));assert.equal(p.services.length,14);
});
test('failed price checks preserve original amounts and verification dates',async()=>{
 const old=await read('lib/initial-pricing.json'),original=globalThis.fetch;globalThis.fetch=async()=>new Response('Unavailable',{status:503});
 try{const result=await collectPricing(old);for(const [i,s] of result.services.entries())for(const [j,p] of s.plans.entries()){const before=old.services[i].plans[j];assert.equal(p.monthly,before.monthly);assert.equal(p.annual,before.annual);assert.equal(p.verifiedAt||s.verifiedAt,before.verifiedAt||old.services[i].verifiedAt);if(s.automatic)assert.equal(p.status,'saved');}}finally{globalThis.fetch=original;}
});
test('manifest can be installed under a repository subpath',async()=>{
 const m=await read('public/manifest.webmanifest');assert.equal(m.start_url,'./');assert.equal(m.scope,'./');assert(m.icons.every(x=>!x.src.startsWith('/')));
});
