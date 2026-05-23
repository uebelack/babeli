import * as fs from "fs";
import * as path from "path";
import type { FileWriter } from "./FileWriter";
import type { Configuration } from "../Configuration";
import type { MultiLanguageTranslationFile } from "../model/MultiLanguageTranslationFile";
import type { SingleLanguageTranslationFile } from "../model/SingleLanguageTranslationFile";
import { Translations } from "../model/Translations";
import { FileWriterError } from "../errors/FileWriterError";

export class JsonFileWriter implements FileWriter {
  private readonly configuration: Configuration;

  constructor(configuration: Configuration) {
    this.configuration = configuration;
  }

  private ensureDirectory(filePath: string): void {
    const dir = path.dirname(filePath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
  }

  writeSingleLanguageFile(file: SingleLanguageTranslationFile): void {
    try {
      this.ensureDirectory(file.file);
      const obj: Record<string, string> = {};
      for (const translation of file.translations) {
        obj[translation.key] = translation.value;
      }
      const json = JSON.stringify(obj, null, 2);
      fs.writeFileSync(file.file, json, this.configuration.charset ?? "utf-8");
    } catch (e) {
      if (e instanceof FileWriterError) throw e;
      throw new FileWriterError(file.file, e);
    }
  }

  writeMultiLanguageFile(file: MultiLanguageTranslationFile): void {
    try {
      this.ensureDirectory(file.file);
      const translations = Translations.fromTranslations(file.translations);
      const keyLanguageMap = translations.getKeyLanguageMap();
      const obj: Record<string, Record<string, string>> = {};
      for (const [key, langMap] of keyLanguageMap) {
        obj[key] = Object.fromEntries(langMap);
      }
      const json = JSON.stringify(obj, null, 2);
      fs.writeFileSync(file.file, json, this.configuration.charset ?? "utf-8");
    } catch (e) {
      if (e instanceof FileWriterError) throw e;
      throw new FileWriterError(file.file, e);
    }
  }
}
