import { OllamaChatModelProvider } from "./OllamaChatModelProvider";
import { ChatOllama } from "@langchain/ollama";
import type { Configuration } from "@babeli/core";

describe("OllamaChatModelProvider", () => {
  const provider = new OllamaChatModelProvider();

  beforeEach(() => {
    delete process.env.BABELI_MODEL;
    delete process.env.BABELI_API_URL;
  });

  it("should create ChatOllama with default values", () => {
    const config: Configuration = {};
    const model = provider.create(config);
    expect(model).toBeInstanceOf(ChatOllama);
  });

  it("should use BABELI_MODEL env for model name", () => {
    process.env.BABELI_MODEL = "llama3:8b";
    const config: Configuration = { model: "other-model" };
    const model = provider.create(config);
    expect(model).toBeInstanceOf(ChatOllama);
  });

  it("should use configuration model when env is not set", () => {
    const config: Configuration = { model: "mistral" };
    const model = provider.create(config);
    expect(model).toBeInstanceOf(ChatOllama);
  });

  it("should use BABELI_API_URL env for base URL", () => {
    process.env.BABELI_API_URL = "http://remote:11434";
    const config: Configuration = { apiUrl: "http://other:11434" };
    const model = provider.create(config);
    expect(model).toBeInstanceOf(ChatOllama);
  });

  it("should use configuration apiUrl when env is not set", () => {
    const config: Configuration = { apiUrl: "http://custom:11434" };
    const model = provider.create(config);
    expect(model).toBeInstanceOf(ChatOllama);
  });

  it("should use default URL when neither env nor config is set", () => {
    const config: Configuration = {};
    const model = provider.create(config);
    expect(model).toBeInstanceOf(ChatOllama);
  });
});
