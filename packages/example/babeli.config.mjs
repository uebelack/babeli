export default [
  // Single-language JSON files
  {
    files: [
      { language: "en", file: "translations/en.json" },
      { language: "de", file: "translations/de.json" },
      { language: "fr", file: "translations/fr.json" },
    ],
    baseLanguage: "en",
    modelProvider: "anthropic",
  },

  // Multi-language JSON file
  {
    file: "translations/multi.json",
    baseLanguage: "en",
    modelProvider: "anthropic",
  },

  // Single-language MJS files
  {
    files: [
      { language: "en", file: "translations/en.mjs" },
      { language: "de", file: "translations/de.mjs" },
    ],
    baseLanguage: "en",
    modelProvider: "anthropic",
  },

  // Multi-language MJS file
  {
    file: "translations/multi.mjs",
    baseLanguage: "en",
    modelProvider: "anthropic",
  },

  // Single-language TypeScript files
  {
    files: [
      { language: "en", file: "translations/en.ts" },
      { language: "de", file: "translations/de.ts" },
    ],
    baseLanguage: "en",
    modelProvider: "anthropic",
  },

  // Multi-language TypeScript file
  {
    file: "translations/multi.ts",
    baseLanguage: "en",
    modelProvider: "anthropic",
  },
];
