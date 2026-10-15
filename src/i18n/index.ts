import { TranslationManager } from '../helpers/TranslationManager.ts';
import en from './en.json' with { type: 'json' };

export type TranslationKey = keyof typeof en;

/** UI copy of the app under test. `APP_LOCALE` selects the locale (default `en`). */
export const i18n = new TranslationManager<TranslationKey, 'en'>({
  dictionaries: { en },
  fallbackLocale: 'en',
  locale: process.env['APP_LOCALE'],
});

export const t: TranslationManager<TranslationKey, 'en'>['t'] = (key, params) => i18n.t(key, params);
