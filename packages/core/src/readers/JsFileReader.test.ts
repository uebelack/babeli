import * as fs from "fs";
import * as os from "os";
import * as path from "path";
import { JsFileReader } from "./JsFileReader";
import { FileReaderError } from "../errors/FileReaderError";

describe("JsFileReader", () => {
  let tmpDir: string;

  beforeEach(() => {
    tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), "babeli-js-reader-test-"));
  });

  afterEach(() => {
    fs.rmSync(tmpDir, { recursive: true });
  });

  describe("readSingleLanguageFile", () => {
    it("should read a flat single language JS file", async () => {
      const filePath = path.join(tmpDir, "en.mjs");
      fs.writeFileSync(
        filePath,
        'export default { greeting: "Hello", farewell: "Goodbye" };\n',
      );

      const reader = new JsFileReader();
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

    it("should read a nested single language JS file", async () => {
      const filePath = path.join(tmpDir, "en.mjs");
      fs.writeFileSync(
        filePath,
        `export default {
    button: {
        yes: "Yes",
        no: "No",
        perhaps: "Perhaps",
    },
    error: {
        message: {
            notfound: "The requested resource was not found.",
        },
    },
};\n`,
      );

      const reader = new JsFileReader();
      const result = await reader.readSingleLanguageFile("en", filePath);

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

    it("should throw FileReaderError for non-existent file", async () => {
      const reader = new JsFileReader();
      await expect(
        reader.readSingleLanguageFile("en", "/nonexistent/file.mjs"),
      ).rejects.toThrow(FileReaderError);
    });

    it("should set nested to false for flat file", async () => {
      const filePath = path.join(tmpDir, "en.mjs");
      fs.writeFileSync(
        filePath,
        'export default { hello: "Hello", bye: "Bye" };\n',
      );

      const reader = new JsFileReader();
      const result = await reader.readSingleLanguageFile("en", filePath);

      expect(result.nested).toBe(false);
    });
  });

  describe("readMultiLanguageFile", () => {
    it("should read a multi-language JS file", async () => {
      const filePath = path.join(tmpDir, "translations.mjs");
      fs.writeFileSync(
        filePath,
        `export default {
    en: {
        button: {
            yes: "Yes",
            no: "No",
        },
    },
    de: {
        button: {
            yes: "Ja",
            no: "Nein",
        },
    },
};\n`,
      );

      const reader = new JsFileReader();
      const result = await reader.readMultiLanguageFile(filePath);

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

    it("should read a flat multi-language JS file", async () => {
      const filePath = path.join(tmpDir, "translations.mjs");
      fs.writeFileSync(
        filePath,
        `export default {
    en: { greeting: "Hello", farewell: "Goodbye" },
    de: { greeting: "Hallo", farewell: "Auf Wiedersehen" },
};\n`,
      );

      const reader = new JsFileReader();
      const result = await reader.readMultiLanguageFile(filePath);

      expect(result.nested).toBe(false);
      expect(result.translations).toHaveLength(4);

      const enGreeting = result.translations.find(
        (t) => t.key === "greeting" && t.language === "en",
      );
      expect(enGreeting?.value).toBe("Hello");
    });

    it("should throw FileReaderError for non-existent file", async () => {
      const reader = new JsFileReader();
      await expect(
        reader.readMultiLanguageFile("/nonexistent/file.mjs"),
      ).rejects.toThrow(FileReaderError);
    });
  });
});
