import * as fs from "fs";
import * as os from "os";
import * as path from "path";
import { StringsFileWriter } from "./StringsFileWriter";
import { FileWriterError } from "../errors/FileWriterError";
import type { Configuration } from "../Configuration";
import type { SingleLanguageTranslationFile } from "../model/SingleLanguageTranslationFile";

describe("StringsFileWriter", () => {
  let tmpDir: string;
  let config: Configuration;

  beforeEach(() => {
    tmpDir = fs.mkdtempSync(
      path.join(os.tmpdir(), "babeli-strings-writer-test-"),
    );
    config = { charset: "utf-8" };
  });

  afterEach(() => {
    fs.rmSync(tmpDir, { recursive: true });
  });

  describe("writeSingleLanguageFile", () => {
    it("should write a .strings file", () => {
      const filePath = path.join(tmpDir, "Localizable.strings");
      const file: SingleLanguageTranslationFile = {
        language: "en",
        file: filePath,
        translations: [
          { language: "en", key: "greeting", value: "Hello" },
          { language: "en", key: "farewell", value: "Goodbye" },
        ],
      };

      const writer = new StringsFileWriter(config);
      writer.writeSingleLanguageFile(file);

      const content = fs.readFileSync(filePath, "utf-8");
      expect(content).toBe(
        '"greeting" = "Hello";\n\n"farewell" = "Goodbye";\n',
      );
    });

    it("should escape quotes in keys and values", () => {
      const filePath = path.join(tmpDir, "Localizable.strings");
      const file: SingleLanguageTranslationFile = {
        language: "en",
        file: filePath,
        translations: [
          { language: "en", key: "msg", value: 'He said "hello"' },
        ],
      };

      const writer = new StringsFileWriter(config);
      writer.writeSingleLanguageFile(file);

      const content = fs.readFileSync(filePath, "utf-8");
      expect(content).toBe('"msg" = "He said \\"hello\\"";\n');
    });

    it("should preserve escape sequences like \\n", () => {
      const filePath = path.join(tmpDir, "Localizable.strings");
      const file: SingleLanguageTranslationFile = {
        language: "en",
        file: filePath,
        translations: [
          {
            language: "en",
            key: "msg",
            value: "privacy policy.\\n\\nDo you agree?",
          },
        ],
      };

      const writer = new StringsFileWriter(config);
      writer.writeSingleLanguageFile(file);

      const content = fs.readFileSync(filePath, "utf-8");
      expect(content).toBe('"msg" = "privacy policy.\\n\\nDo you agree?";\n');
    });

    it("should create parent directories including .lproj", () => {
      const filePath = path.join(
        tmpDir,
        "Resources",
        "en.lproj",
        "Localizable.strings",
      );
      const file: SingleLanguageTranslationFile = {
        language: "en",
        file: filePath,
        translations: [{ language: "en", key: "hello", value: "Hello" }],
      };

      const writer = new StringsFileWriter(config);
      writer.writeSingleLanguageFile(file);

      expect(fs.existsSync(filePath)).toBe(true);
    });

    it("should use default charset when not configured", () => {
      const filePath = path.join(tmpDir, "Localizable.strings");
      const file: SingleLanguageTranslationFile = {
        language: "en",
        file: filePath,
        translations: [{ language: "en", key: "hello", value: "Hello" }],
      };

      const writer = new StringsFileWriter({});
      writer.writeSingleLanguageFile(file);

      const content = fs.readFileSync(filePath, "utf-8");
      expect(content).toContain('"hello" = "Hello"');
    });

    it("should throw FileWriterError on write failure", () => {
      const file: SingleLanguageTranslationFile = {
        language: "en",
        file: "/nonexistent/readonly/Localizable.strings",
        translations: [{ language: "en", key: "hello", value: "Hello" }],
      };

      const writer = new StringsFileWriter(config);
      expect(() => writer.writeSingleLanguageFile(file)).toThrow(
        FileWriterError,
      );
    });
  });

  describe("writeMultiLanguageFile", () => {
    it("should throw FileWriterError since .strings does not support multi-language", () => {
      const writer = new StringsFileWriter(config);
      expect(() =>
        writer.writeMultiLanguageFile({
          file: "/some/Localizable.strings",
          translations: [{ language: "en", key: "hello", value: "Hello" }],
        }),
      ).toThrow(FileWriterError);
    });
  });
});
