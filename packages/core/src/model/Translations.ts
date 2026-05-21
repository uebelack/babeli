import type { Translation } from "./Translation";

export class Translations {
  private readonly keyLanguageMap: Map<string, Map<string, string>>;
  private readonly languageKeyMap: Map<string, Map<string, string>>;
  private readonly languages: string[];

  private constructor(translations: Translation[]) {
    this.languages = [...new Set(translations.map((t) => t.language))].sort();

    this.keyLanguageMap = new Map();
    this.languageKeyMap = new Map();

    for (const { key, language, value } of translations) {
      if (!this.keyLanguageMap.has(key)) {
        this.keyLanguageMap.set(key, new Map());
      }
      this.keyLanguageMap.get(key)!.set(language, value);

      if (!this.languageKeyMap.has(language)) {
        this.languageKeyMap.set(language, new Map());
      }
      this.languageKeyMap.get(language)!.set(key, value);
    }
  }

  private static keyLanguageMapToTranslations(
    keyLanguageMap: Map<string, Map<string, string>>,
  ): Translation[] {
    const translations: Translation[] = [];
    for (const [key, languageMap] of keyLanguageMap) {
      for (const [language, value] of languageMap) {
        translations.push({ language, key, value });
      }
    }
    return translations;
  }

  static fromKeyLanguageMap(
    keyLanguageMap: Map<string, Map<string, string>>,
  ): Translations {
    return new Translations(
      Translations.keyLanguageMapToTranslations(keyLanguageMap),
    );
  }

  static fromTranslations(translations: Translation[]): Translations {
    return new Translations(translations);
  }

  getLanguages(): string[] {
    return this.languages;
  }

  getKeyLanguageMap(): Map<string, Map<string, string>> {
    return this.keyLanguageMap;
  }

  getKeys(): Set<string> {
    return new Set(this.keyLanguageMap.keys());
  }

  getTranslation(key: string, language: string): string | undefined {
    return this.keyLanguageMap.get(key)?.get(language);
  }

  getTranslationsMapForKey(key: string): Map<string, string> | undefined {
    return this.keyLanguageMap.get(key);
  }

  getTranslationsMapForLanguage(
    language: string,
  ): Map<string, string> | undefined {
    return this.languageKeyMap.get(language);
  }

  getTranslationsForLanguage(language: string): Translation[] {
    const translations: Translation[] = [];
    const map = this.languageKeyMap.get(language);
    if (map) {
      for (const [key, value] of map) {
        translations.push({ language, key, value });
      }
    }
    return translations;
  }

  getTranslations(): Translation[] {
    const translations: Translation[] = [];
    for (const [key, languageMap] of this.keyLanguageMap) {
      for (const [language, value] of languageMap) {
        translations.push({ language, key, value });
      }
    }
    return translations;
  }

  add(key: string, language: string, value: string): Translation {
    const translation: Translation = { language, key, value };

    if (!this.keyLanguageMap.has(key)) {
      this.keyLanguageMap.set(key, new Map());
    }
    this.keyLanguageMap.get(key)!.set(language, value);

    if (!this.languageKeyMap.has(language)) {
      this.languageKeyMap.set(language, new Map());
    }
    this.languageKeyMap.get(language)!.set(key, value);

    return translation;
  }

  getTranslationForValue(
    text: string,
    sourceLanguage: string,
    targetLanguage: string,
  ): string | undefined {
    const sourceMap = this.languageKeyMap.get(sourceLanguage);
    const targetMap = this.languageKeyMap.get(targetLanguage);
    if (!sourceMap || !targetMap) {
      return undefined;
    }
    for (const [key, value] of sourceMap) {
      if (value === text) {
        const translation = targetMap.get(key);
        if (translation !== undefined) {
          return translation;
        }
      }
    }
    return undefined;
  }
}
