import test from 'node:test';
import assert from 'node:assert/strict';
import {collectWebDesign,parseWebDesign,WEB_DESIGN_CONFIG,WEB_DESIGN_LIMIT} from '../lib/web-design.ts';

const data=Array.from({length:WEB_DESIGN_LIMIT},(_,i)=>({modelId:'id-'+i,elo:1367-i,battles:6249}));
const models=Object.fromEntries(data.map((r,i)=>[r.modelId,{displayName:'Kimi '+i,provider:'moonshot'}]));
data.splice(1,0,{modelId:'id-0-alt',elo:1366,battles:100});
models['id-0-alt']={displayName:'Kimi 0 (high)',provider:'moonshot',modeOf:'id-0'};
function fixture(results=data,category='website'){
 const seed={boards:[{arenaType:'models',category,variationName:'public',inputModality:'text',metadata:{lastUpdateTime:'2026-11-10T14:06:00.000Z'},data:results}],registry:{models,providers:{moonshot:{displayName:'Moonshot AI'}}}};
 const row='1d:'+JSON.stringify(['$','client',null,{seed}]);
 const frame=str=>'<script>self.__next_f.push('+JSON.stringify([1,str])+')</script>';
 return '<link rel="canonical" href="https://designarena.ai/leaderboard/website"/>'+frame(row.slice(0,400))+frame(row.slice(400));
}
test('Website leaderboard ranks 20 distinct models with their original scores and counts',()=>{
 const {rows,publishedAt}=parseWebDesign(fixture());
 assert.equal(publishedAt,'2026-11-10T14:06:00.000Z');
 assert.equal(rows.length,20);
 assert.deepEqual(rows[0],{model:'Kimi 0',company:'Kimi',score:1367,samples:6249,preview:false});
 assert.equal(rows.at(-1).score,1348);
 assert(!rows.some(r=>r.model==='Kimi 0 (high)'));
 assert.throws(()=>parseWebDesign(fixture().replace('leaderboard/website','leaderboard/gamedev')));
 assert.throws(()=>parseWebDesign(fixture(data,'gamedev')));
 assert.throws(()=>parseWebDesign(fixture(data.slice(0,15))));
});

test('collector uses the official Website source and preserves the dated edition if refresh fails',async t=>{
 const mock=t.mock.method(globalThis,'fetch',async url=>{
  assert.equal(url,WEB_DESIGN_CONFIG.source);return new Response(fixture());
 });
 const live=await collectWebDesign();
 assert.equal(live.status,'live');
 assert.equal(live.rows.length,20);
 mock.mock.mockImplementation(async()=>new Response('Temporary failure',{status:503}));
 const saved=await collectWebDesign(live);
 assert.equal(saved.status,'saved');assert.equal(saved.checkedAt,live.checkedAt);
 assert.deepEqual(saved.rows,live.rows);
});
