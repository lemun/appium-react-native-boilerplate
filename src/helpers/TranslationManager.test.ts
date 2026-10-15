import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { TranslationManager } from './TranslationManager.ts';

type Key = 'greeting' | 'farewell' | 'welcome';

const dictionaries = {
  en: { greeting: 'Hello', farewell: 'Goodbye', welcome: 'Welcome, {name}!' },
  fr: { greeting: 'Bonjour' },
};

describe('TranslationManager', () => {
  it('uses the fallback locale when the requested one is unknown or missing', () => {
    assert.equal(new TranslationManager<Key, 'en' | 'fr'>({ dictionaries, fallbackLocale: 'en' }).locale, 'en');
    assert.equal(
      new TranslationManager<Key, 'en' | 'fr'>({ dictionaries, fallbackLocale: 'en', locale: 'xx' }).locale,
      'en',
    );
  });

  it('translates in the current locale and falls back key by key', () => {
    const i18n = new TranslationManager<Key, 'en' | 'fr'>({ dictionaries, fallbackLocale: 'en', locale: 'fr' });

    assert.equal(i18n.t('greeting'), 'Bonjour');
    assert.equal(i18n.t('farewell'), 'Goodbye');
  });

  it('interpolates placeholders and rejects missing values', () => {
    const i18n = new TranslationManager<Key, 'en' | 'fr'>({ dictionaries, fallbackLocale: 'en' });

    assert.equal(i18n.t('welcome', { name: 'Ada' }), 'Welcome, Ada!');
    assert.throws(() => i18n.t('welcome'), /Missing value for "\{name\}"/);
  });

  it('switches locale at runtime and rejects unsupported locales', () => {
    const i18n = new TranslationManager<Key, 'en' | 'fr'>({ dictionaries, fallbackLocale: 'en' });

    i18n.setLocale('fr');
    assert.equal(i18n.t('greeting'), 'Bonjour');
    assert.throws(() => {
      i18n.setLocale('de');
    }, /not supported/);
  });
});
