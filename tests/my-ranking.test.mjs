import test from 'node:test';
import assert from 'node:assert/strict';
import {RANKING_CATEGORIES,RANKED_AIS} from '../lib/my-ranking.ts';
import {MY_ACCOUNTS} from '../lib/my-ais.ts';

test('my-ranking categories include all 7 key requested domains without context', () => {
  const ids = RANKING_CATEGORIES.map(c => c.id);
  assert(ids.includes('code'), 'Missing code category');
  assert(ids.includes('writing'), 'Missing writing category');
  assert(ids.includes('webdesign'), 'Missing webdesign category');
  assert(ids.includes('image'), 'Missing image category');
  assert(ids.includes('research'), 'Missing research category');
  assert(ids.includes('science'), 'Missing science category');
  assert(ids.includes('security'), 'Missing security category');
  assert(!ids.includes('context'), 'Context category should be removed');
  assert.equal(RANKING_CATEGORIES.length, 7);

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
  assert(topImage.model.includes('Imagen 3') || topImage.model.includes('Flow'), 'Top Image should be Imagen 3 / Flow');
  assert.equal(topImage.company, 'Google');

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
    } else if (item.company === 'Google') {
      assert.equal(item.antigravity, true, `${item.model} (${item.accountId}) must be in Antigravity`);
      assert.equal(item.codex, false, `${item.model} (Google) must NOT be in Codex`);
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
  assert(studioArgon.every(m => m.accountName === 'Google AI Studio' && m.tier === 'AI Studio Free & Pro' && m.antigravity === true));

  const studioHydrogen = RANKED_AIS.filter(i => i.accountId === 'google-ai-studio' && i.model === 'Gemini 4 Hydrogen');
  assert(studioHydrogen.length >= 1, 'Google AI Studio must have separate Gemini 4 Hydrogen');
  assert(studioHydrogen.every(m => m.accountName === 'Google AI Studio' && m.tier === 'AI Studio Free & Pro' && m.antigravity === true));
});

test('all ChatGPT models are marked with Codex and not Antigravity', () => {
  const gptItems = RANKED_AIS.filter(i => i.accountId === 'chatgpt');
  assert(gptItems.length >= 5, 'Should have multiple ranked ChatGPT items');
  for (const item of gptItems) {
    assert.equal(item.codex, true, `${item.model} should be Codex ready`);
    assert.equal(item.antigravity, false, `${item.model} should NOT be Antigravity ready`);
  }
});
