import type { Action } from "./Action";
import type { Configuration } from "../Configuration";
import { Logger } from "../logging/Logger";
import type { TranslationError } from "../model/Error";
import type { MultiLanguageTranslationFile } from "../model/MultiLanguageTranslationFile";
import type { SingleLanguageTranslationFile } from "../model/SingleLanguageTranslationFile";
import { Translations } from "../model/Translations";
import { TranslationService } from "../services/TranslationService";
import { relativePath } from "../util/relativePath";

export class MissingAction implements Action {
  static readonly NAME = "missing";
  private readonly configuration: Configuration;

  constructor(configuration: Configuration) {
    this.configuration = configuration;
  }

  validateSingleLanguageFiles(
    translationFiles: SingleLanguageTranslationFile[],
  ): TranslationError[] {
    const allKeys = [
      ...new Set(
        translationFiles.flatMap((tf) => tf.translations.map((t) => t.key)),
      ),
    ];

    const errors: TranslationError[] = [];

    for (const translationFile of translationFiles) {
      const existingKeys = new Set(
        translationFile.translations.map((t) => t.key),
      );
      const missingKeys = allKeys.filter((key) => !existingKeys.has(key));

      for (const key of missingKeys) {
        errors.push({
          action: MissingAction.NAME,
          language: translationFile.language,
          value: key,
          message: `Missing translation for '${key}' in file ${relativePath(this.configuration.workingDirectory ?? ".", translationFile.file)}`,
        });
      }
    }

    return errors;
  }

  validateMultiLanguageFile(
    translationFile: MultiLanguageTranslationFile,
  ): TranslationError[] {
    const translations = Translations.fromTranslations(
      translationFile.translations,
    );
    const keyLanguageMap = translations.getKeyLanguageMap();
    const languages = [
      ...new Set(translationFile.translations.map((t) => t.language)),
    ];
    const errors: TranslationError[] = [];

    for (const key of keyLanguageMap.keys()) {
      for (const language of languages) {
        if (!keyLanguageMap.get(key)!.has(language)) {
          errors.push({
            action: MissingAction.NAME,
            language,
            value: key,
            message: `Missing translation for key '${key}' and language '${language}' in file '${relativePath(this.configuration.workingDirectory ?? ".", translationFile.file)}'`,
          });
        }
      }
    }

    return errors;
  }

  async updateMultiLanguageFile(
    translationFile: MultiLanguageTranslationFile,
  ): Promise<MultiLanguageTranslationFile> {
    const translations = Translations.fromTranslations(
      translationFile.translations,
    );
    const translationService = new TranslationService(
      this.configuration,
      translations,
    );
    const logger = new Logger(this.configuration);

    for (const language of translations.getLanguages()) {
      for (const key of translations.getKeys()) {
        if (translations.getTranslation(key, language) === undefined) {
          logger.info(
            `Missing translation for key '${key}' and language '${language}' in file '${relativePath(this.configuration.workingDirectory ?? ".", translationFile.file)}'. Generating translation.`,
          );
          const translation = await this.translate(
            translationService,
            key,
            language,
            translations,
          );
          logger.info(
            `Generated translation for key '${key}' and language '${language}' in file '${relativePath(this.configuration.workingDirectory ?? ".", translationFile.file)}': '${translation}'`,
          );
          translations.add(key, language, translation);
        }
      }
    }

    return {
      file: translationFile.file,
      translations: translations.getTranslations(),
    };
  }

  async updateSingleLanguageFiles(
    inputTranslationFiles: SingleLanguageTranslationFile[],
  ): Promise<SingleLanguageTranslationFile[]> {
    const allKeys = [
      ...new Set(
        inputTranslationFiles.flatMap((tf) =>
          tf.translations.map((t) => t.key),
        ),
      ),
    ];

    const translations = Translations.fromTranslations(
      inputTranslationFiles.flatMap((tf) => tf.translations),
    );

    const translationService = new TranslationService(
      this.configuration,
      translations,
    );
    const logger = new Logger(this.configuration);

    for (const translationFile of inputTranslationFiles) {
      const existingKeys = new Set(
        translationFile.translations.map((t) => t.key),
      );
      const missingKeys = allKeys.filter((key) => !existingKeys.has(key));

      for (const key of missingKeys) {
        logger.info(
          `Missing translation for key '${key}' and language '${translationFile.language}' in file '${relativePath(this.configuration.workingDirectory ?? ".", translationFile.file)}'. Generating translation.`,
        );
        const translation = await this.translate(
          translationService,
          key,
          translationFile.language,
          translations,
        );
        logger.info(
          `Generated translation for key '${key}' and language '${translationFile.language}' in file '${relativePath(this.configuration.workingDirectory ?? ".", translationFile.file)}': '${translation}'`,
        );
        translations.add(key, translationFile.language, translation);
      }
    }

    return inputTranslationFiles.map((tf) => ({
      language: tf.language,
      file: tf.file,
      translations: translations.getTranslationsForLanguage(tf.language),
    }));
  }

  private async translate(
    translationService: TranslationService,
    key: string,
    language: string,
    translations: Translations,
  ): Promise<string> {
    const baseLanguage = this.configuration.baseLanguage ?? "en";

    if (language !== baseLanguage) {
      const translation = translations.getTranslation(key, baseLanguage);
      if (translation !== undefined) {
        return translationService.translate(
          translation,
          baseLanguage,
          language,
        );
      }
    }

    const translationsMap = translations.getTranslationsMapForKey(key);
    const referenceLanguage = [...translationsMap!.keys()].find(
      (l) => l !== language,
    );

    if (!referenceLanguage) {
      throw new Error("No other translation found for key " + key);
    }

    const referenceValue = translations.getTranslation(key, referenceLanguage);

    if (referenceValue === undefined) {
      throw new Error(
        "No translation found for key " +
          key +
          " and language " +
          referenceLanguage,
      );
    }

    return translationService.translate(
      referenceValue,
      referenceLanguage,
      language,
    );
  }
}
