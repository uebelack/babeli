import * as fs from "fs";
import * as os from "os";
import * as path from "path";
import { JsonFileReader } from "./JsonFileReader";
import { FileReaderError } from "../errors/FileReaderError";
import type { Configuration } from "../Configuration";

describe("JsonFileReader", () => {
  let tmpDir: string;
  let config: Configuration;

  beforeEach(() => {
    tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), "babeli-test-"));
    config = { charset: "utf-8" };
  });

  afterEach(() => {
    fs.rmSync(tmpDir, { recursive: true });
  });

  describe("readSingleLanguageFile", () => {
    it("should read a single language JSON file", () => {
      const filePath = path.join(tmpDir, "en.json");
      fs.writeFileSync(
        filePath,
        JSON.stringify({ greeting: "Hello", farewell: "Goodbye" }),
      );

      const reader = new JsonFileReader(config);
      const result = reader.readSingleLanguageFile("en", filePath);

      expect(result.language).toBe("en");
      expect(result.file).toBe(filePath);
      expect(result.translations).toHaveLength(2);
      expect(result.translations.find((t) => t.key === "greeting")?.value).toBe(
        "Hello",
      );
      expect(result.translations.find((t) => t.key === "farewell")?.value).toBe(
        "Goodbye",
      );
    });

    it("should throw FileReaderError for non-existent file", () => {
      const reader = new JsonFileReader(config);
      expect(() =>
        reader.readSingleLanguageFile("en", "/nonexistent/file.json"),
      ).toThrow(FileReaderError);
    });

    it("should throw FileReaderError for invalid JSON", () => {
      const filePath = path.join(tmpDir, "invalid.json");
      fs.writeFileSync(filePath, "not valid json{{{");

      const reader = new JsonFileReader(config);
      expect(() => reader.readSingleLanguageFile("en", filePath)).toThrow(
        FileReaderError,
      );
    });

    it("should use default charset when not configured", () => {
      const filePath = path.join(tmpDir, "en.json");
      fs.writeFileSync(filePath, JSON.stringify({ hello: "Hello" }));

      const reader = new JsonFileReader({});
      const result = reader.readSingleLanguageFile("en", filePath);
      expect(result.translations).toHaveLength(1);
    });
  });

  describe("readMultiLanguageFile", () => {
    it("should read a multi-language JSON file", () => {
      const filePath = path.join(tmpDir, "translations.json");
      fs.writeFileSync(
        filePath,
        JSON.stringify({
          greeting: { en: "Hello", de: "Hallo" },
          farewell: { en: "Goodbye", de: "Auf Wiedersehen" },
        }),
      );

      const reader = new JsonFileReader(config);
      const result = reader.readMultiLanguageFile(filePath);

      expect(result.file).toBe(filePath);
      expect(result.translations).toHaveLength(4);

      const enGreeting = result.translations.find(
        (t) => t.key === "greeting" && t.language === "en",
      );
      expect(enGreeting?.value).toBe("Hello");

      const deFarewell = result.translations.find(
        (t) => t.key === "farewell" && t.language === "de",
      );
      expect(deFarewell?.value).toBe("Auf Wiedersehen");
    });

    it("should throw FileReaderError for non-existent file", () => {
      const reader = new JsonFileReader(config);
      expect(() =>
        reader.readMultiLanguageFile("/nonexistent/file.json"),
      ).toThrow(FileReaderError);
    });

    it("should throw FileReaderError for invalid JSON", () => {
      const filePath = path.join(tmpDir, "invalid.json");
      fs.writeFileSync(filePath, "not valid json");

      const reader = new JsonFileReader(config);
      expect(() => reader.readMultiLanguageFile(filePath)).toThrow(
        FileReaderError,
      );
    });

    it("should use default charset when not configured", () => {
      const filePath = path.join(tmpDir, "translations.json");
      fs.writeFileSync(filePath, JSON.stringify({ hello: { en: "Hello" } }));

      const reader = new JsonFileReader({});
      const result = reader.readMultiLanguageFile(filePath);
      expect(result.translations).toHaveLength(1);
    });
  });

  describe("nested single language", () => {
    it("should detect and flatten nested single language file", () => {
      const filePath = path.join(tmpDir, "en.json");
      fs.writeFileSync(
        filePath,
        JSON.stringify({
          common: {
            title: "Hello",
            subtitle: "World",
          },
          home: {
            teaser: "Welcome",
          },
        }),
      );

      const reader = new JsonFileReader(config);
      const result = reader.readSingleLanguageFile("en", filePath);

      expect(result.nested).toBe(true);
      expect(result.translations).toHaveLength(3);
      expect(
        result.translations.find((t) => t.key === "common.title")?.value,
      ).toBe("Hello");
      expect(
        result.translations.find((t) => t.key === "common.subtitle")?.value,
      ).toBe("World");
      expect(
        result.translations.find((t) => t.key === "home.teaser")?.value,
      ).toBe("Welcome");
    });

    it("should set nested to false for flat single language file", () => {
      const filePath = path.join(tmpDir, "en.json");
      fs.writeFileSync(
        filePath,
        JSON.stringify({ hello: "Hello", bye: "Bye" }),
      );

      const reader = new JsonFileReader(config);
      const result = reader.readSingleLanguageFile("en", filePath);

      expect(result.nested).toBe(false);
    });

    it("should handle deeply nested single language file", () => {
      const filePath = path.join(tmpDir, "en.json");
      fs.writeFileSync(
        filePath,
        JSON.stringify({
          a: { b: { c: "deep" } },
        }),
      );

      const reader = new JsonFileReader(config);
      const result = reader.readSingleLanguageFile("en", filePath);

      expect(result.nested).toBe(true);
      expect(result.translations.find((t) => t.key === "a.b.c")?.value).toBe(
        "deep",
      );
    });
  });

  describe("nested multi language", () => {
    it("should detect and flatten nested multi language file", () => {
      const filePath = path.join(tmpDir, "translations.json");
      fs.writeFileSync(
        filePath,
        JSON.stringify({
          common: {
            title: { en: "Hello", de: "Hallo" },
            subtitle: { en: "World", de: "Welt" },
          },
        }),
      );

      const reader = new JsonFileReader(config);
      const result = reader.readMultiLanguageFile(filePath);

      expect(result.nested).toBe(true);
      expect(result.translations).toHaveLength(4);

      const enTitle = result.translations.find(
        (t) => t.key === "common.title" && t.language === "en",
      );
      expect(enTitle?.value).toBe("Hello");

      const deSubtitle = result.translations.find(
        (t) => t.key === "common.subtitle" && t.language === "de",
      );
      expect(deSubtitle?.value).toBe("Welt");
    });

    it("should not set nested for flat multi language file", () => {
      const filePath = path.join(tmpDir, "translations.json");
      fs.writeFileSync(
        filePath,
        JSON.stringify({
          greeting: { en: "Hello", de: "Hallo" },
        }),
      );

      const reader = new JsonFileReader(config);
      const result = reader.readMultiLanguageFile(filePath);

      expect(result.nested).toBeUndefined();
    });
  });
});
