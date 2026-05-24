import { ChatAnthropic } from "@langchain/anthropic";
import type { BaseChatModel } from "@langchain/core/language_models/chat_models";
import type { ChatModelProvider, Configuration } from "@babeli/core";
import { ConfigurationError } from "@babeli/core";

export class AnthropicChatModelProvider implements ChatModelProvider {
  create(configuration: Configuration): BaseChatModel {
    const apiKey =
      process.env.BABELI_ANTHROPIC_API_KEY ??
      configuration.apiKey ??
      process.env.ANTHROPIC_API_KEY;

    if (!apiKey) {
      throw new ConfigurationError(
        "Missing required api key for anthropic chat model provider, please provide apiKey in configuration or define it as environment variable BABELI_ANTHROPIC_API_KEY or ANTHROPIC_API_KEY",
      );
    }

    const model =
      process.env.BABELI_MODEL ??
      configuration.model ??
      "claude-sonnet-4-20250514";

    return new ChatAnthropic({
      anthropicApiKey: apiKey,
      model,
    });
  }
}
