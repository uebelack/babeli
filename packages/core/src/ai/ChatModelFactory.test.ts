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

  it("should create chat model from registered provider", async () => {
    ChatModelFactory.registerProvider("test", mockProvider);
    const config: Configuration = { modelProvider: "test" };

    const result = await ChatModelFactory.createChatModel(config);

    expect(result).toBe(mockChatModel);
  });

  it("should return cached chat model on subsequent calls", async () => {
    ChatModelFactory.registerProvider("test", mockProvider);
    const config: Configuration = { modelProvider: "test" };

    const first = await ChatModelFactory.createChatModel(config);
    const second = await ChatModelFactory.createChatModel(config);

    expect(first).toBe(second);
  });

  it("should prefer BABELI_MODEL_PROVIDER env var over configuration", async () => {
    const envChatModel = {} as BaseChatModel;
    const envProvider: ChatModelProvider = {
      create: () => envChatModel,
    };
    ChatModelFactory.registerProvider("env-provider", envProvider);
    ChatModelFactory.registerProvider("config-provider", mockProvider);
    process.env.BABELI_MODEL_PROVIDER = "env-provider";

    const config: Configuration = { modelProvider: "config-provider" };
    const result = await ChatModelFactory.createChatModel(config);

    expect(result).toBe(envChatModel);
  });

  it("should throw ConfigurationError when no model provider is configured", async () => {
    const config: Configuration = {};

    await expect(ChatModelFactory.createChatModel(config)).rejects.toThrow(
      ConfigurationError,
    );
    await expect(ChatModelFactory.createChatModel(config)).rejects.toThrow(
      "No model provider configured",
    );
  });

  it("should throw ConfigurationError when provider is not found and package is not installed", async () => {
    const config: Configuration = { modelProvider: "nonexistent" };

    await expect(ChatModelFactory.createChatModel(config)).rejects.toThrow(
      ConfigurationError,
    );
    await expect(ChatModelFactory.createChatModel(config)).rejects.toThrow(
      /could not be loaded/,
    );
  });

  it("should clear cached model and providers on reset", async () => {
    ChatModelFactory.registerProvider("test", mockProvider);
    const config: Configuration = { modelProvider: "test" };
    await ChatModelFactory.createChatModel(config);

    ChatModelFactory.reset();

    await expect(ChatModelFactory.createChatModel(config)).rejects.toThrow(
      ConfigurationError,
    );
  });
});
