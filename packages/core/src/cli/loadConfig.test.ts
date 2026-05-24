import * as fs from "fs";
import * as os from "os";
import * as path from "path";
import { loadConfigFile } from "./loadConfig";

describe("loadConfigFile", () => {
  let tmpDir: string;

  beforeEach(() => {
    tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), "babeli-config-test-"));
  });

  afterEach(() => {
    fs.rmSync(tmpDir, { recursive: true });
  });

  it("should return undefined when no config file exists", async () => {
    const result = await loadConfigFile(tmpDir);
    expect(result).toBeUndefined();
  });

  it("should load array of configurations from config file", async () => {
    const configPath = path.join(tmpDir, "babeli.config.mjs");
    fs.writeFileSync(
      configPath,
      `export default [
        { file: "translations.json", actions: ["sort"] },
        { file: "other.json", actions: ["missing"] },
      ];`,
    );

    const result = await loadConfigFile(tmpDir);
    expect(result).toHaveLength(2);
    expect(result![0]!.file).toBe("translations.json");
    expect(result![1]!.file).toBe("other.json");
  });

  it("should wrap single configuration in array", async () => {
    const configPath = path.join(tmpDir, "babeli.config.mjs");
    fs.writeFileSync(
      configPath,
      `export default { file: "translations.json", modelProvider: "anthropic" };`,
    );

    const result = await loadConfigFile(tmpDir);
    expect(result).toHaveLength(1);
    expect(result![0]!.file).toBe("translations.json");
    expect(result![0]!.modelProvider).toBe("anthropic");
  });

  it("should load config with files array", async () => {
    const configPath = path.join(tmpDir, "babeli.config.mjs");
    fs.writeFileSync(
      configPath,
      `export default {
        files: [
          { language: "en", file: "en.json" },
          { language: "de", file: "de.json" },
        ],
        baseLanguage: "en",
      };`,
    );

    const result = await loadConfigFile(tmpDir);
    expect(result).toHaveLength(1);
    expect(result![0]!.files).toHaveLength(2);
    expect(result![0]!.baseLanguage).toBe("en");
  });
});
