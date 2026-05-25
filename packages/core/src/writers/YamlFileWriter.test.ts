import * as fs from "fs";
import * as os from "os";
import * as path from "path";
import * as YAML from "yaml";
import { YamlFileWriter } from "./YamlFileWriter";
import { FileWriterError } from "../errors/FileWriterError";
import type { Configuration } from "../Configuration";
import type { SingleLanguageTranslationFile } from "../model/SingleLanguageTranslationFile";
import type { MultiLanguageTranslationFile } from "../model/MultiLanguageTranslationFile";

describe("YamlFileWriter", () => {
  let tmpDir: string;
  let config: Configuration;

  beforeEach(() => {
    tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), "babeli-yaml-writer-test-"));
    config = { charset: "utf-8" };
  });

  afterEach(() => {
    fs.rmSync(tmpDir, { recursive: true });
  });

  describe("writeSingleLanguageFile", () => {
    it("should write a flat single language YAML file", () => {
      const filePath = path.join(tmpDir, "en.yaml");
      const file: SingleLanguageTranslationFile = {
        language: "en",
        file: filePath,
        translations: [
          { language: "en", key: "greeting", value: "Hello" },
          { language: "en", key: "farewell", value: "Goodbye" },
        ],
      };

      const writer = new YamlFileWriter(config);
      writer.writeSingleLanguageFile(file);

      const content = YAML.parse(fs.readFileSync(filePath, "utf-8"));
      expect(content).toEqual({ greeting: "Hello", farewell: "Goodbye" });
    });

    it("should write a nested single language YAML file", () => {
      const filePath = path.join(tmpDir, "en.yaml");
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

      const writer = new YamlFileWriter(config);
      writer.writeSingleLanguageFile(file);

      const content = YAML.parse(fs.readFileSync(filePath, "utf-8"));
      expect(content).toEqual({
        button: { yes: "Yes", no: "No" },
        error: { message: { notfound: "Not found" } },
      });
    });

    it("should write flat YAML when nested is false", () => {
      const filePath = path.join(tmpDir, "en.yaml");
      const file: SingleLanguageTranslationFile = {
        language: "en",
        file: filePath,
        translations: [{ language: "en", key: "common.title", value: "Hello" }],
        nested: false,
      };

      const writer = new YamlFileWriter(config);
      writer.writeSingleLanguageFile(file);

      const content = YAML.parse(fs.readFileSync(filePath, "utf-8"));
      expect(content).toEqual({ "common.title": "Hello" });
    });

    it("should create parent directories if they do not exist", () => {
      const filePath = path.join(tmpDir, "nested", "dir", "en.yaml");
      const file: SingleLanguageTranslationFile = {
        language: "en",
        file: filePath,
        translations: [{ language: "en", key: "hello", value: "Hello" }],
      };

      const writer = new YamlFileWriter(config);
      writer.writeSingleLanguageFile(file);

      expect(fs.existsSync(filePath)).toBe(true);
      const content = YAML.parse(fs.readFileSync(filePath, "utf-8"));
      expect(content).toEqual({ hello: "Hello" });
    });

    it("should use default charset when not configured", () => {
      const filePath = path.join(tmpDir, "en.yaml");
      const file: SingleLanguageTranslationFile = {
        language: "en",
        file: filePath,
        translations: [{ language: "en", key: "hello", value: "Hello" }],
      };

      const writer = new YamlFileWriter({});
      writer.writeSingleLanguageFile(file);

      const content = YAML.parse(fs.readFileSync(filePath, "utf-8"));
      expect(content).toEqual({ hello: "Hello" });
    });

    it("should throw FileWriterError on write failure", () => {
      const file: SingleLanguageTranslationFile = {
        language: "en",
        file: "/nonexistent/readonly/en.yaml",
        translations: [{ language: "en", key: "hello", value: "Hello" }],
      };

      const writer = new YamlFileWriter(config);
      expect(() => writer.writeSingleLanguageFile(file)).toThrow(
        FileWriterError,
      );
    });
  });

  describe("writeMultiLanguageFile", () => {
    it("should write a nested multi-language YAML file", () => {
      const filePath = path.join(tmpDir, "translations.yaml");
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

      const writer = new YamlFileWriter(config);
      writer.writeMultiLanguageFile(file);

      const content = YAML.parse(fs.readFileSync(filePath, "utf-8"));
      expect(content).toEqual({
        de: { button: { yes: "Ja", no: "Nein" } },
        en: { button: { yes: "Yes", no: "No" } },
      });
    });

    it("should write a flat multi-language YAML file", () => {
      const filePath = path.join(tmpDir, "translations.yaml");
      const file: MultiLanguageTranslationFile = {
        file: filePath,
        translations: [
          { language: "en", key: "greeting", value: "Hello" },
          { language: "de", key: "greeting", value: "Hallo" },
        ],
      };

      const writer = new YamlFileWriter(config);
      writer.writeMultiLanguageFile(file);

      const content = YAML.parse(fs.readFileSync(filePath, "utf-8"));
      expect(content).toEqual({
        de: { greeting: "Hallo" },
        en: { greeting: "Hello" },
      });
    });

    it("should create parent directories if they do not exist", () => {
      const filePath = path.join(tmpDir, "deep", "nested", "translations.yaml");
      const file: MultiLanguageTranslationFile = {
        file: filePath,
        translations: [{ language: "en", key: "hello", value: "Hello" }],
      };

      const writer = new YamlFileWriter(config);
      writer.writeMultiLanguageFile(file);

      expect(fs.existsSync(filePath)).toBe(true);
    });

    it("should use default charset when not configured", () => {
      const filePath = path.join(tmpDir, "translations.yaml");
      const file: MultiLanguageTranslationFile = {
        file: filePath,
        translations: [{ language: "en", key: "hello", value: "Hello" }],
      };

      const writer = new YamlFileWriter({});
      writer.writeMultiLanguageFile(file);

      const content = YAML.parse(fs.readFileSync(filePath, "utf-8"));
      expect(content).toEqual({ en: { hello: "Hello" } });
    });

    it("should throw FileWriterError on write failure", () => {
      const file: MultiLanguageTranslationFile = {
        file: "/nonexistent/readonly/translations.yaml",
        translations: [{ language: "en", key: "hello", value: "Hello" }],
      };

      const writer = new YamlFileWriter(config);
      expect(() => writer.writeMultiLanguageFile(file)).toThrow(
        FileWriterError,
      );
    });
  });
});
