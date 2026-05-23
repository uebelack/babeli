import type { TranslationError } from "../model/Error";
import type { MultiLanguageTranslationFile } from "../model/MultiLanguageTranslationFile";
import type { SingleLanguageTranslationFile } from "../model/SingleLanguageTranslationFile";

export interface Action {
  validateSingleLanguageFiles(
    translationFiles: SingleLanguageTranslationFile[],
  ): TranslationError[];

  updateSingleLanguageFiles(
    translationFiles: SingleLanguageTranslationFile[],
  ): Promise<SingleLanguageTranslationFile[]>;

  validateMultiLanguageFile(
    translationFile: MultiLanguageTranslationFile,
  ): TranslationError[];

  updateMultiLanguageFile(
    translationFile: MultiLanguageTranslationFile,
  ): Promise<MultiLanguageTranslationFile>;
}
