import type { BaseChatModel } from "@langchain/core/language_models/chat_models";
import type { ChatModelProvider } from "./ChatModelProvider";
import type { Configuration } from "../Configuration";
import { ConfigurationError } from "../errors/ConfigurationError";

let chatModel: BaseChatModel | undefined;
const providers = new Map<string, ChatModelProvider>();

export const ChatModelFactory = {
  registerProvider(name: string, provider: ChatModelProvider): void {
    providers.set(name, provider);
  },

  createChatModel(configuration: Configuration): BaseChatModel {
    if (!chatModel) {
      const modelProviderName =
        process.env.BABELI_MODEL_PROVIDER ?? configuration.modelProvider;

      if (!modelProviderName) {
        throw new ConfigurationError("No model provider configured");
      }

      const provider = providers.get(modelProviderName);

      if (!provider) {
        throw new ConfigurationError(
          "Model provider not found: " + modelProviderName,
        );
      }

      chatModel = provider.create(configuration);
    }

    return chatModel;
  },

  reset(): void {
    chatModel = undefined;
    providers.clear();
  },
};
