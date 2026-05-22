import type { Translation } from "./Translation";
import { Translations } from "./Translations";

function createTestTranslations(): Translations {
  const translations: Translation[] = [
    { language: "de", key: "common.button.perhaps", value: "Vielleicht" },
    { language: "fr", key: "common.button.perhaps", value: "Peut-être" },
    {
      language: "de",
      key: "error.message.notfound",
      value: "Die angeforderte Ressource wurde nicht gefunden.",
    },
    {
      language: "en",
      key: "error.message.notfound",
      value: "The requested resource was not found.",
    },
    {
      language: "fr",
      key: "error.message.notfound",
      value: "La ressource demandée n'a pas été trouvée.",
    },
    { language: "de", key: "common.button.yes", value: "Ja" },
    { language: "en", key: "common.button.yes", value: "Yes" },
    { language: "fr", key: "common.button.yes", value: "Oui" },
    { language: "en", key: "common.button.no", value: "No" },
    { language: "fr", key: "common.button.no", value: "Non" },
  ];
  return Translations.fromTranslations(translations);
}

describe("Translations", () => {
  let translations: Translations;

  beforeEach(() => {
    translations = createTestTranslations();
  });

  it("should return languages", () => {
    expect(translations.getLanguages()).toEqual(["de", "en", "fr"]);
  });

  it("should return translation map", () => {
    expect(translations.getKeyLanguageMap()).not.toBeNull();
    expect(
      translations.getTranslationsMapForKey("common.button.no"),
    ).toBeDefined();
    expect(translations.getTranslationsMapForKey("nothing")).toBeUndefined();
  });

  it("should return keys", () => {
    expect([...translations.getKeys()].sort()).toEqual([
      "common.button.no",
      "common.button.perhaps",
      "common.button.yes",
      "error.message.notfound",
    ]);
  });

  it("should return translation for key and language", () => {
    expect(translations.getTranslation("common.button.yes", "de")).toBe("Ja");
    expect(translations.getTranslation("common.button.yes", "en")).toBe("Yes");
    expect(translations.getTranslation("common.button.yes", "fr")).toBe("Oui");
  });

  it("should add translation", () => {
    translations.add("common.button.maybe", "de", "Vielleicht");
    translations.add("common.button.maybe", "en", "Maybe");

    const maybeDE = translations
      .getTranslations()
      .filter((t) => t.key === "common.button.maybe" && t.language === "de");

    expect(maybeDE).toHaveLength(1);
    expect(maybeDE[0]!.value).toBe("Vielleicht");
  });

  it("should return translation for value", () => {
    expect(translations.getTranslationForValue("Yes", "en", "de")).toBe("Ja");
  });

  it("should return undefined for value with unknown source language", () => {
    expect(
      translations.getTranslationForValue("Yes", "xx", "de"),
    ).toBeUndefined();
  });

  it("should return undefined for value with unknown target language", () => {
    expect(
      translations.getTranslationForValue("Yes", "en", "xx"),
    ).toBeUndefined();
  });

  it("should return undefined for value with no matching key in target", () => {
    expect(
      translations.getTranslationForValue(
        "Die angeforderte Ressource wurde nicht gefunden.",
        "de",
        "en",
      ),
    ).toBe("The requested resource was not found.");
    // "common.button.perhaps" has no "en" translation, so lookup should return undefined
    expect(
      translations.getTranslationForValue("Vielleicht", "de", "en"),
    ).toBeUndefined();
  });

  it("should create from key-language map", () => {
    const map = new Map<string, Map<string, string>>();
    map.set(
      "greeting",
      new Map([
        ["en", "Hello"],
        ["de", "Hallo"],
      ]),
    );
    map.set(
      "farewell",
      new Map([
        ["en", "Bye"],
        ["de", "Tschüss"],
      ]),
    );

    const t = Translations.fromKeyLanguageMap(map);
    expect(t.getTranslation("greeting", "en")).toBe("Hello");
    expect(t.getTranslation("greeting", "de")).toBe("Hallo");
    expect(t.getTranslation("farewell", "en")).toBe("Bye");
    expect(t.getLanguages()).toEqual(["de", "en"]);
  });

  it("should return translations map for language", () => {
    const deMap = translations.getTranslationsMapForLanguage("de");
    expect(deMap).toBeDefined();
    expect(deMap!.get("common.button.yes")).toBe("Ja");
    expect(translations.getTranslationsMapForLanguage("xx")).toBeUndefined();
  });

  it("should return translations for language", () => {
    const deTranslations = translations.getTranslationsForLanguage("de");
    expect(deTranslations.length).toBe(3);
    expect(deTranslations.every((t) => t.language === "de")).toBe(true);
    expect(translations.getTranslationsForLanguage("xx")).toEqual([]);
  });

  it("should add translation to existing key with new language", () => {
    translations.add("common.button.perhaps", "en", "Perhaps");
    expect(translations.getTranslation("common.button.perhaps", "en")).toBe(
      "Perhaps",
    );
  });
});
