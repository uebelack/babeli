import { execSync } from "node:child_process";
import { join } from "node:path";
import type { BaseChatModel } from "@langchain/core/language_models/chat_models";
import type { ChatModelProvider } from "./ChatModelProvider";
import type { Configuration } from "../Configuration";
import { ConfigurationError } from "../errors/ConfigurationError";

let chatModel: BaseChatModel | undefined;
const providers = new Map<string, ChatModelProvider>();

function getGlobalNodeModulesPath(): string | undefined {
  try {
    return execSync("npm root -g", { encoding: "utf-8" }).trim();
  } catch {
    return undefined;
  }
}

function extractProvider(
  module: Record<string, unknown>,
  providerClassName: string,
  packageName: string,
): ChatModelProvider {
  const ProviderClass = module[providerClassName] ?? module.default;

  if (!ProviderClass) {
    throw new ConfigurationError(
      `Package ${packageName} does not export ${providerClassName} or a default export`,
    );
  }

  return new (ProviderClass as new () => ChatModelProvider)();
}

async function loadProvider(name: string): Promise<ChatModelProvider> {
  const packageName = `@babeli/${name.toLowerCase()}`;
  const providerClassName = `${name.charAt(0).toUpperCase() + name.slice(1).toLowerCase()}ChatModelProvider`;

  // Try local import first
  try {
    const module = await import(packageName);
    return extractProvider(module, providerClassName, packageName);
  } catch (error) {
    if (error instanceof ConfigurationError) {
      throw error;
    }
  }

  // Try current working directory node_modules
  try {
    const module = await import(join(process.cwd(), "node_modules", packageName));
    return extractProvider(module, providerClassName, packageName);
  } catch (error) {
    if (error instanceof ConfigurationError) {
      throw error;
    }
  }

  // Try global import
  const globalPath = getGlobalNodeModulesPath();
  if (globalPath) {
    try {
      const module = await import(join(globalPath, packageName));
      return extractProvider(module, providerClassName, packageName);
    } catch (error) {
      if (error instanceof ConfigurationError) {
        throw error;
      }
    }
  }

  throw new ConfigurationError(
    `Model provider "${name}" is not registered and package ${packageName} could not be loaded. Install it with: npm install ${packageName}`,
  );
}

export const ChatModelFactory = {
  registerProvider(name: string, provider: ChatModelProvider): void {
    providers.set(name, provider);
  },

  async createChatModel(configuration: Configuration): Promise<BaseChatModel> {
    if (!chatModel) {
      const modelProviderName =
        process.env.BABELI_MODEL_PROVIDER ?? configuration.modelProvider;

      if (!modelProviderName) {
        throw new ConfigurationError("No model provider configured");
      }

      let provider = providers.get(modelProviderName);

      if (!provider) {
        provider = await loadProvider(modelProviderName);
        providers.set(modelProviderName, provider);
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
