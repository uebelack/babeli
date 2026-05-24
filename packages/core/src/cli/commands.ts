import { Babeli } from "../Babeli";
import * as p from "@clack/prompts";
import type { CliArgs } from "./config";
import { buildConfiguration } from "./config";

export async function validate(args: CliArgs): Promise<number> {
  p.intro("babeli validate");

  try {
    const configuration = buildConfiguration(args);
    const s = p.spinner();
    s.start("Validating translation files...");

    const errors = Babeli.validate(configuration);

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
    const configuration = buildConfiguration(args);
    const s = p.spinner();
    s.start("Updating translation files...");

    await Babeli.update(configuration);

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
