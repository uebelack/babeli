import * as fs from "fs";
import * as os from "os";
import * as path from "path";
import { validate, update } from "./commands";
import { ChatModelFactory, ActionRegistry } from "@babeli/core";

// Silence @clack/prompts output during tests
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

describe("commands", () => {
  let tmpDir: string;
  let originalCwd: string;

  beforeEach(() => {
    tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), "babeli-cli-test-"));
    ChatModelFactory.reset();
    ActionRegistry.reset();
    originalCwd = process.cwd();
  });

  afterEach(() => {
    process.chdir(originalCwd);
    fs.rmSync(tmpDir, { recursive: true });
  });

  describe("validate", () => {
    it("should return 0 when no errors found", async () => {
      const filePath = path.join(tmpDir, "translations.json");
      fs.writeFileSync(
        filePath,
        JSON.stringify({
          a_key: { en: "A" },
          b_key: { en: "B" },
        }),
      );

      const code = await validate({
        files: [filePath],
        actions: "sort",
      });
      expect(code).toBe(0);
    });

    it("should return 1 when errors are found", async () => {
      const filePath = path.join(tmpDir, "translations.json");
      fs.writeFileSync(
        filePath,
        JSON.stringify({
          z_key: { en: "Z" },
          a_key: { en: "A" },
        }),
      );

      const code = await validate({
        files: [filePath],
        actions: "sort",
      });
      expect(code).toBe(1);
    });

    it("should return 1 on exception", async () => {
      const code = await validate({
        files: ["/nonexistent/file.json"],
        actions: "sort",
      });
      expect(code).toBe(1);
    });
  });

  describe("update", () => {
    it("should return 0 on successful update", async () => {
      const filePath = path.join(tmpDir, "translations.json");
      fs.writeFileSync(
        filePath,
        JSON.stringify({
          z_key: { en: "Z" },
          a_key: { en: "A" },
        }),
      );

      const code = await update({
        files: [filePath],
        actions: "sort",
        modelProvider: "test",
      });
      expect(code).toBe(0);

      const result = JSON.parse(fs.readFileSync(filePath, "utf-8"));
      expect(Object.keys(result)).toEqual(["a_key", "z_key"]);
    });

    it("should return 1 on exception", async () => {
      const code = await update({
        files: ["/nonexistent/file.json"],
        actions: "sort",
        modelProvider: "test",
      });
      expect(code).toBe(1);
    });
  });

  describe("no files and no config file", () => {
    it("should return 1 when no files and no config file", async () => {
      process.chdir(tmpDir);
      // No babeli.config.mjs in tmpDir, no files in args → error
      const code = await validate({ actions: "sort" });
      expect(code).toBe(1);
    });
  });

  describe("config file integration", () => {
    it("should use config file when no files provided in validate", async () => {
      const filePath = path.join(tmpDir, "translations.json");
      fs.writeFileSync(
        filePath,
        JSON.stringify({ a: { en: "A" }, b: { en: "B" } }),
      );
      fs.writeFileSync(
        path.join(tmpDir, "babeli.config.mjs"),
        `export default [{ file: ${JSON.stringify(filePath)}, actions: ["sort"] }];`,
      );
      process.chdir(tmpDir);

      const code = await validate({});
      expect(code).toBe(0);
    });

    it("should use config file when no files provided in update", async () => {
      const filePath = path.join(tmpDir, "translations.json");
      fs.writeFileSync(
        filePath,
        JSON.stringify({ z: { en: "Z" }, a: { en: "A" } }),
      );
      fs.writeFileSync(
        path.join(tmpDir, "babeli.config.mjs"),
        `export default [{ file: ${JSON.stringify(filePath)}, actions: ["sort"], modelProvider: "test" }];`,
      );
      process.chdir(tmpDir);

      const code = await update({});
      expect(code).toBe(0);

      const result = JSON.parse(fs.readFileSync(filePath, "utf-8"));
      expect(Object.keys(result)).toEqual(["a", "z"]);
    });

    it("should apply CLI overrides on top of config file", async () => {
      const filePath = path.join(tmpDir, "translations.json");
      fs.writeFileSync(
        filePath,
        JSON.stringify({ z: { en: "Z" }, a: { en: "A" } }),
      );
      fs.writeFileSync(
        path.join(tmpDir, "babeli.config.mjs"),
        `export default [{ file: ${JSON.stringify(filePath)}, modelProvider: "test" }];`,
      );
      process.chdir(tmpDir);

      const code = await validate({ actions: "sort" });
      expect(code).toBe(1);
    });

    it("should process multiple configurations from config file", async () => {
      const file1 = path.join(tmpDir, "t1.json");
      const file2 = path.join(tmpDir, "t2.json");
      fs.writeFileSync(file1, JSON.stringify({ a: { en: "A" } }));
      fs.writeFileSync(file2, JSON.stringify({ b: { en: "B" } }));
      fs.writeFileSync(
        path.join(tmpDir, "babeli.config.mjs"),
        `export default [{ file: ${JSON.stringify(file1)}, actions: ["sort"] }, { file: ${JSON.stringify(file2)}, actions: ["sort"] }];`,
      );
      process.chdir(tmpDir);

      const code = await validate({});
      expect(code).toBe(0);
    });
  });
});
