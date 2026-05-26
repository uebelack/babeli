import * as fs from "fs";
import * as path from "path";
import type { FileWriter } from "./FileWriter";
import type { Configuration } from "../Configuration";
import type { MultiLanguageTranslationFile } from "../model/MultiLanguageTranslationFile";
import type { SingleLanguageTranslationFile } from "../model/SingleLanguageTranslationFile";
import { FileWriterError } from "../errors/FileWriterError";

function escapeStringsValue(value: string): string {
  return value.replace(/"/g, '\\"');
}

export class StringsFileWriter implements FileWriter {
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
      const lines = file.translations.map(
        (t) =>
          `"${escapeStringsValue(t.key)}" = "${escapeStringsValue(t.value)}";`,
      );
      const content = lines.join("\n\n") + "\n";
      fs.writeFileSync(
        file.file,
        content,
        this.configuration.charset ?? "utf-8",
      );
    } catch (e) {
      if (e instanceof FileWriterError) throw e;
      throw new FileWriterError(file.file, e);
    }
  }

  writeMultiLanguageFile(file: MultiLanguageTranslationFile): void {
    throw new FileWriterError(
      file.file,
      new Error(
        "Apple .strings files do not support multi-language format. Use separate .lproj directories instead.",
      ),
    );
  }
}
