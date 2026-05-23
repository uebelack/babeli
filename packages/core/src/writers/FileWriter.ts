import type { MultiLanguageTranslationFile } from "../model/MultiLanguageTranslationFile";
import type { SingleLanguageTranslationFile } from "../model/SingleLanguageTranslationFile";

export interface FileWriter {
  writeSingleLanguageFile(file: SingleLanguageTranslationFile): void;

  writeMultiLanguageFile(file: MultiLanguageTranslationFile): void;
}
