import type {BenchmarkRow,Board,CostUnit} from './benchmarks.ts';

const units:Record<Board['id'],CostUnit>={text:'task',image:'1k-images',video:'minute'};
export function costPerScore(row:BenchmarkRow,id:Board['id']):number|undefined{
 if((row.costUnit!==units[id]&&!(id==='text'&&row.costUnit==='1m-tokens'))||typeof row.costUSD!=='number'||!Number.isFinite(row.costUSD)||row.costUSD<0||!Number.isFinite(row.score)||row.score<=0)return;
 const value=row.costUSD/row.score;
 return Number.isFinite(value)?value:undefined;
}
export function highestScoreAbove(rows:Pick<BenchmarkRow,'score'>[],index:number):number|undefined{
 if(index<=0)return;
 return Math.max(...rows.slice(0,index).map(r=>r.score));
}
export function isBelowAnyAbove(rows:Pick<BenchmarkRow,'score'>[],index:number):boolean{
 const highest=highestScoreAbove(rows,index);
 return highest!==undefined&&rows[index]?.score<highest;
}
export function isTiedWithBestAbove(rows:Pick<BenchmarkRow,'score'>[],index:number):boolean{
 const highest=highestScoreAbove(rows,index);
 return highest!==undefined&&rows[index]?.score===highest;
}
export function filterRedValueRows(rows:BenchmarkRow[],id:Board['id'],hideRed:boolean):BenchmarkRow[]{
 if(!hideRed)return rows;
 // Match the red amounts in the full selected list; keep unknown prices.
 return rows.filter((r,i)=>costPerScore(r,id)===undefined||!isBelowAnyAbove(rows,i));
}
