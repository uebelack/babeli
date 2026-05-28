import * as path from "path";
import * as fs from "fs";
import type { Configuration } from "@babeli/core";

export async function loadConfigFile(
  cwd: string = process.cwd(),
): Promise<Configuration[] | undefined> {
  const configPath = path.resolve(cwd, "babeli.config.mjs");

  if (!fs.existsSync(configPath)) {
    return undefined;
  }

  const module = await import(configPath);
  const exported = module.default;

  if (Array.isArray(exported)) {
    return exported as Configuration[];
  }

  return [exported as Configuration];
}
