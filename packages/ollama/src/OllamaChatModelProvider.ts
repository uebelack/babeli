import { ChatOllama } from "@langchain/ollama";
import type { BaseChatModel } from "@langchain/core/language_models/chat_models";
import type { ChatModelProvider, Configuration } from "@babeli/core";

export class OllamaChatModelProvider implements ChatModelProvider {
  create(configuration: Configuration): BaseChatModel {
    const model = process.env.BABELI_MODEL ?? configuration.model ?? "qwen3:8b";

    const baseUrl =
      process.env.BABELI_API_URL ??
      configuration.apiUrl ??
      "http://localhost:11434";

    return new ChatOllama({
      model,
      baseUrl,
    });
  }
}
