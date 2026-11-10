import test from 'node:test';
import assert from 'node:assert/strict';
import {collectWebDesign,parseWebDesign,WEB_DESIGN_CONFIG,WEB_DESIGN_LIMIT} from '../lib/web-design.ts';

const fixture=('<link rel="canonical" href="https://designarena.ai/leaderboard/website"/>'+
 '<h2>The Leaderboard</h2><p>Updated Nov 10, 2026, 2:06 PM UTC</p>'+
 '<div><button>Elo Rating</button><button>Win Rate</button><button>Battles</button><button>Organization</button></div>'+
 Array.from({length:WEB_DESIGN_LIMIT},(_,i)=>'<div data-model-id="id-'+i+'"><div>#'+(i+1)+'</div>'+
 '<div><img alt="Moonshot AI logo"><div><span>?</span></div><span style="font-family:var(--font-concrette)">Kimi '+i+'</span></div>'+
 '<div><div>'+(1367-i)+'</div><div>100W / 10L</div></div><div>62%</div><div>±1.2%</div>'+
 '<div>6,249</div><div>Moonshot AI</div><div>150.8s</div></div>').join(''));

test('Website leaderboard uses original scores, comparison counts and publication date',()=>{
 const {rows,publishedAt}=parseWebDesign(fixture);
 assert.equal(publishedAt,'2026-11-10T14:06:00.000Z');
 assert.equal(rows.length,15);
 assert.deepEqual(rows[0],{model:'Kimi 0',company:'Kimi',score:1367,samples:6249,preview:false});
 assert.equal(rows.at(-1).score,1353);
 assert.throws(()=>parseWebDesign(fixture.replace('leaderboard/website','leaderboard/gamedev')));
 assert.throws(()=>parseWebDesign(fixture.slice(0,fixture.indexOf('data-model-id="id-14"'))));
});

test('collector uses the official Website source and preserves the dated edition if refresh fails',async t=>{
 const mock=t.mock.method(globalThis,'fetch',async url=>{
  assert.equal(url,WEB_DESIGN_CONFIG.source);return new Response(fixture);
 });
 const live=await collectWebDesign();
 assert.equal(live.status,'live');
 assert.equal(live.rows.length,15);
 mock.mock.mockImplementation(async()=>new Response('Temporary failure',{status:503}));
 const saved=await collectWebDesign(live);
 assert.equal(saved.status,'saved');assert.equal(saved.checkedAt,live.checkedAt);
 assert.deepEqual(saved.rows,live.rows);
});
