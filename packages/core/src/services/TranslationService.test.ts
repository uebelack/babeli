import { TranslationService } from "./TranslationService";
import { ChatModelFactory } from "../ai/ChatModelFactory";
import type { BaseChatModel } from "@langchain/core/language_models/chat_models";
import type { ChatModelProvider } from "../ai/ChatModelProvider";
import type { Configuration } from "../Configuration";
import type { Translation } from "../model/Translation";
import { Translations } from "../model/Translations";
import { AIMessage } from "@langchain/core/messages";

function createMockChatModel(response: string | (() => string)): BaseChatModel {
  return {
    invoke: async () =>
      new AIMessage(typeof response === "function" ? response() : response),
  } as unknown as BaseChatModel;
}

describe("TranslationService", () => {
  let configuration: Configuration;
  let translations: Translations;
  let service: TranslationService;

  beforeEach(() => {
    ChatModelFactory.reset();
    configuration = { modelProvider: "test" };

    const translationData: Translation[] = [
      { language: "en", key: "greeting", value: "Hello" },
      { language: "de", key: "greeting", value: "Hallo" },
      { language: "en", key: "farewell", value: "Goodbye" },
      { language: "de", key: "farewell", value: "Auf Wiedersehen" },
      { language: "en", key: "thanks", value: "Thank you" },
      { language: "de", key: "thanks", value: "Danke" },
    ];
    translations = Translations.fromTranslations(translationData);

    service = new TranslationService(configuration, translations);
  });

  it("should return existing translation without calling AI", async () => {
    const mockModel = createMockChatModel("should not be called");
    const invokeSpy = jest.spyOn(mockModel, "invoke");
    const provider: ChatModelProvider = { create: () => mockModel };
    ChatModelFactory.registerProvider("test", provider);

    const result = await service.translate("Hello", "en", "de");

    expect(result).toBe("Hallo");
    expect(invokeSpy).not.toHaveBeenCalled();
  });

  it("should call AI for unknown translations", async () => {
    const mockModel = createMockChatModel("Guten Morgen");
    const provider: ChatModelProvider = { create: () => mockModel };
    ChatModelFactory.registerProvider("test", provider);

    const result = await service.translate("Good morning", "en", "de");

    expect(result).toBe("Guten Morgen");
  });

  it("should include similar translations in the prompt", async () => {
    let capturedMessages: unknown[] = [];
    const mockModel = {
      invoke: async (messages: unknown[]) => {
        capturedMessages = messages;
        return new AIMessage("Guten Tag");
      },
    } as unknown as BaseChatModel;
    const provider: ChatModelProvider = { create: () => mockModel };
    ChatModelFactory.registerProvider("test", provider);

    await service.translate("Good day", "en", "de");

    const systemMsg = capturedMessages[0] as { content: string };
    expect(systemMsg.content).toContain("reference");
    expect(systemMsg.content).toContain("->");
  });

  it("should include source and target language in the prompt", async () => {
    let capturedMessages: unknown[] = [];
    const mockModel = {
      invoke: async (messages: unknown[]) => {
        capturedMessages = messages;
        return new AIMessage("Bonjour");
      },
    } as unknown as BaseChatModel;
    const provider: ChatModelProvider = { create: () => mockModel };
    ChatModelFactory.registerProvider("test", provider);

    const emptyService = new TranslationService(
      configuration,
      Translations.fromTranslations([]),
    );

    await emptyService.translate("Hello", "en", "fr");

    const systemMsg = capturedMessages[0] as { content: string };
    expect(systemMsg.content).toContain("en");
    expect(systemMsg.content).toContain("fr");
  });

  it("should pass the value as user message to the chat model", async () => {
    let capturedMessages: unknown[] = [];
    const mockModel = {
      invoke: async (messages: unknown[]) => {
        capturedMessages = messages;
        return new AIMessage("Hola");
      },
    } as unknown as BaseChatModel;
    const provider: ChatModelProvider = { create: () => mockModel };
    ChatModelFactory.registerProvider("test", provider);

    const emptyService = new TranslationService(
      configuration,
      Translations.fromTranslations([]),
    );

    await emptyService.translate("Hello", "en", "es");

    const humanMsg = capturedMessages[1] as { content: string };
    expect(humanMsg.content).toBe("Hello");
  });

  it("should not include similar translations section when no translations exist", async () => {
    let capturedMessages: unknown[] = [];
    const mockModel = {
      invoke: async (messages: unknown[]) => {
        capturedMessages = messages;
        return new AIMessage("Bonjour");
      },
    } as unknown as BaseChatModel;
    const provider: ChatModelProvider = { create: () => mockModel };
    ChatModelFactory.registerProvider("test", provider);

    const emptyService = new TranslationService(
      configuration,
      Translations.fromTranslations([]),
    );

    await emptyService.translate("Hello", "en", "fr");

    const systemMsg = capturedMessages[0] as { content: string };
    expect(systemMsg.content).not.toContain("reference");
    expect(systemMsg.content).not.toContain("->");
  });

  it("should exclude similar translations with no target translation", async () => {
    let capturedMessages: unknown[] = [];
    const mockModel = {
      invoke: async (messages: unknown[]) => {
        capturedMessages = messages;
        return new AIMessage("Merci");
      },
    } as unknown as BaseChatModel;
    const provider: ChatModelProvider = { create: () => mockModel };
    ChatModelFactory.registerProvider("test", provider);

    const partialTranslations = Translations.fromTranslations([
      { language: "en", key: "hello", value: "Hello" },
      { language: "en", key: "bye", value: "Bye" },
      { language: "fr", key: "hello", value: "Bonjour" },
    ]);
    const partialService = new TranslationService(
      configuration,
      partialTranslations,
    );

    await partialService.translate("Thanks", "en", "fr");

    const systemMsg = capturedMessages[0] as { content: string };
    expect(systemMsg.content).toContain("Hello -> Bonjour");
    expect(systemMsg.content).not.toContain("Bye ->");
  });

  it("should handle non-string content blocks in response", async () => {
    const mockModel = {
      invoke: async () => ({
        content: [
          { type: "text", text: "Hallo " },
          { type: "text", text: "Welt" },
        ],
      }),
    } as unknown as BaseChatModel;
    const provider: ChatModelProvider = { create: () => mockModel };
    ChatModelFactory.registerProvider("test", provider);

    const emptyService = new TranslationService(
      configuration,
      Translations.fromTranslations([]),
    );

    const result = await emptyService.translate("Hello World", "en", "de");
    expect(result).toBe("Hallo Welt");
  });
});
