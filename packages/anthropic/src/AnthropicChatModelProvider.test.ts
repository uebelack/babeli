import { AnthropicChatModelProvider } from "./AnthropicChatModelProvider";
import { ChatAnthropic } from "@langchain/anthropic";
import { ConfigurationError } from "@babeli/core";
import type { Configuration } from "@babeli/core";

describe("AnthropicChatModelProvider", () => {
  const provider = new AnthropicChatModelProvider();

  beforeEach(() => {
    delete process.env.BABELI_ANTHROPIC_API_KEY;
    delete process.env.BABELI_MODEL;
    delete process.env.ANTHROPIC_API_KEY;
  });

  it("should throw ConfigurationError when no API key is provided", () => {
    const config: Configuration = {};
    expect(() => provider.create(config)).toThrow(ConfigurationError);
    expect(() => provider.create(config)).toThrow("Missing required api key");
  });

  it("should create ChatAnthropic with API key from configuration", () => {
    const config: Configuration = { apiKey: "test-api-key" };
    const model = provider.create(config);
    expect(model).toBeInstanceOf(ChatAnthropic);
  });

  it("should create ChatAnthropic with API key from BABELI_ANTHROPIC_API_KEY env", () => {
    process.env.BABELI_ANTHROPIC_API_KEY = "env-api-key";
    const config: Configuration = {};
    const model = provider.create(config);
    expect(model).toBeInstanceOf(ChatAnthropic);
  });

  it("should create ChatAnthropic with API key from ANTHROPIC_API_KEY env", () => {
    process.env.ANTHROPIC_API_KEY = "anthropic-env-key";
    const config: Configuration = {};
    const model = provider.create(config);
    expect(model).toBeInstanceOf(ChatAnthropic);
  });

  it("should prefer BABELI_ANTHROPIC_API_KEY over config and ANTHROPIC_API_KEY", () => {
    process.env.BABELI_ANTHROPIC_API_KEY = "babeli-key";
    process.env.ANTHROPIC_API_KEY = "anthropic-key";
    const config: Configuration = { apiKey: "config-key" };
    const model = provider.create(config);
    expect(model).toBeInstanceOf(ChatAnthropic);
  });

  it("should use BABELI_MODEL env for model name", () => {
    process.env.BABELI_MODEL = "claude-opus-4-20250514";
    const config: Configuration = { apiKey: "test-key", model: "other-model" };
    const model = provider.create(config);
    expect(model).toBeInstanceOf(ChatAnthropic);
  });

  it("should use configuration model when env is not set", () => {
    const config: Configuration = {
      apiKey: "test-key",
      model: "claude-haiku-4-5-20251001",
    };
    const model = provider.create(config);
    expect(model).toBeInstanceOf(ChatAnthropic);
  });

  it("should use default model when neither env nor config is set", () => {
    const config: Configuration = { apiKey: "test-key" };
    const model = provider.create(config);
    expect(model).toBeInstanceOf(ChatAnthropic);
  });
});
