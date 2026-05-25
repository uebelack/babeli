import * as path from "path";
import type { FileReader } from "./FileReader";
import type { MultiLanguageTranslationFile } from "../model/MultiLanguageTranslationFile";
import type { SingleLanguageTranslationFile } from "../model/SingleLanguageTranslationFile";
import { FileReaderError } from "../errors/FileReaderError";

type JsValue = string | { [key: string]: JsValue };

function isNested(obj: Record<string, unknown>): boolean {
  return Object.values(obj).some(
    (v) => typeof v === "object" && v !== null && !Array.isArray(v),
  );
}

function flattenObject(
  obj: Record<string, JsValue>,
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

async function loadJsModule(
  filePath: string,
): Promise<Record<string, unknown>> {
  const absolutePath = path.isAbsolute(filePath)
    ? filePath
    : path.resolve(process.cwd(), filePath);
  const module = await import(absolutePath);
  return (module.default ?? module) as Record<string, unknown>;
}

export class JsFileReader implements FileReader {
  async readSingleLanguageFile(
    language: string,
    filePath: string,
  ): Promise<SingleLanguageTranslationFile> {
    try {
      const obj = await loadJsModule(filePath);
      const nested = isNested(obj);
      const map = nested
        ? flattenObject(obj as Record<string, JsValue>)
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

  async readMultiLanguageFile(
    filePath: string,
  ): Promise<MultiLanguageTranslationFile> {
    try {
      const raw = await loadJsModule(filePath);
      const languages = Object.keys(raw);
      const translations: { language: string; key: string; value: string }[] =
        [];

      let nested = false;
      for (const lang of languages) {
        const langObj = raw[lang] as Record<string, JsValue>;
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
