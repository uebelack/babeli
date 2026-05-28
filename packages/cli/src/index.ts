import yargs from "yargs";
import { validate, update } from "./commands";

const sharedOptions = {
  files: {
    alias: "f",
    type: "string" as const,
    array: true,
    description:
      "Translation files. If multiple files, prefix each with language, e.g.: de:values_de.json",
  },
  charset: {
    alias: "c",
    type: "string" as const,
    description: "Character set for reading and writing files (default: UTF-8)",
  },
  directory: {
    alias: "d",
    type: "string" as const,
    description: "Working directory (default: current directory)",
  },
  "base-language": {
    alias: "b",
    type: "string" as const,
    description: "Base language code (default: en)",
  },
  actions: {
    alias: "a",
    type: "string" as const,
    description: "Comma-separated list of actions to perform (default: all)",
  },
  "model-provider": {
    alias: "p",
    type: "string" as const,
    description: "AI model provider to use",
  },
  model: {
    alias: "m",
    type: "string" as const,
    description: "AI model to use",
  },
  "api-key": {
    alias: "k",
    type: "string" as const,
    description: "API key for the model provider",
  },
  "api-url": {
    alias: "u",
    type: "string" as const,
    description: "API URL for the model provider",
  },
  verbose: {
    alias: "v",
    type: "boolean" as const,
    description: "Enable verbose output for debugging",
  },
};

export async function run(args: string[]): Promise<number> {
  let exitCode = 1;

  await yargs(args)
    .scriptName("babeli")
    .command(
      "validate",
      "Validates the translation files",
      sharedOptions,
      async (argv) => {
        exitCode = await validate({
          files: argv.files,
          charset: argv.charset,
          directory: argv.directory,
          baseLanguage: argv.baseLanguage,
          actions: argv.actions,
          modelProvider: argv.modelProvider,
          model: argv.model,
          apiKey: argv.apiKey,
          apiUrl: argv.apiUrl,
          verbose: argv.verbose,
        });
      },
    )
    .command(
      "update",
      "Updates the translation files",
      sharedOptions,
      async (argv) => {
        exitCode = await update({
          files: argv.files,
          charset: argv.charset,
          directory: argv.directory,
          baseLanguage: argv.baseLanguage,
          actions: argv.actions,
          modelProvider: argv.modelProvider,
          model: argv.model,
          apiKey: argv.apiKey,
          apiUrl: argv.apiUrl,
          verbose: argv.verbose,
        });
      },
    )
    .demandCommand(1, "Please specify a command: validate or update")
    .strict()
    .help()
    .parse();

  return exitCode;
}
