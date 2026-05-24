import * as fs from "fs";
import * as os from "os";
import * as path from "path";
import { run } from "./index";
import { ChatModelFactory } from "../ai/ChatModelFactory";
import { ActionRegistry } from "../actions/ActionRegistry";

jest.mock("@clack/prompts", () => ({
  intro: () => {},
  outro: () => {},
  spinner: () => ({ start: () => {}, stop: () => {} }),
  log: {
    success: () => {},
    error: () => {},
    info: () => {},
    warn: () => {},
  },
}));

describe("run", () => {
  let tmpDir: string;

  beforeEach(() => {
    tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), "babeli-cli-test-"));
    ChatModelFactory.reset();
    ActionRegistry.reset();
  });

  afterEach(() => {
    fs.rmSync(tmpDir, { recursive: true });
  });

  it("should run validate command", async () => {
    const filePath = path.join(tmpDir, "translations.json");
    fs.writeFileSync(
      filePath,
      JSON.stringify({ a: { en: "A" }, b: { en: "B" } }),
    );

    const code = await run(["validate", "-f", filePath, "-a", "sort"]);
    expect(code).toBe(0);
  });

  it("should run update command", async () => {
    const filePath = path.join(tmpDir, "translations.json");
    fs.writeFileSync(
      filePath,
      JSON.stringify({ z: { en: "Z" }, a: { en: "A" } }),
    );

    const code = await run([
      "update",
      "-f",
      filePath,
      "-a",
      "sort",
      "-p",
      "test",
    ]);
    expect(code).toBe(0);
  });
});
