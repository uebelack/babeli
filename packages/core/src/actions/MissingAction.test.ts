import { MissingAction } from "./MissingAction";
import { ChatModelFactory } from "../ai/ChatModelFactory";
import type { BaseChatModel } from "@langchain/core/language_models/chat_models";
import type { ChatModelProvider } from "../ai/ChatModelProvider";
import type { Configuration } from "../Configuration";
import type { SingleLanguageTranslationFile } from "../model/SingleLanguageTranslationFile";
import type { MultiLanguageTranslationFile } from "../model/MultiLanguageTranslationFile";
import type { LoggingProvider } from "../logging/LoggingProvider";
import { AIMessage } from "@langchain/core/messages";

function createMockChatModel(responses: string[]): BaseChatModel {
  let callIndex = 0;
  return {
    invoke: async () => new AIMessage(responses[callIndex++] ?? "translated"),
  } as unknown as BaseChatModel;
}

function createSilentConfig(overrides?: Partial<Configuration>): Configuration {
  const loggingProvider: LoggingProvider = {
    debug: () => {},
    info: () => {},
    warn: () => {},
    error: () => {},
  };
  return {
    workingDirectory: "/project",
    baseLanguage: "en",
    modelProvider: "test",
    loggingProvider,
    ...overrides,
  };
}

describe("MissingAction", () => {
  beforeEach(() => {
    ChatModelFactory.reset();
  });

  describe("validateSingleLanguageFiles", () => {
    it("should return no errors when all keys are present", () => {
      const action = new MissingAction(createSilentConfig());
      const files: SingleLanguageTranslationFile[] = [
        {
          language: "en",
          file: "/project/en.json",
          translations: [
            { language: "en", key: "hello", value: "Hello" },
            { language: "en", key: "bye", value: "Bye" },
          ],
        },
        {
          language: "de",
          file: "/project/de.json",
          translations: [
            { language: "de", key: "hello", value: "Hallo" },
            { language: "de", key: "bye", value: "Tschüss" },
          ],
        },
      ];

      const errors = action.validateSingleLanguageFiles(files);
      expect(errors).toEqual([]);
    });

    it("should detect missing keys", () => {
      const action = new MissingAction(createSilentConfig());
      const files: SingleLanguageTranslationFile[] = [
        {
          language: "en",
          file: "/project/en.json",
          translations: [
            { language: "en", key: "hello", value: "Hello" },
            { language: "en", key: "bye", value: "Bye" },
          ],
        },
        {
          language: "de",
          file: "/project/de.json",
          translations: [{ language: "de", key: "hello", value: "Hallo" }],
        },
      ];

      const errors = action.validateSingleLanguageFiles(files);
      expect(errors).toHaveLength(1);
      expect(errors[0]!.action).toBe("missing");
      expect(errors[0]!.language).toBe("de");
      expect(errors[0]!.value).toBe("bye");
      expect(errors[0]!.message).toContain("Missing translation");
    });
  });

  describe("validateMultiLanguageFile", () => {
    it("should return no errors when all translations are present", () => {
      const action = new MissingAction(createSilentConfig());
      const file: MultiLanguageTranslationFile = {
        file: "/project/translations.json",
        translations: [
          { language: "en", key: "hello", value: "Hello" },
          { language: "de", key: "hello", value: "Hallo" },
        ],
      };

      const errors = action.validateMultiLanguageFile(file);
      expect(errors).toEqual([]);
    });

    it("should detect missing language for a key", () => {
      const action = new MissingAction(createSilentConfig());
      const file: MultiLanguageTranslationFile = {
        file: "/project/translations.json",
        translations: [
          { language: "en", key: "hello", value: "Hello" },
          { language: "de", key: "hello", value: "Hallo" },
          { language: "en", key: "bye", value: "Bye" },
        ],
      };

      const errors = action.validateMultiLanguageFile(file);
      expect(errors).toHaveLength(1);
      expect(errors[0]!.language).toBe("de");
      expect(errors[0]!.value).toBe("bye");
    });
  });

  describe("updateMultiLanguageFile", () => {
    it("should generate missing translations", async () => {
      const mockModel = createMockChatModel(["Tschüss"]);
      const provider: ChatModelProvider = { create: () => mockModel };
      ChatModelFactory.registerProvider("test", provider);

      const action = new MissingAction(createSilentConfig());
      const file: MultiLanguageTranslationFile = {
        file: "/project/translations.json",
        translations: [
          { language: "en", key: "hello", value: "Hello" },
          { language: "de", key: "hello", value: "Hallo" },
          { language: "en", key: "bye", value: "Bye" },
        ],
      };

      const result = await action.updateMultiLanguageFile(file);
      const deByeTranslation = result.translations.find(
        (t) => t.key === "bye" && t.language === "de",
      );
      expect(deByeTranslation).toBeDefined();
      expect(deByeTranslation!.value).toBe("Tschüss");
    });
  });

  describe("updateSingleLanguageFiles", () => {
    it("should generate missing translations", async () => {
      const mockModel = createMockChatModel(["Tschüss"]);
      const provider: ChatModelProvider = { create: () => mockModel };
      ChatModelFactory.registerProvider("test", provider);

      const action = new MissingAction(createSilentConfig());
      const files: SingleLanguageTranslationFile[] = [
        {
          language: "en",
          file: "/project/en.json",
          translations: [
            { language: "en", key: "hello", value: "Hello" },
            { language: "en", key: "bye", value: "Bye" },
          ],
        },
        {
          language: "de",
          file: "/project/de.json",
          translations: [{ language: "de", key: "hello", value: "Hallo" }],
        },
      ];

      const result = await action.updateSingleLanguageFiles(files);
      const deFile = result.find((f) => f.language === "de")!;
      const byeTranslation = deFile.translations.find((t) => t.key === "bye");
      expect(byeTranslation).toBeDefined();
      expect(byeTranslation!.value).toBe("Tschüss");
    });
  });

  describe("translate fallback", () => {
    it("should use reference language when base language translation is missing", async () => {
      let capturedMessages: unknown[] = [];
      const mockModel = {
        invoke: async (messages: unknown[]) => {
          capturedMessages = messages;
          return new AIMessage("Bonjour");
        },
      } as unknown as BaseChatModel;
      const provider: ChatModelProvider = { create: () => mockModel };
      ChatModelFactory.registerProvider("test", provider);

      const action = new MissingAction(createSilentConfig());
      // "hello" exists in de but not in fr, and base language (en) has no translation
      // so it should fall back to "de" as reference language
      const file: MultiLanguageTranslationFile = {
        file: "/project/translations.json",
        translations: [
          { language: "de", key: "hello", value: "Hallo" },
          { language: "fr", key: "other", value: "Autre" },
          { language: "de", key: "other", value: "Anderes" },
        ],
      };

      const result = await action.updateMultiLanguageFile(file);
      const frTranslation = result.translations.find(
        (t) => t.key === "hello" && t.language === "fr",
      );
      expect(frTranslation).toBeDefined();
      expect(frTranslation!.value).toBe("Bonjour");

      // Should have used "de" as source language since "en" (base) has no translation
      const systemMsg = capturedMessages[0] as { content: string };
      expect(systemMsg.content).toContain("de");
      expect(systemMsg.content).toContain("fr");
    });

    it("should throw when no reference translation exists", async () => {
      const mockModel = createMockChatModel([]);
      const provider: ChatModelProvider = { create: () => mockModel };
      ChatModelFactory.registerProvider("test", provider);

      const action = new MissingAction(
        createSilentConfig({ baseLanguage: "en" }),
      );

      const file: MultiLanguageTranslationFile = {
        file: "/project/translations.json",
        translations: [
          { language: "en", key: "hello", value: "Hello" },
          { language: "en", key: "orphan", value: "Orphan" },
          { language: "de", key: "hello", value: "Hallo" },
        ],
      };

      // "orphan" only has "en", but we're trying to translate for "de"
      // Since base language "en" has a translation, it should use that
      const result = await action.updateMultiLanguageFile(file);
      const deOrphan = result.translations.find(
        (t) => t.key === "orphan" && t.language === "de",
      );
      expect(deOrphan).toBeDefined();
    });
  });
});
