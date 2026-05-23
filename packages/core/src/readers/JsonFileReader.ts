import * as fs from "fs";
import type { FileReader } from "./FileReader";
import type { Configuration } from "../Configuration";
import type { MultiLanguageTranslationFile } from "../model/MultiLanguageTranslationFile";
import type { SingleLanguageTranslationFile } from "../model/SingleLanguageTranslationFile";
import { singleLanguageTranslationFileFromMap } from "../model/SingleLanguageTranslationFile";
import { Translations } from "../model/Translations";
import { FileReaderError } from "../errors/FileReaderError";

export class JsonFileReader implements FileReader {
  private readonly configuration: Configuration;

  constructor(configuration: Configuration) {
    this.configuration = configuration;
  }

  readSingleLanguageFile(
    language: string,
    filePath: string,
  ): SingleLanguageTranslationFile {
    try {
      const content = fs.readFileSync(
        filePath,
        this.configuration.charset ?? "utf-8",
      );
      const map = JSON.parse(content) as Record<string, string>;
      return singleLanguageTranslationFileFromMap(
        language,
        filePath,
        new Map(Object.entries(map)),
      );
    } catch (e) {
      if (e instanceof FileReaderError) throw e;
      throw new FileReaderError(filePath, e);
    }
  }

  readMultiLanguageFile(filePath: string): MultiLanguageTranslationFile {
    try {
      const content = fs.readFileSync(
        filePath,
        this.configuration.charset ?? "utf-8",
      );
      const keyLanguageObj = JSON.parse(content) as Record<
        string,
        Record<string, string>
      >;
      const keyLanguageMap = new Map(
        Object.entries(keyLanguageObj).map(([key, langMap]) => [
          key,
          new Map(Object.entries(langMap)),
        ]),
      );
      const translations = Translations.fromKeyLanguageMap(keyLanguageMap);
      return { file: filePath, translations: translations.getTranslations() };
    } catch (e) {
      if (e instanceof FileReaderError) throw e;
      throw new FileReaderError(filePath, e);
    }
  }
}
