import * as fs from "fs";
import type { FileReader } from "./FileReader";
import type { Configuration } from "../Configuration";
import type { MultiLanguageTranslationFile } from "../model/MultiLanguageTranslationFile";
import type { SingleLanguageTranslationFile } from "../model/SingleLanguageTranslationFile";
import { FileReaderError } from "../errors/FileReaderError";

function parseStringsFile(content: string): Map<string, string> {
  const result = new Map<string, string>();
  const regex = /^"((?:[^"\\]|\\.)*)"\s*=\s*"((?:[^"\\]|\\.)*)"\s*;/gm;
  let match;
  while ((match = regex.exec(content)) !== null) {
    const key = match[1]!.replace(/\\"/g, '"').replace(/\\\\/g, "\\");
    const value = match[2]!.replace(/\\"/g, '"').replace(/\\\\/g, "\\");
    result.set(key, value);
  }
  return result;
}

export class StringsFileReader implements FileReader {
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
      const map = parseStringsFile(content);

      const translations = [...map.entries()].map(([key, value]) => ({
        language,
        key,
        value,
      }));

      return { language, file: filePath, translations };
    } catch (e) {
      if (e instanceof FileReaderError) throw e;
      throw new FileReaderError(filePath, e);
    }
  }

  readMultiLanguageFile(filePath: string): MultiLanguageTranslationFile {
    throw new FileReaderError(
      filePath,
      new Error(
        "Apple .strings files do not support multi-language format. Use separate .lproj directories instead.",
      ),
    );
  }
}
