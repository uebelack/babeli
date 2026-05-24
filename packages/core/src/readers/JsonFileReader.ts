import * as fs from "fs";
import type { FileReader } from "./FileReader";
import type { Configuration } from "../Configuration";
import type { MultiLanguageTranslationFile } from "../model/MultiLanguageTranslationFile";
import type { SingleLanguageTranslationFile } from "../model/SingleLanguageTranslationFile";
import { Translations } from "../model/Translations";
import { FileReaderError } from "../errors/FileReaderError";

type JsonValue = string | { [key: string]: JsonValue };

function isNested(obj: Record<string, unknown>): boolean {
  return Object.values(obj).some(
    (v) => typeof v === "object" && v !== null && !Array.isArray(v),
  );
}

function isNestedMultiLanguage(obj: Record<string, unknown>): boolean {
  return Object.values(obj).some(
    (v) =>
      typeof v === "object" &&
      v !== null &&
      !Array.isArray(v) &&
      Object.values(v as Record<string, unknown>).some(
        (vv) => typeof vv === "object" && vv !== null && !Array.isArray(vv),
      ),
  );
}

function flattenObject(
  obj: Record<string, JsonValue>,
  prefix = "",
): Map<string, string> {
  const result = new Map<string, string>();
  for (const [key, value] of Object.entries(obj)) {
    const fullKey = prefix ? `${prefix}.${key}` : key;
    if (typeof value === "string") {
      result.set(fullKey, value);
    } else {
      for (const [k, v] of flattenObject(value, fullKey)) {
        result.set(k, v);
      }
    }
  }
  return result;
}

function flattenToLanguageMaps(
  obj: Record<string, unknown>,
  prefix = "",
): Map<string, Map<string, string>> {
  const result = new Map<string, Map<string, string>>();
  for (const [key, value] of Object.entries(obj)) {
    const fullKey = prefix ? `${prefix}.${key}` : key;
    if (typeof value === "object" && value !== null && !Array.isArray(value)) {
      const innerValues = Object.values(value as Record<string, unknown>);
      if (innerValues.every((v) => typeof v === "string")) {
        result.set(
          fullKey,
          new Map(Object.entries(value as Record<string, string>)),
        );
      } else {
        for (const [k, v] of flattenToLanguageMaps(
          value as Record<string, unknown>,
          fullKey,
        )) {
          result.set(k, v);
        }
      }
    }
  }
  return result;
}

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
      const obj = JSON.parse(content) as Record<string, JsonValue>;
      const nested = isNested(obj);
      const map = nested
        ? flattenObject(obj)
        : new Map(Object.entries(obj) as [string, string][]);

      const translations = [...map.entries()].map(([key, value]) => ({
        language,
        key,
        value,
      }));

      return { language, file: filePath, translations, nested };
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
      const raw = JSON.parse(content) as Record<string, unknown>;
      const nested = isNestedMultiLanguage(raw);

      if (nested) {
        const keyLanguageMap = flattenToLanguageMaps(raw);
        const translations = Translations.fromKeyLanguageMap(keyLanguageMap);
        return {
          file: filePath,
          translations: translations.getTranslations(),
          nested,
        };
      }

      const keyLanguageObj = raw as Record<string, Record<string, string>>;
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
