import test from 'node:test';
import assert from 'node:assert';
import fs from 'node:fs';
import {THREE_D_TOOLS, THREE_D_CONFIG} from '../lib/three-d.ts';
import {selectComparisonRows, selectNonRedLanguageValueRows} from '../lib/benchmark-selection.ts';

test('3D modeling board has required tools including Tripo3D, Rodin and Meshy with plans and features', () => {
 assert(Array.isArray(THREE_D_TOOLS), 'THREE_D_TOOLS should be an array');
 assert(THREE_D_TOOLS.length >= 6, 'Should have at least 6 3D modeling tools');
 
 const tripo = THREE_D_TOOLS.find(t => t.id === 'tripo3d');
 assert(tripo, 'Tripo3D must be included');
 assert.equal(tripo.company, 'Tripo AI');
 assert.equal(tripo.plans.free.price, '$0');
 assert.equal(tripo.plans.pro.price, '$19.90 / mo');
 assert(tripo.plans.studio, 'Tripo3D should have studio plan');
 assert(tripo.formats.includes('GLTF') && tripo.formats.includes('FBX') && tripo.formats.includes('OBJ'));
 assert.equal(tripo.features.autoRigging, true);
 assert.equal(tripo.features.retopology, true);

 const rodin = THREE_D_TOOLS.find(t => t.id === 'rodin');
 assert(rodin, 'Rodin must be included');
 assert.equal(rodin.plans.free.price, '$0');
 assert.equal(rodin.plans.pro.price, '$15.00 / mo');

 const meshy = THREE_D_TOOLS.find(t => t.id === 'meshy');
 assert(meshy, 'Meshy must be included');
 assert.equal(meshy.plans.free.price, '$0');
 assert.equal(meshy.plans.pro.price, '$20.00 / mo');

 const trellis = THREE_D_TOOLS.find(t => t.id === 'trellis');
 assert(trellis, 'Trellis must be included');
 assert.equal(trellis.plans.free.price, '$0');
});

test('benchmarks snapshot contains all newly added models across Video, Image and Text', () => {
 const data = JSON.parse(fs.readFileSync(new URL('../lib/initial-benchmarks.json', import.meta.url)));

 const video = data.boards.find(b => b.id === 'video');
 assert(video, 'Video board must exist');
 const videoModels = video.rows.map(r => r.model);
 assert(videoModels.includes('Higgsfield Cinema'), 'Higgsfield Cinema must be in Video');
 assert(videoModels.includes('Higgsfield DoP'), 'Higgsfield DoP must be in Video');
 assert(videoModels.includes('Runway Gen-3 Alpha'), 'Runway Gen-3 Alpha must be in Video');
 assert(videoModels.includes('OpenAI Sora'), 'OpenAI Sora must be in Video');
 assert(videoModels.includes('Luma Dream Machine (Ray 2)'), 'Luma Dream Machine must be in Video');
 assert(videoModels.includes('Tencent HunyuanVideo'), 'Tencent HunyuanVideo must be in Video');

 const image = data.boards.find(b => b.id === 'image');
 assert(image, 'Image board must exist');
 const imageModels = image.rows.map(r => r.model);
 assert(imageModels.includes('Midjourney v6.1'), 'Midjourney v6.1 must be in Image');
 assert(imageModels.includes('Midjourney v7 (preview)'), 'Midjourney v7 must be in Image');
 assert(imageModels.includes('Adobe Firefly Image 3'), 'Adobe Firefly must be in Image');
 assert(imageModels.includes('Stable Diffusion 3.5 Large'), 'Stable Diffusion 3.5 Large must be in Image');
 assert(imageModels.includes('Higgsfield Soul 2.0'), 'Higgsfield Soul 2.0 must be in Image');
 assert(imageModels.includes('Higgsfield Soul'), 'Higgsfield Soul must be in Image');

 const text = data.boards.find(b => b.id === 'text');
 assert(text, 'Text board must exist');
 const textModels = text.rows.map(r => r.model);
 assert(textModels.includes('Amazon Nova Premier (high)'), 'Amazon Nova Premier must be in Text');
 assert(textModels.includes('Phi-4 (high)'), 'Phi-4 must be in Text');
 assert(textModels.includes('Yi-Large (high)'), 'Yi-Large must be in Text');
 assert(textModels.includes('ERNIE 4.0 (high)'), 'ERNIE 4.0 must be in Text');
 assert(textModels.includes('Jamba 1.5 Large (high)'), 'Jamba 1.5 Large must be in Text');

 const nonRed = selectNonRedLanguageValueRows(text.rows);
 assert.equal(nonRed.length, 10, 'Expected exactly 10 non-red rows in language cost per score');
});
