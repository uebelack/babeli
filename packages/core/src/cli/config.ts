import type { Configuration } from "../Configuration";
import type { LanguageFileConfiguration } from "../Configuration";

export interface CliArgs {
  files?: string[];
  charset?: string;
  directory?: string;
  baseLanguage?: string;
  actions?: string;
  modelProvider?: string;
  model?: string;
  apiKey?: string;
  apiUrl?: string;
  verbose?: boolean;
}

export function buildConfiguration(args: CliArgs): Configuration {
  const configuration: Configuration = {};

  if (args.files?.length === 1) {
    configuration.file = args.files[0];
  }

  if (args.files && args.files.length > 1) {
    configuration.files = args.files.map((f): LanguageFileConfiguration => {
      const parts = f.split(":", 2);
      if (parts.length !== 2) {
        throw new Error(
          `Invalid file format: ${f}. Expected format: language:path`,
        );
      }
      return { language: parts[0]!, file: parts[1]! };
    });
  }

  if (args.charset) {
    configuration.charset = args.charset as BufferEncoding;
  }

  if (args.directory) {
    configuration.workingDirectory = args.directory;
  }

  if (args.baseLanguage) {
    configuration.baseLanguage = args.baseLanguage;
  }

  if (args.actions) {
    configuration.actions = args.actions.split(",");
  }

  if (args.modelProvider) {
    configuration.modelProvider = args.modelProvider;
  }

  if (args.model) {
    configuration.model = args.model;
  }

  if (args.apiKey) {
    configuration.apiKey = args.apiKey;
  }

  if (args.apiUrl) {
    configuration.apiUrl = args.apiUrl;
  }

  if (args.verbose) {
    configuration.debug = true;
  }

  return configuration;
}
