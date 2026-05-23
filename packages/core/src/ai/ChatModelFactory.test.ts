import { ChatModelFactory } from "./ChatModelFactory";
import { ConfigurationError } from "../errors/ConfigurationError";
import type { BaseChatModel } from "@langchain/core/language_models/chat_models";
import type { ChatModelProvider } from "./ChatModelProvider";
import type { Configuration } from "../Configuration";

describe("ChatModelFactory", () => {
  const mockChatModel = {} as BaseChatModel;

  const mockProvider: ChatModelProvider = {
    create: () => mockChatModel,
  };

  beforeEach(() => {
    ChatModelFactory.reset();
    delete process.env.BABELI_MODEL_PROVIDER;
  });

  it("should create chat model from registered provider", () => {
    ChatModelFactory.registerProvider("test", mockProvider);
    const config: Configuration = { modelProvider: "test" };

    const result = ChatModelFactory.createChatModel(config);

    expect(result).toBe(mockChatModel);
  });

  it("should return cached chat model on subsequent calls", () => {
    ChatModelFactory.registerProvider("test", mockProvider);
    const config: Configuration = { modelProvider: "test" };

    const first = ChatModelFactory.createChatModel(config);
    const second = ChatModelFactory.createChatModel(config);

    expect(first).toBe(second);
  });

  it("should prefer BABELI_MODEL_PROVIDER env var over configuration", () => {
    const envChatModel = {} as BaseChatModel;
    const envProvider: ChatModelProvider = {
      create: () => envChatModel,
    };
    ChatModelFactory.registerProvider("env-provider", envProvider);
    ChatModelFactory.registerProvider("config-provider", mockProvider);
    process.env.BABELI_MODEL_PROVIDER = "env-provider";

    const config: Configuration = { modelProvider: "config-provider" };
    const result = ChatModelFactory.createChatModel(config);

    expect(result).toBe(envChatModel);
  });

  it("should throw ConfigurationError when no model provider is configured", () => {
    const config: Configuration = {};

    expect(() => ChatModelFactory.createChatModel(config)).toThrow(
      ConfigurationError,
    );
    expect(() => ChatModelFactory.createChatModel(config)).toThrow(
      "No model provider configured",
    );
  });

  it("should throw ConfigurationError when provider is not found", () => {
    const config: Configuration = { modelProvider: "nonexistent" };

    expect(() => ChatModelFactory.createChatModel(config)).toThrow(
      ConfigurationError,
    );
    expect(() => ChatModelFactory.createChatModel(config)).toThrow(
      "Model provider not found: nonexistent",
    );
  });

  it("should clear cached model and providers on reset", () => {
    ChatModelFactory.registerProvider("test", mockProvider);
    const config: Configuration = { modelProvider: "test" };
    ChatModelFactory.createChatModel(config);

    ChatModelFactory.reset();

    expect(() => ChatModelFactory.createChatModel(config)).toThrow(
      ConfigurationError,
    );
  });
});
