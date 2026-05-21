import type { Translation } from "./Translation";

export interface MultiLanguageTranslationFile {
  file: string;
  translations: Translation[];
}
