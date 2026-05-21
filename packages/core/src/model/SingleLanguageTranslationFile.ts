import type { Translation } from "./Translation";

export interface SingleLanguageTranslationFile {
  language: string;
  file: string;
  translations: Translation[];
}

export function singleLanguageTranslationFileFromMap(
  language: string,
  file: string,
  map: Map<string, string>,
): SingleLanguageTranslationFile {
  const translations: Translation[] = [];
  for (const [key, value] of map) {
    translations.push({ language, key, value });
  }
  return { language, file, translations };
}
