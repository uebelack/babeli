import * as fs from "fs";
import * as os from "os";
import * as path from "path";
import { validate, update } from "./commands";
import { ChatModelFactory } from "../ai/ChatModelFactory";
import { ActionRegistry } from "../actions/ActionRegistry";

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

  beforeEach(() => {
    tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), "babeli-cli-test-"));
    ChatModelFactory.reset();
    ActionRegistry.reset();
  });

  afterEach(() => {
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
});
