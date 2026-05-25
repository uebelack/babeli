import * as fs from "fs";
import * as os from "os";
import * as path from "path";
import { JsFileWriter } from "./JsFileWriter";
import { FileWriterError } from "../errors/FileWriterError";
import type { Configuration } from "../Configuration";
import type { SingleLanguageTranslationFile } from "../model/SingleLanguageTranslationFile";
import type { MultiLanguageTranslationFile } from "../model/MultiLanguageTranslationFile";

describe("JsFileWriter", () => {
  let tmpDir: string;
  let config: Configuration;

  beforeEach(() => {
    tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), "babeli-js-writer-test-"));
    config = { charset: "utf-8" };
  });

  afterEach(() => {
    fs.rmSync(tmpDir, { recursive: true });
  });

  describe("writeSingleLanguageFile", () => {
    it("should write a nested single language JS file", () => {
      const filePath = path.join(tmpDir, "en.mjs");
      const file: SingleLanguageTranslationFile = {
        language: "en",
        file: filePath,
        translations: [
          { language: "en", key: "button.yes", value: "Yes" },
          { language: "en", key: "button.no", value: "No" },
          { language: "en", key: "error.message.notfound", value: "Not found" },
        ],
        nested: true,
      };

      const writer = new JsFileWriter(config);
      writer.writeSingleLanguageFile(file);

      const content = fs.readFileSync(filePath, "utf-8");
      expect(content).toContain("export default");
      expect(content).toContain("button");
      expect(content).toContain('"Yes"');
      expect(content).toContain('"No"');
      expect(content).toContain("error");
      expect(content).toContain("message");
      expect(content).toContain('"Not found"');
    });

    it("should write a flat single language JS file", () => {
      const filePath = path.join(tmpDir, "en.mjs");
      const file: SingleLanguageTranslationFile = {
        language: "en",
        file: filePath,
        translations: [
          { language: "en", key: "greeting", value: "Hello" },
          { language: "en", key: "farewell", value: "Goodbye" },
        ],
      };

      const writer = new JsFileWriter(config);
      writer.writeSingleLanguageFile(file);

      const content = fs.readFileSync(filePath, "utf-8");
      expect(content).toContain("export default");
      expect(content).toContain('"Hello"');
      expect(content).toContain('"Goodbye"');
    });

    it("should produce importable JS for nested single language", async () => {
      const filePath = path.join(tmpDir, "en.mjs");
      const file: SingleLanguageTranslationFile = {
        language: "en",
        file: filePath,
        translations: [
          { language: "en", key: "button.yes", value: "Yes" },
          { language: "en", key: "button.no", value: "No" },
        ],
        nested: true,
      };

      const writer = new JsFileWriter(config);
      writer.writeSingleLanguageFile(file);

      const module = await import(filePath);
      expect(module.default).toEqual({
        button: { yes: "Yes", no: "No" },
      });
    });

    it("should create parent directories if they do not exist", () => {
      const filePath = path.join(tmpDir, "nested", "dir", "en.mjs");
      const file: SingleLanguageTranslationFile = {
        language: "en",
        file: filePath,
        translations: [{ language: "en", key: "hello", value: "Hello" }],
      };

      const writer = new JsFileWriter(config);
      writer.writeSingleLanguageFile(file);

      expect(fs.existsSync(filePath)).toBe(true);
    });

    it("should throw FileWriterError on write failure", () => {
      const file: SingleLanguageTranslationFile = {
        language: "en",
        file: "/nonexistent/readonly/en.mjs",
        translations: [{ language: "en", key: "hello", value: "Hello" }],
      };

      const writer = new JsFileWriter(config);
      expect(() => writer.writeSingleLanguageFile(file)).toThrow(
        FileWriterError,
      );
    });

    it("should escape special characters in values", async () => {
      const filePath = path.join(tmpDir, "en.mjs");
      const file: SingleLanguageTranslationFile = {
        language: "en",
        file: filePath,
        translations: [
          {
            language: "en",
            key: "msg",
            value: 'He said "hello"\nand left',
          },
        ],
      };

      const writer = new JsFileWriter(config);
      writer.writeSingleLanguageFile(file);

      const module = await import(filePath);
      expect(module.default.msg).toBe('He said "hello"\nand left');
    });
  });

  describe("writeMultiLanguageFile", () => {
    it("should write a nested multi-language JS file", () => {
      const filePath = path.join(tmpDir, "translations.mjs");
      const file: MultiLanguageTranslationFile = {
        file: filePath,
        translations: [
          { language: "en", key: "button.yes", value: "Yes" },
          { language: "de", key: "button.yes", value: "Ja" },
          { language: "en", key: "button.no", value: "No" },
          { language: "de", key: "button.no", value: "Nein" },
        ],
        nested: true,
      };

      const writer = new JsFileWriter(config);
      writer.writeMultiLanguageFile(file);

      const content = fs.readFileSync(filePath, "utf-8");
      expect(content).toContain("export default");
      expect(content).toContain("en");
      expect(content).toContain("de");
      expect(content).toContain("button");
    });

    it("should produce importable JS for nested multi-language", async () => {
      const filePath = path.join(tmpDir, "translations.mjs");
      const file: MultiLanguageTranslationFile = {
        file: filePath,
        translations: [
          { language: "en", key: "button.yes", value: "Yes" },
          { language: "de", key: "button.yes", value: "Ja" },
          { language: "en", key: "button.no", value: "No" },
          { language: "de", key: "button.no", value: "Nein" },
        ],
        nested: true,
      };

      const writer = new JsFileWriter(config);
      writer.writeMultiLanguageFile(file);

      const module = await import(filePath);
      expect(module.default).toEqual({
        de: { button: { yes: "Ja", no: "Nein" } },
        en: { button: { yes: "Yes", no: "No" } },
      });
    });

    it("should write a flat multi-language JS file", async () => {
      const filePath = path.join(tmpDir, "translations.mjs");
      const file: MultiLanguageTranslationFile = {
        file: filePath,
        translations: [
          { language: "en", key: "greeting", value: "Hello" },
          { language: "de", key: "greeting", value: "Hallo" },
        ],
      };

      const writer = new JsFileWriter(config);
      writer.writeMultiLanguageFile(file);

      const module = await import(filePath);
      expect(module.default).toEqual({
        de: { greeting: "Hallo" },
        en: { greeting: "Hello" },
      });
    });

    it("should throw FileWriterError on write failure", () => {
      const file: MultiLanguageTranslationFile = {
        file: "/nonexistent/readonly/translations.mjs",
        translations: [{ language: "en", key: "hello", value: "Hello" }],
      };

      const writer = new JsFileWriter(config);
      expect(() => writer.writeMultiLanguageFile(file)).toThrow(
        FileWriterError,
      );
    });
  });
});
