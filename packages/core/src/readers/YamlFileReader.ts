import * as fs from "fs";
import * as YAML from "yaml";
import type { FileReader } from "./FileReader";
import type { Configuration } from "../Configuration";
import type { MultiLanguageTranslationFile } from "../model/MultiLanguageTranslationFile";
import type { SingleLanguageTranslationFile } from "../model/SingleLanguageTranslationFile";
import { FileReaderError } from "../errors/FileReaderError";

type YamlValue = string | { [key: string]: YamlValue };

function isNested(obj: Record<string, unknown>): boolean {
  return Object.values(obj).some(
    (v) => typeof v === "object" && v !== null && !Array.isArray(v),
  );
}

function flattenObject(
  obj: Record<string, YamlValue>,
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

export class YamlFileReader implements FileReader {
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
      const obj = YAML.parse(content) as Record<string, YamlValue>;
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
      const raw = YAML.parse(content) as Record<string, unknown>;
      const languages = Object.keys(raw);
      const translations: { language: string; key: string; value: string }[] =
        [];

      let nested = false;
      for (const lang of languages) {
        const langObj = raw[lang] as Record<string, YamlValue>;
        const langNested = isNested(langObj);
        if (langNested) nested = true;
        const map = langNested
          ? flattenObject(langObj)
          : new Map(Object.entries(langObj) as [string, string][]);

        for (const [key, value] of map) {
          translations.push({ language: lang, key, value });
        }
      }

      return { file: filePath, translations, nested };
    } catch (e) {
      if (e instanceof FileReaderError) throw e;
      throw new FileReaderError(filePath, e);
    }
  }
}
