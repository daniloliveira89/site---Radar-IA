import test from 'node:test';
import assert from 'node:assert/strict';
import {RANKING_CATEGORIES,RANKED_AIS} from '../lib/my-ranking.ts';
import {MY_ACCOUNTS} from '../lib/my-ais.ts';

test('my-ranking categories include all 8 key requested domains', () => {
  const ids = RANKING_CATEGORIES.map(c => c.id);
  assert(ids.includes('code'), 'Missing code category');
  assert(ids.includes('writing'), 'Missing writing category');
  assert(ids.includes('webdesign'), 'Missing webdesign category');
  assert(ids.includes('image'), 'Missing image category');
  assert(ids.includes('research'), 'Missing research category');
  assert(ids.includes('context'), 'Missing context category');
  assert(ids.includes('science'), 'Missing science category');
  assert(ids.includes('security'), 'Missing security category');
  assert.equal(RANKING_CATEGORIES.length, 8);
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
  assert.equal(topCode.company, 'Anthropic');

  const topContext = RANKED_AIS.find(i => i.category === 'context' && i.rank === 1);
  assert(topContext.model.includes('Kimi'), 'Top Context should be Kimi K3.1 Pro');
  assert.equal(topContext.company, 'Kimi');

  const topResearch = RANKED_AIS.find(i => i.category === 'research' && i.rank === 1);
  assert(topResearch.model.includes('DeepSeek'), 'Top Research should be DeepSeek');
  assert.equal(topResearch.company, 'DeepSeek');

  const topImage = RANKED_AIS.find(i => i.category === 'image' && i.rank === 1);
  assert(topImage.model.includes('Imagen 3') || topImage.model.includes('Flow'), 'Top Image should be Imagen 3 / Flow');
  assert.equal(topImage.company, 'Google');

  const topScience = RANKED_AIS.find(i => i.category === 'science' && i.rank === 1);
  assert(topScience.model.includes('Gemini 4 Argon & Carbon'), 'Top Science should be Gemini 4 Argon & Carbon');
  assert.equal(topScience.company, 'Google');
  assert.equal(topScience.aiStudio, true);

  const topSecurity = RANKED_AIS.find(i => i.category === 'security' && i.rank === 1);
  assert(topSecurity.model.includes('Claude Sonnet'), 'Top Security should be Claude Sonnet');
  assert.equal(topSecurity.company, 'Anthropic');
});
