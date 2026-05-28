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

async function tryImport(
  importFn: () => Promise<Record<string, unknown>>,
  providerClassName: string,
  packageName: string,
): Promise<ChatModelProvider | undefined> {
  try {
    const module = await importFn();
    return extractProvider(module, providerClassName, packageName);
  } catch (error) {
    if (error instanceof ConfigurationError) {
      throw error;
    }
    return undefined;
  }
}

async function loadProvider(
  configuration: Configuration,
  name: string,
): Promise<ChatModelProvider> {
  const logger = new Logger(configuration);
  logger.debug("Loading model provider: " + name);
  const packageName = `@babeli/${name.toLowerCase()}`;
  const providerClassName = `${name.charAt(0).toUpperCase() + name.slice(1).toLowerCase()}ChatModelProvider`;

  const strategies: Array<{
    label: string;
    importFn: () => Promise<Record<string, unknown>>;
  }> = [
    {
      label: "direct import",
      importFn: () => import(packageName),
    },
    {
      label: "CWD resolution",
      importFn: async () => {
        const req = createRequire(join(process.cwd(), "package.json"));
        return import(pathToFileURL(req.resolve(packageName)).href);
      },
    },
    {
      label: "global node_modules",
      importFn: async () => {
        const globalRoot = execSync("npm root -g", {
          encoding: "utf-8",
        }).trim();
        const req = createRequire(join(globalRoot, "package.json"));
        return import(pathToFileURL(req.resolve(packageName)).href);
      },
    },
  ];

  for (const { label, importFn } of strategies) {
    const provider = await tryImport(importFn, providerClassName, packageName);
    if (provider) {
      logger.debug(`Loaded model provider from ${label}: ${name}`);
      return provider;
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
