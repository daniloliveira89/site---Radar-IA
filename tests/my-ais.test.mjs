import test from 'node:test';
import assert from 'node:assert/strict';
import {MY_ACCOUNTS,findLatestProviderRelease} from '../lib/my-ais.ts';

test('my-ais accounts catalog contains all required user accounts including Google AI Studio', () => {
  const ids = MY_ACCOUNTS.map(a => a.id);
  const required = ['gemini', 'google-ai-studio', 'chatgpt', 'claude', 'grok', 'kimi', 'glm', 'deepseek', 'muse'];
  for (const req of required) {
    assert(ids.includes(req), `Missing account: ${req}`);
  }
  assert.equal(MY_ACCOUNTS.length, 9);
});

test('gemini and google-ai-studio include Gemini 4 Hydrogen and Gemini 4 Argon models', () => {
  const gemini = MY_ACCOUNTS.find(a => a.id === 'gemini');
  assert(gemini.models.some(m => m.name.includes('Hydrogen')));
  assert(gemini.models.some(m => m.name.includes('Argon')));

  const studio = MY_ACCOUNTS.find(a => a.id === 'google-ai-studio');
  assert(studio);
  assert(studio.models.some(m => m.name.includes('Hydrogen')));
  assert(studio.models.some(m => m.name.includes('Argon')));
});

test('my-ais tiers match requested user accounts', () => {
  const gemini = MY_ACCOUNTS.find(a => a.id === 'gemini');
  assert(gemini.tier.includes('Estudos'));
  assert.equal(gemini.tierBadge, 'edu');

  const gpt = MY_ACCOUNTS.find(a => a.id === 'chatgpt');
  assert(gpt.tier.includes('Go') && gpt.tier.includes('Free'));

  const claude = MY_ACCOUNTS.find(a => a.id === 'claude');
  assert(claude.tier.toLowerCase().includes('free'));

  const grok = MY_ACCOUNTS.find(a => a.id === 'grok');
  assert(grok.tier.toLowerCase().includes('free'));

  const kimi = MY_ACCOUNTS.find(a => a.id === 'kimi');
  assert(kimi.tier.toLowerCase().includes('free'));

  const glm = MY_ACCOUNTS.find(a => a.id === 'glm');
  assert(glm.tier.toLowerCase().includes('free'));

  const deepseek = MY_ACCOUNTS.find(a => a.id === 'deepseek');
  assert(deepseek.tier.toLowerCase().includes('free'));

  const muse = MY_ACCOUNTS.find(a => a.id === 'muse');
  assert(muse.tier.toLowerCase().includes('free'));
});

test('every account has available models with descriptions and isLatest flags', () => {
  for (const acc of MY_ACCOUNTS) {
    assert(acc.models.length >= 3, `${acc.id} should have at least 3 models`);
    for (const model of acc.models) {
      assert(model.name && model.name.length > 0);
      assert(model.descriptionPt && model.descriptionPt.length > 0);
      assert(model.descriptionEn && model.descriptionEn.length > 0);
    }
    assert(acc.models.some(m => m.isLatest), `${acc.id} should have at least one latest model`);
  }
});

test('every account includes configured Antigravity and Codex variants', () => {
  for (const acc of MY_ACCOUNTS) {
    assert.equal(acc.antigravity.supported, true, `${acc.id} must support Antigravity`);
    assert(acc.antigravity.models.length >= 2, `${acc.id} must list Antigravity models`);
    assert(acc.antigravity.notesPt.length > 0);

    assert.equal(acc.codex.supported, true, `${acc.id} must support Codex`);
    assert(acc.codex.models.length >= 2, `${acc.id} must list Codex models`);
    assert(acc.codex.notesPt.length > 0);
  }
});

test('findLatestProviderRelease locates latest articles for providers from feed', () => {
  const dummyFeed = {
    fetchedAt: '2026-11-12T12:00:00Z',
    articles: [
      {
        id: '1',
        title: 'OpenAI announces GPT-6 Luna',
        originalTitle: 'OpenAI announces GPT-6 Luna',
        date: '2026-11-10T12:00:00Z',
        url: 'https://openai.com/news/gpt-6-luna',
        company: 'OpenAI',
        category: 'Modelos',
        excerpt: 'New model',
        summary: 'Resumo'
      }
    ],
    sources: []
  };

  const release = findLatestProviderRelease('OpenAI', dummyFeed);
  assert(release);
  assert.equal(release.title, 'OpenAI announces GPT-6 Luna');
  assert.equal(release.url, 'https://openai.com/news/gpt-6-luna');

  const none = findLatestProviderRelease('NonExistent', dummyFeed);
  assert.equal(none, null);
});
