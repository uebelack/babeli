import { Babeli } from "@babeli/core";
import type { Configuration } from "@babeli/core";
import * as p from "@clack/prompts";
import type { CliArgs } from "./config";
import { buildConfiguration } from "./config";
import { loadConfigFile } from "./loadConfig";

async function resolveConfigurations(args: CliArgs): Promise<Configuration[]> {
  if (args.files?.length) {
    return [buildConfiguration(args)];
  }

  const fileConfigs = await loadConfigFile();

  if (!fileConfigs) {
    return [buildConfiguration(args)];
  }

  const cliOverrides = buildConfiguration({ ...args, files: undefined });

  return fileConfigs.map((config) => ({ ...config, ...cliOverrides }));
}

export async function validate(args: CliArgs): Promise<number> {
  p.intro("babeli validate");

  try {
    const configurations = await resolveConfigurations(args);
    const s = p.spinner();
    s.start("Validating translation files...");

    const results = await Promise.all(
      configurations.map((config) => Babeli.validate(config)),
    );
    const errors = results.flat();

    if (errors.length === 0) {
      s.stop("Validation complete.");
      p.log.success("No errors found.");
      p.outro("Done.");
      return 0;
    }

    s.stop("Validation complete.");
    for (const error of errors) {
      p.log.error(
        `[${error.action}] ${error.language}: ${error.value} - ${error.message}`,
      );
    }
    p.outro(`Found ${errors.length} error(s).`);
    return 1;
  } catch (e) {
    p.log.error(e instanceof Error ? e.message : String(e));
    p.outro("Failed.");
    return 1;
  }
}

export async function update(args: CliArgs): Promise<number> {
  p.intro("babeli update");

  try {
    const configurations = await resolveConfigurations(args);
    const s = p.spinner();
    s.start("Updating translation files...");

    for (const config of configurations) {
      await Babeli.update(config);
    }

    s.stop("Update complete.");
    p.log.success("Translation files updated successfully.");
    p.outro("Done.");
    return 0;
  } catch (e) {
    p.log.error(e instanceof Error ? e.message : String(e));
    p.outro("Failed.");
    return 1;
  }
}
