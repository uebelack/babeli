import type { Action } from "./Action";
import type { Configuration } from "../Configuration";
import type { TranslationError } from "../model/Error";
import type { MultiLanguageTranslationFile } from "../model/MultiLanguageTranslationFile";
import type { SingleLanguageTranslationFile } from "../model/SingleLanguageTranslationFile";
import { relativePath } from "../util/relativePath";

export class SortAction implements Action {
  static readonly NAME = "sort";
  private readonly configuration: Configuration;

  constructor(configuration: Configuration) {
    this.configuration = configuration;
  }

  validateSingleLanguageFiles(
    translationFiles: SingleLanguageTranslationFile[],
  ): TranslationError[] {
    const errors: TranslationError[] = [];

    for (const translationFile of translationFiles) {
      const sorted = [...translationFile.translations].sort((a, b) =>
        a.key.localeCompare(b.key),
      );
      const isSorted = translationFile.translations.every(
        (t, i) => t.key === sorted[i]!.key,
      );

      if (!isSorted) {
        errors.push({
          action: SortAction.NAME,
          language: translationFile.language,
          value: translationFile.file,
          message:
            "Translations in file " +
            relativePath(
              this.configuration.workingDirectory ?? ".",
              translationFile.file,
            ) +
            " are not sorted.",
        });
      }
    }

    return errors;
  }

  async updateSingleLanguageFiles(
    translationFiles: SingleLanguageTranslationFile[],
  ): Promise<SingleLanguageTranslationFile[]> {
    return translationFiles.map((tf) => ({
      language: tf.language,
      file: tf.file,
      translations: [...tf.translations].sort((a, b) =>
        a.key.localeCompare(b.key),
      ),
    }));
  }

  validateMultiLanguageFile(
    translationFile: MultiLanguageTranslationFile,
  ): TranslationError[] {
    const sorted = [...translationFile.translations].sort((a, b) =>
      a.key.localeCompare(b.key),
    );
    const isSorted = translationFile.translations.every(
      (t, i) => t.key === sorted[i]!.key,
    );

    if (!isSorted) {
      return [
        {
          action: SortAction.NAME,
          language: "",
          value: translationFile.file,
          message:
            "Translations in file " +
            relativePath(
              this.configuration.workingDirectory ?? ".",
              translationFile.file,
            ) +
            " are not sorted.",
        },
      ];
    }

    return [];
  }

  async updateMultiLanguageFile(
    translationFile: MultiLanguageTranslationFile,
  ): Promise<MultiLanguageTranslationFile> {
    return {
      file: translationFile.file,
      translations: [...translationFile.translations].sort((a, b) =>
        a.key.localeCompare(b.key),
      ),
    };
  }
}
