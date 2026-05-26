import { execSync } from "node:child_process";
import { createRequire } from "node:module";
import { join } from "node:path";
import { pathToFileURL } from "node:url";
import type { BaseChatModel } from "@langchain/core/language_models/chat_models";
import type { ChatModelProvider } from "./ChatModelProvider";
import type { Configuration } from "../Configuration";
import { ConfigurationError } from "../errors/ConfigurationError";
import { Logger } from "../logging/Logger";

let chatModel: BaseChatModel | undefined;
const providers = new Map<string, ChatModelProvider>();

export function extractProvider(
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

async function loadProvider(
  configuration: Configuration,
  name: string,
): Promise<ChatModelProvider> {
  const logger = new Logger(configuration);
  logger.debug("Loading model provider: " + name);
  const packageName = `@babeli/${name.toLowerCase()}`;
  const providerClassName = `${name.charAt(0).toUpperCase() + name.slice(1).toLowerCase()}ChatModelProvider`;

  // Try direct import (works when package is a dependency of the running script)
  try {
    const module = await import(packageName);
    logger.debug("Loaded model provider from direct import: " + name);
    return extractProvider(module, providerClassName, packageName);
  } catch (error) {
    if (error instanceof ConfigurationError) {
      throw error;
    }
  }

  // Try resolving from CWD using createRequire (works when package is
  // installed in the project that invokes the CLI)
  try {
    const require = createRequire(join(process.cwd(), "package.json"));
    const resolvedPath = require.resolve(packageName);
    const module = await import(pathToFileURL(resolvedPath).href);
    logger.debug("Loaded model provider from CWD resolution: " + name);
    return extractProvider(module, providerClassName, packageName);
  } catch (error) {
    if (error instanceof ConfigurationError) {
      throw error;
    }
  }

  // Try resolving from global node_modules
  try {
    const globalRoot = execSync("npm root -g", { encoding: "utf-8" }).trim();
    const globalRequire = createRequire(join(globalRoot, "package.json"));
    const resolvedPath = globalRequire.resolve(packageName);
    const module = await import(pathToFileURL(resolvedPath).href);
    logger.debug("Loaded model provider from global node_modules: " + name);
    return extractProvider(module, providerClassName, packageName);
  } catch (error) {
    if (error instanceof ConfigurationError) {
      throw error;
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
        provider = await loadProvider(configuration, modelProviderName);
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
