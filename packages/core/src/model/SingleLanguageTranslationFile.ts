import type { Translation } from "./Translation";

export interface SingleLanguageTranslationFile {
  language: string;
  file: string;
  translations: Translation[];
  nested?: boolean;
}

export function singleLanguageTranslationFileFromMap(
  language: string,
  file: string,
  map: Map<string, string>,
  nested?: boolean,
): SingleLanguageTranslationFile {
  const translations: Translation[] = [];
  for (const [key, value] of map) {
    translations.push({ language, key, value });
  }
  return { language, file, translations, nested };
}
