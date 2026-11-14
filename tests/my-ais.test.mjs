import test from 'node:test';
import assert from 'node:assert/strict';
import {MY_ACCOUNTS,findLatestProviderRelease} from '../lib/my-ais.ts';

test('my-ais accounts catalog contains all required user accounts including Google AI Studio, Antigravity and Codex', () => {
  const ids = MY_ACCOUNTS.map(a => a.id);
  const required = ['gemini', 'google-ai-studio', 'antigravity', 'chatgpt', 'codex', 'claude', 'grok', 'kimi', 'glm', 'deepseek', 'muse'];
  for (const req of required) {
    assert(ids.includes(req), `Missing account: ${req}`);
  }
  assert.equal(MY_ACCOUNTS.length, 11);
});

test('gemini and google-ai-studio include Gemini 4 Hydrogen and Gemini 4 Argon models', () => {
  const gemini = MY_ACCOUNTS.find(a => a.id === 'gemini');
  assert.equal(gemini.name, 'Gemini Web Pro Education');
  assert(gemini.models.some(m => m.name.includes('Hydrogen')));
  assert(gemini.models.some(m => m.name.includes('Argon')));

  const studio = MY_ACCOUNTS.find(a => a.id === 'google-ai-studio');
  assert(studio);
  assert(studio.models.some(m => m.name.includes('Hydrogen')));
  assert(studio.models.some(m => m.name.includes('Argon')));
  assert(!studio.models.some(m => m.name.includes('Carbon')), 'Google AI Studio should not list Gemini 4 Carbon');
  assert(!studio.antigravity.models.includes('Gemini 4 Carbon'), 'Antigravity models should not include Gemini 4 Carbon');
  assert(!studio.codex.models.includes('Gemini 4 Carbon'), 'Codex models should not include Gemini 4 Carbon');
});

test('my-ais tiers match requested user accounts', () => {
  const gemini = MY_ACCOUNTS.find(a => a.id === 'gemini');
  assert(gemini.tier.includes('Estudos'));
  assert.equal(gemini.tierBadge, 'edu');

  const gpt = MY_ACCOUNTS.find(a => a.id === 'chatgpt');
  assert(gpt.tier.includes('Go') && gpt.tier.includes('Free'));

  const claude = MY_ACCOUNTS.find(a => a.id === 'claude');
  assert(claude.tier.toLowerCase().includes('free'));
  assert.equal(claude.company, 'Claude');

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

test('accounts include strictly configured Antigravity and Codex ecosystems', () => {
  for (const acc of MY_ACCOUNTS) {
    if (acc.id === 'gemini' || acc.id === 'google-ai-studio' || acc.id === 'antigravity') {
      assert.equal(acc.antigravity.supported, true, `${acc.id} must support Antigravity`);
      assert(acc.antigravity.models.length >= 2, `${acc.id} must list Antigravity models`);
      assert.equal(acc.codex.supported, false, `${acc.id} must not be in Codex ecosystem`);
      assert.equal(acc.codex.models.length, 0);
      continue;
    }

    if (acc.id === 'chatgpt' || acc.id === 'codex') {
      assert.equal(acc.codex.supported, true, `${acc.id} must support Codex`);
      assert(acc.codex.models.length >= 2, `${acc.id} must list Codex models`);
      assert.equal(acc.antigravity.supported, false, `${acc.id} must not support Antigravity`);
      assert.equal(acc.antigravity.models.length, 0);
      continue;
    }

    // Third-party standalone accounts: neither Antigravity nor Codex
    assert.equal(acc.antigravity.supported, false, `${acc.id} must not support Antigravity`);
    assert.equal(acc.codex.supported, false, `${acc.id} must not support Codex`);
    assert.equal(acc.antigravity.models.length, 0);
    assert.equal(acc.codex.models.length, 0);
  }
});

test('filtering by antigravity returns Antigravity account and filtering by codex returns Codex account', () => {
  const antigravity = MY_ACCOUNTS.find(a => a.id === 'antigravity');
  assert(antigravity, 'Antigravity account must exist');
  assert.equal(antigravity.name, 'Antigravity');
  assert.equal(antigravity.company, 'Google');

  const codex = MY_ACCOUNTS.find(a => a.id === 'codex');
  assert(codex, 'Codex account must exist');
  assert.equal(codex.name, 'Codex');
  assert.equal(codex.company, 'OpenAI');
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
