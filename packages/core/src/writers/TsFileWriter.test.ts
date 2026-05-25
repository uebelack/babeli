import * as fs from "fs";
import * as os from "os";
import * as path from "path";
import { TsFileWriter } from "./TsFileWriter";
import { FileWriterError } from "../errors/FileWriterError";
import type { Configuration } from "../Configuration";
import type { SingleLanguageTranslationFile } from "../model/SingleLanguageTranslationFile";
import type { MultiLanguageTranslationFile } from "../model/MultiLanguageTranslationFile";

describe("TsFileWriter", () => {
  let tmpDir: string;
  let config: Configuration;

  beforeEach(() => {
    tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), "babeli-ts-writer-test-"));
    config = { charset: "utf-8" };
  });

  afterEach(() => {
    fs.rmSync(tmpDir, { recursive: true });
  });

  describe("writeSingleLanguageFile", () => {
    it("should write a flat single language TS file with as const", () => {
      const filePath = path.join(tmpDir, "en.ts");
      const file: SingleLanguageTranslationFile = {
        language: "en",
        file: filePath,
        translations: [
          { language: "en", key: "greeting", value: "Hello" },
          { language: "en", key: "farewell", value: "Goodbye" },
        ],
      };

      const writer = new TsFileWriter(config);
      writer.writeSingleLanguageFile(file);

      const content = fs.readFileSync(filePath, "utf-8");
      expect(content).toContain("export default");
      expect(content).toContain("as const");
      expect(content).toContain('"Hello"');
      expect(content).toContain('"Goodbye"');
    });

    it("should write a nested single language TS file", () => {
      const filePath = path.join(tmpDir, "en.ts");
      const file: SingleLanguageTranslationFile = {
        language: "en",
        file: filePath,
        translations: [
          { language: "en", key: "common.title", value: "Hello" },
          { language: "en", key: "home.teaser", value: "Welcome" },
        ],
        nested: true,
      };

      const writer = new TsFileWriter(config);
      writer.writeSingleLanguageFile(file);

      const content = fs.readFileSync(filePath, "utf-8");
      expect(content).toContain("as const");
      expect(content).toContain("common:");
      expect(content).toContain("title:");
      expect(content).toContain("home:");
    });

    it("should write flat keys when nested is false", () => {
      const filePath = path.join(tmpDir, "en.ts");
      const file: SingleLanguageTranslationFile = {
        language: "en",
        file: filePath,
        translations: [{ language: "en", key: "common.title", value: "Hello" }],
        nested: false,
      };

      const writer = new TsFileWriter(config);
      writer.writeSingleLanguageFile(file);

      const content = fs.readFileSync(filePath, "utf-8");
      expect(content).toContain('"common.title"');
    });

    it("should create parent directories", () => {
      const filePath = path.join(tmpDir, "nested", "dir", "en.ts");
      const file: SingleLanguageTranslationFile = {
        language: "en",
        file: filePath,
        translations: [{ language: "en", key: "hello", value: "Hello" }],
      };

      const writer = new TsFileWriter(config);
      writer.writeSingleLanguageFile(file);

      expect(fs.existsSync(filePath)).toBe(true);
    });

    it("should throw FileWriterError on write failure", () => {
      const file: SingleLanguageTranslationFile = {
        language: "en",
        file: "/nonexistent/readonly/en.ts",
        translations: [{ language: "en", key: "hello", value: "Hello" }],
      };

      const writer = new TsFileWriter(config);
      expect(() => writer.writeSingleLanguageFile(file)).toThrow(
        FileWriterError,
      );
    });

    it("should use default charset when not configured", () => {
      const filePath = path.join(tmpDir, "en.ts");
      const file: SingleLanguageTranslationFile = {
        language: "en",
        file: filePath,
        translations: [{ language: "en", key: "hello", value: "Hello" }],
      };

      const writer = new TsFileWriter({});
      writer.writeSingleLanguageFile(file);

      const content = fs.readFileSync(filePath, "utf-8");
      expect(content).toContain("as const");
    });
  });

  describe("writeMultiLanguageFile", () => {
    it("should write a flat multi-language TS file with as const", () => {
      const filePath = path.join(tmpDir, "translations.ts");
      const file: MultiLanguageTranslationFile = {
        file: filePath,
        translations: [
          { language: "en", key: "greeting", value: "Hello" },
          { language: "de", key: "greeting", value: "Hallo" },
        ],
      };

      const writer = new TsFileWriter(config);
      writer.writeMultiLanguageFile(file);

      const content = fs.readFileSync(filePath, "utf-8");
      expect(content).toContain("export default");
      expect(content).toContain("as const");
      expect(content).toContain("en:");
      expect(content).toContain("de:");
    });

    it("should write a nested multi-language TS file", () => {
      const filePath = path.join(tmpDir, "translations.ts");
      const file: MultiLanguageTranslationFile = {
        file: filePath,
        translations: [
          { language: "en", key: "common.title", value: "Hello" },
          { language: "de", key: "common.title", value: "Hallo" },
        ],
        nested: true,
      };

      const writer = new TsFileWriter(config);
      writer.writeMultiLanguageFile(file);

      const content = fs.readFileSync(filePath, "utf-8");
      expect(content).toContain("as const");
      expect(content).toContain("common:");
      expect(content).toContain("title:");
    });

    it("should create parent directories", () => {
      const filePath = path.join(tmpDir, "deep", "translations.ts");
      const file: MultiLanguageTranslationFile = {
        file: filePath,
        translations: [{ language: "en", key: "hello", value: "Hello" }],
      };

      const writer = new TsFileWriter(config);
      writer.writeMultiLanguageFile(file);

      expect(fs.existsSync(filePath)).toBe(true);
    });

    it("should throw FileWriterError on write failure", () => {
      const file: MultiLanguageTranslationFile = {
        file: "/nonexistent/readonly/translations.ts",
        translations: [{ language: "en", key: "hello", value: "Hello" }],
      };

      const writer = new TsFileWriter(config);
      expect(() => writer.writeMultiLanguageFile(file)).toThrow(
        FileWriterError,
      );
    });

    it("should use default charset when not configured", () => {
      const filePath = path.join(tmpDir, "translations.ts");
      const file: MultiLanguageTranslationFile = {
        file: filePath,
        translations: [{ language: "en", key: "hello", value: "Hello" }],
      };

      const writer = new TsFileWriter({});
      writer.writeMultiLanguageFile(file);

      const content = fs.readFileSync(filePath, "utf-8");
      expect(content).toContain("as const");
    });
  });
});
