import {mkdir,copyFile} from 'node:fs/promises';
const mappings=[['initial-feed','news'],['initial-benchmarks','benchmarks'],['initial-pricing','pricing']];
await mkdir(new URL('../public/data/',import.meta.url),{recursive:true});
for(const [source,target] of mappings)await copyFile(new URL(`../lib/${source}.json`,import.meta.url),new URL(`../public/data/${target}.json`,import.meta.url));
