import * as fs from "fs";
import * as os from "os";
import * as path from "path";
import { YamlFileReader } from "./YamlFileReader";
import { FileReaderError } from "../errors/FileReaderError";
import type { Configuration } from "../Configuration";

describe("YamlFileReader", () => {
  let tmpDir: string;
  let config: Configuration;

  beforeEach(() => {
    tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), "babeli-yaml-reader-test-"));
    config = { charset: "utf-8" };
  });

  afterEach(() => {
    fs.rmSync(tmpDir, { recursive: true });
  });

  describe("readSingleLanguageFile", () => {
    it("should read a flat single language YAML file", () => {
      const filePath = path.join(tmpDir, "en.yaml");
      fs.writeFileSync(filePath, "greeting: Hello\nfarewell: Goodbye\n");

      const reader = new YamlFileReader(config);
      const result = reader.readSingleLanguageFile("en", filePath);

      expect(result.language).toBe("en");
      expect(result.file).toBe(filePath);
      expect(result.nested).toBe(false);
      expect(result.translations).toHaveLength(2);
      expect(
        result.translations.find((t) => t.key === "greeting")?.value,
      ).toBe("Hello");
      expect(
        result.translations.find((t) => t.key === "farewell")?.value,
      ).toBe("Goodbye");
    });

    it("should read a nested single language YAML file", () => {
      const filePath = path.join(tmpDir, "en.yaml");
      fs.writeFileSync(
        filePath,
        [
          "button:",
          "  yes: \"Yes\"",
          "  no: \"No\"",
          "  perhaps: Perhaps",
          "error:",
          "  message:",
          "    notfound: The requested resource was not found.",
          "",
        ].join("\n"),
      );

      const reader = new YamlFileReader(config);
      const result = reader.readSingleLanguageFile("en", filePath);

      expect(result.nested).toBe(true);
      expect(result.translations).toHaveLength(4);
      expect(
        result.translations.find((t) => t.key === "button.yes")?.value,
      ).toBe("Yes");
      expect(
        result.translations.find((t) => t.key === "button.no")?.value,
      ).toBe("No");
      expect(
        result.translations.find((t) => t.key === "button.perhaps")?.value,
      ).toBe("Perhaps");
      expect(
        result.translations.find((t) => t.key === "error.message.notfound")
          ?.value,
      ).toBe("The requested resource was not found.");
    });

    it("should throw FileReaderError for non-existent file", () => {
      const reader = new YamlFileReader(config);
      expect(() =>
        reader.readSingleLanguageFile("en", "/nonexistent/file.yaml"),
      ).toThrow(FileReaderError);
    });

    it("should use default charset when not configured", () => {
      const filePath = path.join(tmpDir, "en.yaml");
      fs.writeFileSync(filePath, "hello: Hello\n");

      const reader = new YamlFileReader({});
      const result = reader.readSingleLanguageFile("en", filePath);
      expect(result.translations).toHaveLength(1);
    });

    it("should handle deeply nested YAML", () => {
      const filePath = path.join(tmpDir, "en.yaml");
      fs.writeFileSync(
        filePath,
        ["a:", "  b:", "    c: deep"].join("\n"),
      );

      const reader = new YamlFileReader(config);
      const result = reader.readSingleLanguageFile("en", filePath);

      expect(result.nested).toBe(true);
      expect(
        result.translations.find((t) => t.key === "a.b.c")?.value,
      ).toBe("deep");
    });
  });

  describe("readMultiLanguageFile", () => {
    it("should read a nested multi-language YAML file", () => {
      const filePath = path.join(tmpDir, "translations.yaml");
      fs.writeFileSync(
        filePath,
        [
          "en:",
          "  button:",
          "    yes: \"Yes\"",
          "    no: \"No\"",
          "de:",
          "  button:",
          "    yes: Ja",
          "    no: Nein",
          "",
        ].join("\n"),
      );

      const reader = new YamlFileReader(config);
      const result = reader.readMultiLanguageFile(filePath);

      expect(result.file).toBe(filePath);
      expect(result.nested).toBe(true);
      expect(result.translations).toHaveLength(4);

      const enYes = result.translations.find(
        (t) => t.key === "button.yes" && t.language === "en",
      );
      expect(enYes?.value).toBe("Yes");

      const deNo = result.translations.find(
        (t) => t.key === "button.no" && t.language === "de",
      );
      expect(deNo?.value).toBe("Nein");
    });

    it("should read a flat multi-language YAML file", () => {
      const filePath = path.join(tmpDir, "translations.yaml");
      fs.writeFileSync(
        filePath,
        [
          "en:",
          "  greeting: Hello",
          "  farewell: Goodbye",
          "de:",
          "  greeting: Hallo",
          "  farewell: Auf Wiedersehen",
          "",
        ].join("\n"),
      );

      const reader = new YamlFileReader(config);
      const result = reader.readMultiLanguageFile(filePath);

      expect(result.nested).toBe(false);
      expect(result.translations).toHaveLength(4);

      const enGreeting = result.translations.find(
        (t) => t.key === "greeting" && t.language === "en",
      );
      expect(enGreeting?.value).toBe("Hello");
    });

    it("should throw FileReaderError for non-existent file", () => {
      const reader = new YamlFileReader(config);
      expect(() =>
        reader.readMultiLanguageFile("/nonexistent/file.yaml"),
      ).toThrow(FileReaderError);
    });

    it("should use default charset when not configured", () => {
      const filePath = path.join(tmpDir, "translations.yaml");
      fs.writeFileSync(
        filePath,
        ["en:", "  hello: Hello", ""].join("\n"),
      );

      const reader = new YamlFileReader({});
      const result = reader.readMultiLanguageFile(filePath);
      expect(result.translations).toHaveLength(1);
    });
  });
});
