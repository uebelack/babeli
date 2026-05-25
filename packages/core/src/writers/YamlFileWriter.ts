import * as fs from "fs";
import * as path from "path";
import * as YAML from "yaml";
import type { FileWriter } from "./FileWriter";
import type { Configuration } from "../Configuration";
import type { MultiLanguageTranslationFile } from "../model/MultiLanguageTranslationFile";
import type { SingleLanguageTranslationFile } from "../model/SingleLanguageTranslationFile";
import { Translations } from "../model/Translations";
import { FileWriterError } from "../errors/FileWriterError";

function unflattenObject(
  flat: Record<string, unknown>,
): Record<string, unknown> {
  const result: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(flat)) {
    const parts = key.split(".");
    let current = result;
    for (let i = 0; i < parts.length - 1; i++) {
      if (!(parts[i]! in current)) {
        current[parts[i]!] = {};
      }
      current = current[parts[i]!] as Record<string, unknown>;
    }
    current[parts[parts.length - 1]!] = value;
  }
  return result;
}

export class YamlFileWriter implements FileWriter {
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
      const flat: Record<string, string> = {};
      for (const translation of file.translations) {
        flat[translation.key] = translation.value;
      }
      const obj = file.nested ? unflattenObject(flat) : flat;
      const yaml = YAML.stringify(obj, { indent: 2 });
      fs.writeFileSync(
        file.file,
        yaml,
        this.configuration.charset ?? "utf-8",
      );
    } catch (e) {
      if (e instanceof FileWriterError) throw e;
      throw new FileWriterError(file.file, e);
    }
  }

  writeMultiLanguageFile(file: MultiLanguageTranslationFile): void {
    try {
      this.ensureDirectory(file.file);
      const translations = Translations.fromTranslations(file.translations);
      const languages = translations.getLanguages();

      const obj: Record<string, unknown> = {};
      for (const lang of languages) {
        const langTranslations = translations.getTranslationsForLanguage(lang);
        const flat: Record<string, string> = {};
        for (const t of langTranslations) {
          flat[t.key] = t.value;
        }
        obj[lang] = file.nested ? unflattenObject(flat) : flat;
      }

      const yaml = YAML.stringify(obj, { indent: 2 });
      fs.writeFileSync(
        file.file,
        yaml,
        this.configuration.charset ?? "utf-8",
      );
    } catch (e) {
      if (e instanceof FileWriterError) throw e;
      throw new FileWriterError(file.file, e);
    }
  }
}
