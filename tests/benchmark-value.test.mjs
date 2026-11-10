import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {parseBoard,parseBenchmarkCost,collectBenchmarks} from '../lib/benchmarks.ts';
import {costPerScore,isBelowAnyAbove,highestScoreAbove,isTiedWithBestAbove,filterRedValueRows} from '../lib/benchmark-value.ts';
import {selectComparisonRows,DEFAULT_COMPARISON_MODE} from '../lib/benchmark-selection.ts';

const row=(model,score,costUSD,costUnit='task')=>({model,company:'Test',score,costUSD,costUnit,preview:false});
test('cost ranking uses a same-unit ratio and keeps unknown prices unranked at the end',()=>{
 const rows=[row('Strong costly',50,5),row('Better value',20,.2),row('Unknown',80,undefined),row('Zero API price',5,0),row('Wrong unit',99,.01,'minute'),row('Negative',20,-1),row('No score',0,1),row('NaN',50,NaN),row('Infinity',50,Infinity)];
 const selected=selectComparisonRows(rows,'value','text');assert.deepEqual(selected.slice(0,3).map(r=>r.model),['Zero API price','Better value','Strong costly']);assert(selected.slice(3).every(r=>costPerScore(r,'text')===undefined));
 assert.equal(costPerScore(rows[1],'text'),.01);assert.equal(rows[0].score,50);
 assert.equal(costPerScore(row('Zero score',0,0),'text'),undefined);
});
test('parsing requires an explicit dollar price and the correct unit, never a missing API or monthly plan',()=>{
 assert.deepEqual(parseBenchmarkCost('$1,234.50','text'),{costUSD:1234.5,costUnit:'task'});
 assert.deepEqual(parseBenchmarkCost('$0.0 /1k imgs','image'),{costUSD:0,costUnit:'1k-images'});
 assert.deepEqual(parseBenchmarkCost('$4.80 /min','video'),{costUSD:4.8,costUnit:'minute'});
 for(const text of ['--','No API available','Coming soon','Free','€2.00','$2 /month','$2 /min'])assert.equal(parseBenchmarkCost(text,'text'),undefined);
 assert.equal(parseBenchmarkCost('$20 /min','image'),undefined);assert.equal(parseBenchmarkCost('$20 /1k imgs','video'),undefined);
});
test('source parsing locates the named price column instead of mistaking speed or another number for a price',()=>{
 const table=(header)=>`<table><thead><tr><th>Model</th><th>Context Window</th><th>Creator</th><th>Artificial Analysis Intelligence Index</th><th>Speed</th><th>${header}</th></tr></thead><tbody>${['$0.20','--','$2.00'].map((price,i)=>`<tr><td>Model ${i}</td><td>1M</td><td>Test</td><td>20</td><td>100</td><td>${price}</td></tr>`).join('')}</tbody></table>`;
 const rows=parseBoard(table('Cost per Task USD'),'text');assert.equal(rows[0].costUSD,.2);assert.equal(rows[1].costUSD,undefined);assert.equal(rows[2].costUSD,2);
 assert(parseBoard(table('Monthly plan'),'text').every(r=>r.costUSD===undefined));
});
test('all snapshot modalities have enough real prices and retain their original scored rows',()=>{
 const data=JSON.parse(fs.readFileSync(new URL('../lib/initial-benchmarks.json',import.meta.url)));
 for(const board of data.boards){const rows=selectComparisonRows(board.rows,'value',board.id);assert.equal(rows.length,board.id==='text'?20:10);const group=[...board.rows].sort((a,b)=>b.score-a.score).slice(0,rows.length);assert(rows.every(r=>group.includes(r)));for(const [i,r] of rows.entries()){assert(board.rows.includes(r));if(i)assert((costPerScore(rows[i-1],board.id)??Infinity)<=(costPerScore(r,board.id)??Infinity));}}
});
test('offline refresh preserves saved prices and source verification dates',async()=>{
 const original=globalThis.fetch,data=JSON.parse(fs.readFileSync(new URL('../lib/initial-benchmarks.json',import.meta.url)));globalThis.fetch=async()=>{throw Error('offline');};
 try{const next=await collectBenchmarks(data);for(const [i,b] of next.boards.entries()){assert.equal(b.status,'saved');assert.equal(b.checkedAt,data.boards[i].checkedAt);assert.deepEqual(b.rows,data.boards[i].rows);}}finally{globalThis.fetch=original;}
});

 test('default is cost per score and value candidates are chosen by score before price availability or value',()=>{
 assert.equal(DEFAULT_COMPARISON_MODE,'value');
 for(const id of ['text','image','video']){
 const count=id==='text'?20:10,unit=id==='text'?'task':id==='image'?'1k-images':'minute';
 const top=Array.from({length:count},(_,i)=>row('Top '+i,100-i,i===0?undefined:100+i,unit));
 const cheap=row('Cheap low score',1,0,unit),rows=selectComparisonRows([cheap,...top].reverse(),'value',id);
 assert.equal(rows.length,count);assert(!rows.includes(cheap));assert(rows.every(r=>top.includes(r)));assert.equal(rows.at(-1),top[0]);
 }
 });

test('red value flag compares to every preceding displayed score, not only the previous row',()=>{
 const rows=[60,40,50,60,61,59].map(score=>({score}));
 assert.deepEqual(rows.map((r,i)=>isBelowAnyAbove(rows,i)),[false,true,true,false,false,true]);assert.equal(highestScoreAbove(rows,2),60);assert.equal(highestScoreAbove(rows,0),undefined);
});

test('yellow value flag marks ties with the best score above and never overrides a higher score',()=>{
 const rows=[60,40,50,60,61,59,61,60,60].map(score=>({score}));
 assert.deepEqual(rows.map((r,i)=>isTiedWithBestAbove(rows,i)),[false,false,false,true,false,false,true,false,false]);
 assert(rows.every((r,i)=>!(isBelowAnyAbove(rows,i)&&isTiedWithBestAbove(rows,i))));
});

test('hide red preserves original candidates, ties, new highs, missing prices and restores all rows',()=>{
 for(const [id,unit] of [['text','task'],['text','1m-tokens'],['image','1k-images'],['video','minute']]){
  const rows=[row('First',60,1,unit),row('Lower',40,2,unit),row('Partial recovery',50,3,unit),row('Tie',60,4,unit),row('New high',61,5,unit),row('Unknown price',80,undefined,unit),row('Below unknown high',70,7,unit),row('Tie unknown high',80,8,unit)];
  assert.deepEqual(filterRedValueRows(rows,id,true).map(r=>r.model),['First','Tie','New high','Unknown price','Tie unknown high']);
  assert.equal(filterRedValueRows(rows,id,false),rows);
  assert(rows.every((r,i)=>r.model===['First','Lower','Partial recovery','Tie','New high','Unknown price','Below unknown high','Tie unknown high'][i]));
 }
 assert.deepEqual(filterRedValueRows([],'text',true),[]);
});
