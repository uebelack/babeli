import * as fs from "fs";
import * as os from "os";
import * as path from "path";
import { TsFileReader } from "./TsFileReader";
import { FileReaderError } from "../errors/FileReaderError";

describe("TsFileReader", () => {
  let tmpDir: string;

  beforeEach(() => {
    tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), "babeli-ts-reader-test-"));
  });

  afterEach(() => {
    fs.rmSync(tmpDir, { recursive: true });
  });

  describe("readSingleLanguageFile", () => {
    it("should read a flat single language TS file", async () => {
      const filePath = path.join(tmpDir, "en.ts");
      fs.writeFileSync(
        filePath,
        'export default { greeting: "Hello", farewell: "Goodbye" } as const;\n',
      );

      const reader = new TsFileReader();
      const result = await reader.readSingleLanguageFile("en", filePath);

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

    it("should read a nested single language TS file", async () => {
      const filePath = path.join(tmpDir, "en.ts");
      fs.writeFileSync(
        filePath,
        `export default {
    button: {
        yes: "Yes",
        no: "No",
    },
    error: {
        message: {
            notfound: "Not found",
        },
    },
} as const;\n`,
      );

      const reader = new TsFileReader();
      const result = await reader.readSingleLanguageFile("en", filePath);

      expect(result.nested).toBe(true);
      expect(result.translations).toHaveLength(3);
      expect(
        result.translations.find((t) => t.key === "button.yes")?.value,
      ).toBe("Yes");
      expect(
        result.translations.find((t) => t.key === "error.message.notfound")
          ?.value,
      ).toBe("Not found");
    });

    it("should throw FileReaderError for non-existent file", async () => {
      const reader = new TsFileReader();
      await expect(
        reader.readSingleLanguageFile("en", "/nonexistent/file.ts"),
      ).rejects.toThrow(FileReaderError);
    });

    it("should set nested to false for flat file", async () => {
      const filePath = path.join(tmpDir, "en.ts");
      fs.writeFileSync(
        filePath,
        'export default { hello: "Hello" } as const;\n',
      );

      const reader = new TsFileReader();
      const result = await reader.readSingleLanguageFile("en", filePath);

      expect(result.nested).toBe(false);
    });
  });

  describe("readMultiLanguageFile", () => {
    it("should read a nested multi-language TS file", async () => {
      const filePath = path.join(tmpDir, "translations.ts");
      fs.writeFileSync(
        filePath,
        `export default {
    en: {
        button: { yes: "Yes", no: "No" },
    },
    de: {
        button: { yes: "Ja", no: "Nein" },
    },
} as const;\n`,
      );

      const reader = new TsFileReader();
      const result = await reader.readMultiLanguageFile(filePath);

      expect(result.file).toBe(filePath);
      expect(result.nested).toBe(true);
      expect(result.translations).toHaveLength(4);

      const enYes = result.translations.find(
        (t) => t.key === "button.yes" && t.language === "en",
      );
      expect(enYes?.value).toBe("Yes");
    });

    it("should read a flat multi-language TS file", async () => {
      const filePath = path.join(tmpDir, "translations.ts");
      fs.writeFileSync(
        filePath,
        `export default {
    en: { greeting: "Hello" },
    de: { greeting: "Hallo" },
} as const;\n`,
      );

      const reader = new TsFileReader();
      const result = await reader.readMultiLanguageFile(filePath);

      expect(result.nested).toBe(false);
      expect(result.translations).toHaveLength(2);
    });

    it("should throw FileReaderError for non-existent file", async () => {
      const reader = new TsFileReader();
      await expect(
        reader.readMultiLanguageFile("/nonexistent/file.ts"),
      ).rejects.toThrow(FileReaderError);
    });
  });
});
