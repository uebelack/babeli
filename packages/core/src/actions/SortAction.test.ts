import { SortAction } from "./SortAction";
import type { SingleLanguageTranslationFile } from "../model/SingleLanguageTranslationFile";
import type { MultiLanguageTranslationFile } from "../model/MultiLanguageTranslationFile";
import type { Configuration } from "../Configuration";

describe("SortAction", () => {
  let action: SortAction;
  const config: Configuration = { workingDirectory: "/project" };

  beforeEach(() => {
    action = new SortAction(config);
  });

  describe("validateSingleLanguageFiles", () => {
    it("should return no errors when translations are sorted", () => {
      const files: SingleLanguageTranslationFile[] = [
        {
          language: "en",
          file: "/project/en.json",
          translations: [
            { language: "en", key: "a", value: "A" },
            { language: "en", key: "b", value: "B" },
            { language: "en", key: "c", value: "C" },
          ],
        },
      ];

      const errors = action.validateSingleLanguageFiles(files);
      expect(errors).toEqual([]);
    });

    it("should return error when translations are not sorted", () => {
      const files: SingleLanguageTranslationFile[] = [
        {
          language: "en",
          file: "/project/en.json",
          translations: [
            { language: "en", key: "c", value: "C" },
            { language: "en", key: "a", value: "A" },
            { language: "en", key: "b", value: "B" },
          ],
        },
      ];

      const errors = action.validateSingleLanguageFiles(files);
      expect(errors).toHaveLength(1);
      expect(errors[0]!.action).toBe("sort");
      expect(errors[0]!.message).toContain("not sorted");
    });
  });

  describe("updateSingleLanguageFiles", () => {
    it("should sort translations by key", async () => {
      const files: SingleLanguageTranslationFile[] = [
        {
          language: "en",
          file: "/project/en.json",
          translations: [
            { language: "en", key: "c", value: "C" },
            { language: "en", key: "a", value: "A" },
            { language: "en", key: "b", value: "B" },
          ],
        },
      ];

      const result = await action.updateSingleLanguageFiles(files);
      expect(result[0]!.translations.map((t) => t.key)).toEqual([
        "a",
        "b",
        "c",
      ]);
    });
  });

  describe("validateMultiLanguageFile", () => {
    it("should return no errors when translations are sorted", () => {
      const file: MultiLanguageTranslationFile = {
        file: "/project/translations.json",
        translations: [
          { language: "en", key: "a", value: "A" },
          { language: "en", key: "b", value: "B" },
        ],
      };

      const errors = action.validateMultiLanguageFile(file);
      expect(errors).toEqual([]);
    });

    it("should return error when translations are not sorted", () => {
      const file: MultiLanguageTranslationFile = {
        file: "/project/translations.json",
        translations: [
          { language: "en", key: "b", value: "B" },
          { language: "en", key: "a", value: "A" },
        ],
      };

      const errors = action.validateMultiLanguageFile(file);
      expect(errors).toHaveLength(1);
      expect(errors[0]!.action).toBe("sort");
      expect(errors[0]!.language).toBe("");
      expect(errors[0]!.message).toContain("not sorted");
    });
  });

  describe("updateMultiLanguageFile", () => {
    it("should sort translations by key", async () => {
      const file: MultiLanguageTranslationFile = {
        file: "/project/translations.json",
        translations: [
          { language: "en", key: "c", value: "C" },
          { language: "de", key: "a", value: "A-de" },
          { language: "en", key: "a", value: "A" },
        ],
      };

      const result = await action.updateMultiLanguageFile(file);
      expect(result.translations.map((t) => t.key)).toEqual(["a", "a", "c"]);
    });
  });
});
