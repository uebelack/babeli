import * as fs from "fs";
import * as os from "os";
import * as path from "path";
import { StringsFileReader } from "./StringsFileReader";
import { FileReaderError } from "../errors/FileReaderError";
import type { Configuration } from "../Configuration";

describe("StringsFileReader", () => {
  let tmpDir: string;
  let config: Configuration;

  beforeEach(() => {
    tmpDir = fs.mkdtempSync(
      path.join(os.tmpdir(), "babeli-strings-reader-test-"),
    );
    config = { charset: "utf-8" };
  });

  afterEach(() => {
    fs.rmSync(tmpDir, { recursive: true });
  });

  describe("readSingleLanguageFile", () => {
    it("should read a .strings file", () => {
      const filePath = path.join(tmpDir, "Localizable.strings");
      fs.writeFileSync(
        filePath,
        '"greeting" = "Hello";\n\n"farewell" = "Goodbye";\n',
      );

      const reader = new StringsFileReader(config);
      const result = reader.readSingleLanguageFile("en", filePath);

      expect(result.language).toBe("en");
      expect(result.file).toBe(filePath);
      expect(result.translations).toHaveLength(2);
      expect(
        result.translations.find((t) => t.key === "greeting")?.value,
      ).toBe("Hello");
      expect(
        result.translations.find((t) => t.key === "farewell")?.value,
      ).toBe("Goodbye");
    });

    it("should handle escaped quotes in values", () => {
      const filePath = path.join(tmpDir, "Localizable.strings");
      fs.writeFileSync(
        filePath,
        '"msg" = "He said \\"hello\\"";\n',
      );

      const reader = new StringsFileReader(config);
      const result = reader.readSingleLanguageFile("en", filePath);

      expect(result.translations[0]?.value).toBe('He said "hello"');
    });

    it("should handle escaped backslashes", () => {
      const filePath = path.join(tmpDir, "Localizable.strings");
      fs.writeFileSync(
        filePath,
        '"path" = "C:\\\\Users\\\\test";\n',
      );

      const reader = new StringsFileReader(config);
      const result = reader.readSingleLanguageFile("en", filePath);

      expect(result.translations[0]?.value).toBe("C:\\Users\\test");
    });

    it("should handle newline escape sequences in values", () => {
      const filePath = path.join(tmpDir, "Localizable.strings");
      fs.writeFileSync(
        filePath,
        '"msg" = "line1\\nline2";\n',
      );

      const reader = new StringsFileReader(config);
      const result = reader.readSingleLanguageFile("en", filePath);

      expect(result.translations[0]?.value).toBe("line1\\nline2");
    });

    it("should handle dotted keys", () => {
      const filePath = path.join(tmpDir, "Localizable.strings");
      fs.writeFileSync(
        filePath,
        '"alerts.delete.title" = "Delete";\n\n"alerts.delete.message" = "Are you sure?";\n',
      );

      const reader = new StringsFileReader(config);
      const result = reader.readSingleLanguageFile("en", filePath);

      expect(result.translations).toHaveLength(2);
      expect(
        result.translations.find((t) => t.key === "alerts.delete.title")?.value,
      ).toBe("Delete");
    });

    it("should handle format specifiers like %@", () => {
      const filePath = path.join(tmpDir, "Localizable.strings");
      fs.writeFileSync(
        filePath,
        '"plan" = "%@ - Monthly";\n',
      );

      const reader = new StringsFileReader(config);
      const result = reader.readSingleLanguageFile("en", filePath);

      expect(result.translations[0]?.value).toBe("%@ - Monthly");
    });

    it("should skip comment lines and blank lines", () => {
      const filePath = path.join(tmpDir, "Localizable.strings");
      fs.writeFileSync(
        filePath,
        '/* Comment */\n\n"key" = "value";\n\n// Another comment\n',
      );

      const reader = new StringsFileReader(config);
      const result = reader.readSingleLanguageFile("en", filePath);

      expect(result.translations).toHaveLength(1);
      expect(result.translations[0]?.key).toBe("key");
    });

    it("should throw FileReaderError for non-existent file", () => {
      const reader = new StringsFileReader(config);
      expect(() =>
        reader.readSingleLanguageFile("en", "/nonexistent/Localizable.strings"),
      ).toThrow(FileReaderError);
    });

    it("should use default charset when not configured", () => {
      const filePath = path.join(tmpDir, "Localizable.strings");
      fs.writeFileSync(filePath, '"hello" = "Hello";\n');

      const reader = new StringsFileReader({});
      const result = reader.readSingleLanguageFile("en", filePath);
      expect(result.translations).toHaveLength(1);
    });
  });

  describe("readMultiLanguageFile", () => {
    it("should throw FileReaderError since .strings does not support multi-language", () => {
      const reader = new StringsFileReader(config);
      expect(() =>
        reader.readMultiLanguageFile("/some/Localizable.strings"),
      ).toThrow(FileReaderError);
    });
  });
});
