import { singleLanguageTranslationFileFromMap } from "./SingleLanguageTranslationFile";

describe("singleLanguageTranslationFileFromMap", () => {
  it("should convert a map to a SingleLanguageTranslationFile", () => {
    const map = new Map([
      ["greeting", "Hello"],
      ["farewell", "Goodbye"],
    ]);

    const result = singleLanguageTranslationFileFromMap(
      "en",
      "messages.json",
      map,
    );

    expect(result.language).toBe("en");
    expect(result.file).toBe("messages.json");
    expect(result.translations).toEqual([
      { language: "en", key: "greeting", value: "Hello" },
      { language: "en", key: "farewell", value: "Goodbye" },
    ]);
  });

  it("should return empty translations for an empty map", () => {
    const result = singleLanguageTranslationFileFromMap(
      "de",
      "empty.json",
      new Map(),
    );

    expect(result.translations).toEqual([]);
  });
});
