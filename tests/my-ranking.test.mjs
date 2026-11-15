import test from 'node:test';
import assert from 'node:assert/strict';
import {RANKING_CATEGORIES,RANKED_AIS} from '../lib/my-ranking.ts';
import {MY_ACCOUNTS} from '../lib/my-ais.ts';

test('my-ranking categories include all 9 key domains including video and flow', () => {
  const ids = RANKING_CATEGORIES.map(c => c.id);
  assert(ids.includes('code'), 'Missing code category');
  assert(ids.includes('writing'), 'Missing writing category');
  assert(ids.includes('webdesign'), 'Missing webdesign category');
  assert(ids.includes('image'), 'Missing image category');
  assert(ids.includes('video'), 'Missing video category');
  assert(ids.includes('flow'), 'Missing flow category');
  assert(ids.includes('research'), 'Missing research category');
  assert(ids.includes('science'), 'Missing science category');
  assert(ids.includes('security'), 'Missing security category');
  assert(!ids.includes('context'), 'Context category should be removed');
  assert.equal(RANKING_CATEGORIES.length, 9);

  const secCat = RANKING_CATEGORIES.find(c => c.id === 'security');
  assert.equal(secCat.namePt, 'Cyber Security');
  assert.equal(secCat.nameEn, 'Cyber Security');

  const resCat = RANKING_CATEGORIES.find(c => c.id === 'research');
  assert.equal(resCat.namePt, 'Deep Research');
  assert.equal(resCat.nameEn, 'Deep Research');
});

test('every ranked AI model belongs to an active user account', () => {
  const userAccountIds = new Set(MY_ACCOUNTS.map(a => a.id));
  for (const item of RANKED_AIS) {
    assert(userAccountIds.has(item.accountId), `Unknown account id: ${item.accountId}`);
    assert(item.model.length > 0);
    assert(item.whyBestPt.length > 0);
    assert(item.whyBestEn.length > 0);
    assert(item.rank >= 1 && item.rank <= 5);
  }
});

test('category rank #1 models correspond to top benchmark winners', () => {
  const topWeb = RANKED_AIS.find(i => i.category === 'webdesign' && i.rank === 1);
  assert(topWeb.model.includes('Muse Wonder'), 'Top Web Design should be Muse Wonder');
  assert.equal(topWeb.company, 'Meta');

  const topWriting = RANKED_AIS.find(i => i.category === 'writing' && i.rank === 1);
  assert(topWriting.model.includes('GLM-5.3'), 'Top Creative Writing should be GLM-5.3');
  assert.equal(topWriting.company, 'Z AI');

  const topCode = RANKED_AIS.find(i => i.category === 'code' && i.rank === 1);
  assert(topCode.model.includes('Claude Sonnet'), 'Top Code should be Claude Sonnet');
  assert.equal(topCode.company, 'Claude');

  const topResearch = RANKED_AIS.find(i => i.category === 'research' && i.rank === 1);
  assert(topResearch.model.includes('DeepSeek'), 'Top Research should be DeepSeek');
  assert.equal(topResearch.company, 'DeepSeek');

  const topImage = RANKED_AIS.find(i => i.category === 'image' && i.rank === 1);
  assert(topImage.model.includes('Sunburst'), 'Top Image should be GPT Image 2.6 Sunburst');
  assert.equal(topImage.company, 'OpenAI');

  const topVideo = RANKED_AIS.find(i => i.category === 'video' && i.rank === 1);
  assert(topVideo.model.includes('Veo'), 'Top Video should be Veo 3.1');
  assert.equal(topVideo.company, 'Google');

  const topFlow = RANKED_AIS.find(i => i.category === 'flow' && i.rank === 1);
  assert(topFlow.model.includes('Veo') || topFlow.model.includes('Flow'), 'Top Flow should be Veo / Flow');
  assert.equal(topFlow.company, 'Google');

  const topScience = RANKED_AIS.find(i => i.category === 'science' && i.rank === 1);
  assert(topScience.model.includes('Gemini 4 Argon'), 'Top Science should be Gemini 4 Argon');
  assert.equal(topScience.company, 'Google');
  assert.equal(topScience.aiStudio, true);

  const topSecurity = RANKED_AIS.find(i => i.category === 'security' && i.rank === 1);
  assert(topSecurity.model.includes('Claude Sonnet'), 'Top Security should be Claude Sonnet');
  assert.equal(topSecurity.company, 'Claude');
});

test('all ranked models follow strict ecosystem mapping (only Google in Antigravity, only OpenAI in Codex, Pro Education excluded from Antigravity)', () => {
  for (const item of RANKED_AIS) {
    if (item.accountId === 'gemini') {
      assert.equal(item.antigravity, false, `${item.model} in Gemini Pro Education must NOT have Antigravity`);
      assert.equal(item.codex, false);
    } else if (item.accountId === 'antigravity') {
      assert.equal(item.antigravity, true, `${item.model} (${item.accountId}) must be in Antigravity`);
      assert.equal(item.codex, false);
    } else if (item.accountId === 'google-ai-studio') {
      assert.equal(item.antigravity, false, `${item.model} in Google AI Studio is not in user Antigravity`);
      assert.equal(item.aiStudio, true, `${item.model} must be marked as aiStudio`);
      assert.equal(item.codex, false);
    } else if (item.company === 'OpenAI') {
      assert.equal(item.antigravity, false, `${item.model} (OpenAI) must NOT be in Antigravity`);
      assert.equal(item.codex, true, `${item.model} (OpenAI) must be in Codex`);
    } else {
      assert.equal(item.antigravity, false, `${item.model} (${item.company}) must NOT be in Antigravity`);
      assert.equal(item.codex, false, `${item.model} (${item.company}) must NOT be in Codex`);
    }
  }
});

test('Google AI Studio has separate Gemini 4 Argon and Gemini 4 Hydrogen models without joined strings', () => {
  const joined = RANKED_AIS.filter(i => i.model.includes('&') && (i.model.includes('Hydrogen') || i.model.includes('Argon')));
  assert.equal(joined.length, 0, 'No ranked model should bundle Hydrogen & Argon together');

  const studioArgon = RANKED_AIS.filter(i => i.accountId === 'google-ai-studio' && i.model === 'Gemini 4 Argon');
  assert(studioArgon.length >= 1, 'Google AI Studio must have separate Gemini 4 Argon');
  assert(studioArgon.every(m => m.accountName === 'Google AI Studio' && m.tier === 'AI Studio Pro & Pay-as-you-go' && m.tierBadge === 'pro' && m.aiStudio === true && m.antigravity === false));

  const studioHydrogen = RANKED_AIS.filter(i => i.accountId === 'google-ai-studio' && i.model === 'Gemini 4 Hydrogen');
  assert(studioHydrogen.length >= 1, 'Google AI Studio must have separate Gemini 4 Hydrogen');
  assert(studioHydrogen.every(m => m.accountName === 'Google AI Studio' && m.tier === 'AI Studio Pro & Pay-as-you-go' && m.tierBadge === 'pro' && m.aiStudio === true && m.antigravity === false));
});

test('all ChatGPT models are marked with Codex and not Antigravity', () => {
  const gptItems = RANKED_AIS.filter(i => i.accountId === 'chatgpt');
  assert(gptItems.length >= 5, 'Should have multiple ranked ChatGPT items');
  for (const item of gptItems) {
    assert.equal(item.codex, true, `${item.model} should be Codex ready`);
    assert.equal(item.antigravity, false, `${item.model} should NOT be Antigravity ready`);
  }
});

test('image category in my-ranking includes GPT Image 2.6 Sunburst and Flare with Codex support', () => {
  const sunburst = RANKED_AIS.find(i => i.category === 'image' && i.model.includes('Sunburst'));
  assert(sunburst, 'GPT Image 2.6 Sunburst must be in Image category');
  assert.equal(sunburst.codex, true, 'Sunburst must be Codex enabled');
  assert.equal(sunburst.company, 'OpenAI');

  const flare = RANKED_AIS.find(i => i.category === 'image' && i.model.includes('Flare'));
  assert(flare, 'GPT Image 2.6 Flare must be in Image category');
  assert.equal(flare.codex, true, 'Flare must be Codex enabled');
  assert.equal(flare.company, 'OpenAI');
});

test('Gemini Web and GPT Web environment filter attributes are configured across categories', () => {
  const geminiItems = RANKED_AIS.filter(i => i.geminiWeb || i.accountId === 'gemini');
  assert(geminiItems.length >= 8, 'Expected at least 8 Gemini Web models in ranking');
  assert(geminiItems.some(i => i.model === 'Gemini 4 Argon'), 'Gemini Web should include Argon');
  assert(geminiItems.some(i => i.model === 'Gemini 4 Hydrogen'), 'Gemini Web should include Hydrogen');
  assert(geminiItems.some(i => i.model.includes('Imagen 3')), 'Gemini Web should include Imagen 3');

  const gptItems = RANKED_AIS.filter(i => i.gptWeb || i.accountId === 'chatgpt');
  assert(gptItems.length >= 8, 'Expected at least 8 GPT Web models in ranking');
  assert(gptItems.some(i => i.model.includes('Sunburst')), 'GPT Web should include Sunburst');
  assert(gptItems.some(i => i.model.includes('Flare')), 'GPT Web should include Flare');
  assert(gptItems.some(i => i.model.includes('Luna')), 'GPT Web should include Luna');
});

test('my-ranking has Video Generation and Flow Generation categories with Flow models', () => {
  const videoItems = RANKED_AIS.filter(i => i.category === 'video');
  assert.equal(videoItems.length, 5, 'Video category must have 5 ranked items');
  assert(videoItems.some(i => i.model.includes('Veo 3.1')), 'Video must include Veo 3.1');
  assert(videoItems.some(i => i.model.includes('Sora')), 'Video must include Sora');

  const flowItems = RANKED_AIS.filter(i => i.category === 'flow');
  assert.equal(flowItems.length, 5, 'Flow category must have 5 ranked items');
  assert(flowItems.some(i => i.model.includes('Elements')), 'Flow must include Flow Elements');

  const flowEnvItems = RANKED_AIS.filter(i => i.flow || i.accountId === 'flow');
  assert(flowEnvItems.length >= 5, 'Flow environment filter must have models');
  assert(flowEnvItems.every(i => i.company === 'Google'), 'All Flow environment items are Google');
});
