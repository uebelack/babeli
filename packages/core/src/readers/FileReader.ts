import type { MultiLanguageTranslationFile } from "../model/MultiLanguageTranslationFile";
import type { SingleLanguageTranslationFile } from "../model/SingleLanguageTranslationFile";

export interface FileReader {
  readSingleLanguageFile(
    language: string,
    filePath: string,
  ): SingleLanguageTranslationFile;

  readMultiLanguageFile(filePath: string): MultiLanguageTranslationFile;
}
