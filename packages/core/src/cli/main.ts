#!/usr/bin/env bun
import { hideBin } from "yargs/helpers";
import { run } from "./index";

run(hideBin(process.argv)).then((code) => {
  process.exit(code);
});
