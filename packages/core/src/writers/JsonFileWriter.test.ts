import * as fs from "fs";
import * as os from "os";
import * as path from "path";
import { JsonFileWriter } from "./JsonFileWriter";
import { FileWriterError } from "../errors/FileWriterError";
import type { Configuration } from "../Configuration";
import type { SingleLanguageTranslationFile } from "../model/SingleLanguageTranslationFile";
import type { MultiLanguageTranslationFile } from "../model/MultiLanguageTranslationFile";

describe("JsonFileWriter", () => {
  let tmpDir: string;
  let config: Configuration;

  beforeEach(() => {
    tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), "babeli-test-"));
    config = { charset: "utf-8" };
  });

  afterEach(() => {
    fs.rmSync(tmpDir, { recursive: true });
  });

  describe("writeSingleLanguageFile", () => {
    it("should write a single language JSON file", () => {
      const filePath = path.join(tmpDir, "en.json");
      const file: SingleLanguageTranslationFile = {
        language: "en",
        file: filePath,
        translations: [
          { language: "en", key: "greeting", value: "Hello" },
          { language: "en", key: "farewell", value: "Goodbye" },
        ],
      };

      const writer = new JsonFileWriter(config);
      writer.writeSingleLanguageFile(file);

      const content = JSON.parse(fs.readFileSync(filePath, "utf-8"));
      expect(content).toEqual({ greeting: "Hello", farewell: "Goodbye" });
    });

    it("should create parent directories if they do not exist", () => {
      const filePath = path.join(tmpDir, "nested", "dir", "en.json");
      const file: SingleLanguageTranslationFile = {
        language: "en",
        file: filePath,
        translations: [{ language: "en", key: "hello", value: "Hello" }],
      };

      const writer = new JsonFileWriter(config);
      writer.writeSingleLanguageFile(file);

      expect(fs.existsSync(filePath)).toBe(true);
      const content = JSON.parse(fs.readFileSync(filePath, "utf-8"));
      expect(content).toEqual({ hello: "Hello" });
    });

    it("should write pretty-printed JSON", () => {
      const filePath = path.join(tmpDir, "en.json");
      const file: SingleLanguageTranslationFile = {
        language: "en",
        file: filePath,
        translations: [{ language: "en", key: "hello", value: "Hello" }],
      };

      const writer = new JsonFileWriter(config);
      writer.writeSingleLanguageFile(file);

      const raw = fs.readFileSync(filePath, "utf-8");
      expect(raw).toContain("\n");
      expect(raw).toContain("  ");
    });

    it("should use default charset when not configured", () => {
      const filePath = path.join(tmpDir, "en.json");
      const file: SingleLanguageTranslationFile = {
        language: "en",
        file: filePath,
        translations: [{ language: "en", key: "hello", value: "Hello" }],
      };

      const writer = new JsonFileWriter({});
      writer.writeSingleLanguageFile(file);

      const content = JSON.parse(fs.readFileSync(filePath, "utf-8"));
      expect(content).toEqual({ hello: "Hello" });
    });

    it("should throw FileWriterError on write failure", () => {
      const file: SingleLanguageTranslationFile = {
        language: "en",
        file: "/nonexistent/readonly/en.json",
        translations: [{ language: "en", key: "hello", value: "Hello" }],
      };

      const writer = new JsonFileWriter(config);
      expect(() => writer.writeSingleLanguageFile(file)).toThrow(
        FileWriterError,
      );
    });
  });

  describe("writeMultiLanguageFile", () => {
    it("should write a multi-language JSON file", () => {
      const filePath = path.join(tmpDir, "translations.json");
      const file: MultiLanguageTranslationFile = {
        file: filePath,
        translations: [
          { language: "en", key: "greeting", value: "Hello" },
          { language: "de", key: "greeting", value: "Hallo" },
          { language: "en", key: "farewell", value: "Goodbye" },
          { language: "de", key: "farewell", value: "Auf Wiedersehen" },
        ],
      };

      const writer = new JsonFileWriter(config);
      writer.writeMultiLanguageFile(file);

      const content = JSON.parse(fs.readFileSync(filePath, "utf-8"));
      expect(content).toEqual({
        greeting: { en: "Hello", de: "Hallo" },
        farewell: { en: "Goodbye", de: "Auf Wiedersehen" },
      });
    });

    it("should create parent directories if they do not exist", () => {
      const filePath = path.join(tmpDir, "deep", "nested", "translations.json");
      const file: MultiLanguageTranslationFile = {
        file: filePath,
        translations: [{ language: "en", key: "hello", value: "Hello" }],
      };

      const writer = new JsonFileWriter(config);
      writer.writeMultiLanguageFile(file);

      expect(fs.existsSync(filePath)).toBe(true);
    });

    it("should use default charset when not configured", () => {
      const filePath = path.join(tmpDir, "translations.json");
      const file: MultiLanguageTranslationFile = {
        file: filePath,
        translations: [{ language: "en", key: "hello", value: "Hello" }],
      };

      const writer = new JsonFileWriter({});
      writer.writeMultiLanguageFile(file);

      const content = JSON.parse(fs.readFileSync(filePath, "utf-8"));
      expect(content).toEqual({ hello: { en: "Hello" } });
    });

    it("should throw FileWriterError on write failure", () => {
      const file: MultiLanguageTranslationFile = {
        file: "/nonexistent/readonly/translations.json",
        translations: [{ language: "en", key: "hello", value: "Hello" }],
      };

      const writer = new JsonFileWriter(config);
      expect(() => writer.writeMultiLanguageFile(file)).toThrow(
        FileWriterError,
      );
    });
  });
});
