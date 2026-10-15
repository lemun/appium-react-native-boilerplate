/**
 * Typed UI-copy lookup for assertions, so specs never hard-code user-facing strings.
 *
 * - Keys are typed from the default dictionary: a typo is a compile error.
 * - Other locales are partial and fall back to the default locale, key by key.
 * - `{name}` placeholders are interpolated from the `params` object.
 *
 * Add a locale by dropping `src/i18n/<locale>.json` next to `en.json` and registering it in `src/i18n/index.ts`.
 */
export type Dictionary = Record<string, string>;

export class TranslationManager<TKey extends string, TLocale extends string> {
  private readonly dictionaries: Record<TLocale, Partial<Record<TKey, string>>>;
  private readonly fallbackLocale: TLocale;
  private currentLocale: TLocale;

  constructor(options: {
    dictionaries: Record<TLocale, Partial<Record<TKey, string>>>;
    fallbackLocale: TLocale;
    locale?: string | undefined;
  }) {
    this.dictionaries = options.dictionaries;
    this.fallbackLocale = options.fallbackLocale;
    this.currentLocale = this.isSupported(options.locale) ? options.locale : options.fallbackLocale;
  }

  get locale(): TLocale {
    return this.currentLocale;
  }

  get supportedLocales(): TLocale[] {
    return Object.keys(this.dictionaries) as TLocale[];
  }

  isSupported(locale: string | undefined): locale is TLocale {
    return locale !== undefined && Object.hasOwn(this.dictionaries, locale);
  }

  setLocale(locale: string): void {
    if (!this.isSupported(locale)) {
      throw new Error(`Locale "${locale}" is not supported. Supported: ${this.supportedLocales.join(', ')}`);
    }

    this.currentLocale = locale;
  }

  /** Translate `key` in the current locale, falling back to the fallback locale. Throws on a missing key. */
  t(key: TKey, params: Record<string, string | number> = {}): string {
    const template = this.dictionaries[this.currentLocale][key] ?? this.dictionaries[this.fallbackLocale][key];

    if (template === undefined) {
      throw new Error(`Missing translation for "${key}" (locale "${this.currentLocale}")`);
    }

    return template.replace(/\{(\w+)\}/g, (placeholder, name: string) => {
      const value = params[name];

      if (value === undefined) {
        throw new Error(`Missing value for "${placeholder}" in translation "${key}"`);
      }

      return String(value);
    });
  }
}
