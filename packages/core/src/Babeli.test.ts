import * as fs from "fs";
import * as os from "os";
import * as path from "path";
import { Babeli } from "./Babeli";
import { ChatModelFactory } from "./ai/ChatModelFactory";
import { ActionRegistry } from "./actions/ActionRegistry";
import type { Configuration } from "./Configuration";
import type { LoggingProvider } from "./logging/LoggingProvider";
import type { ChatModelProvider } from "./ai/ChatModelProvider";
import type { BaseChatModel } from "@langchain/core/language_models/chat_models";
import { AIMessage } from "@langchain/core/messages";

function createSilentLoggingProvider(): LoggingProvider {
  return {
    debug: () => {},
    info: () => {},
    warn: () => {},
    error: () => {},
  };
}

describe("Babeli", () => {
  let tmpDir: string;

  beforeEach(() => {
    tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), "babeli-test-"));
    ChatModelFactory.reset();
    ActionRegistry.reset();
    delete process.env.BABELI_SKIP;
    delete process.env.BABELI_MODEL_PROVIDER;
  });

  afterEach(() => {
    fs.rmSync(tmpDir, { recursive: true });
  });

  describe("validate", () => {
    it("should return errors for unsorted multi-language file", () => {
      const filePath = path.join(tmpDir, "translations.json");
      fs.writeFileSync(
        filePath,
        JSON.stringify({
          b_key: { en: "B" },
          a_key: { en: "A" },
        }),
      );

      const config: Configuration = {
        file: filePath,
        actions: ["sort"],
        loggingProvider: createSilentLoggingProvider(),
      };

      const errors = Babeli.validate(config);
      expect(errors.length).toBeGreaterThan(0);
      expect(errors[0]!.action).toBe("sort");
    });

    it("should return no errors for sorted multi-language file", () => {
      const filePath = path.join(tmpDir, "translations.json");
      fs.writeFileSync(
        filePath,
        JSON.stringify({
          a_key: { en: "A" },
          b_key: { en: "B" },
        }),
      );

      const config: Configuration = {
        file: filePath,
        actions: ["sort"],
        loggingProvider: createSilentLoggingProvider(),
      };

      const errors = Babeli.validate(config);
      expect(errors).toEqual([]);
    });

    it("should validate single-language files", () => {
      const enPath = path.join(tmpDir, "en.json");
      const dePath = path.join(tmpDir, "de.json");
      fs.writeFileSync(enPath, JSON.stringify({ hello: "Hello", bye: "Bye" }));
      fs.writeFileSync(dePath, JSON.stringify({ hello: "Hallo" }));

      const config: Configuration = {
        files: [
          { language: "en", file: enPath },
          { language: "de", file: dePath },
        ],
        actions: ["missing"],
        loggingProvider: createSilentLoggingProvider(),
      };

      const errors = Babeli.validate(config);
      expect(errors.length).toBe(1);
      expect(errors[0]!.action).toBe("missing");
      expect(errors[0]!.language).toBe("de");
    });

    it("should skip when BABELI_SKIP env is true", () => {
      process.env.BABELI_SKIP = "true";

      const config: Configuration = {
        file: "/nonexistent.json",
        loggingProvider: createSilentLoggingProvider(),
      };

      const errors = Babeli.validate(config);
      expect(errors).toEqual([]);
    });

    it("should skip when config.skip is true", () => {
      const config: Configuration = {
        file: "/nonexistent.json",
        skip: true,
        loggingProvider: createSilentLoggingProvider(),
      };

      const errors = Babeli.validate(config);
      expect(errors).toEqual([]);
    });

    it("should use all registered actions when none specified", () => {
      const filePath = path.join(tmpDir, "translations.json");
      fs.writeFileSync(
        filePath,
        JSON.stringify({
          a_key: { en: "A", de: "A-de" },
        }),
      );

      const config: Configuration = {
        file: filePath,
        loggingProvider: createSilentLoggingProvider(),
      };

      const errors = Babeli.validate(config);
      expect(errors).toEqual([]);
    });
  });

  describe("update", () => {
    it("should sort a multi-language file", async () => {
      const filePath = path.join(tmpDir, "translations.json");
      fs.writeFileSync(
        filePath,
        JSON.stringify({
          z_key: { en: "Z" },
          a_key: { en: "A" },
        }),
      );

      const config: Configuration = {
        file: filePath,
        actions: ["sort"],
        modelProvider: "test",
        loggingProvider: createSilentLoggingProvider(),
      };

      await Babeli.update(config);

      const result = JSON.parse(fs.readFileSync(filePath, "utf-8"));
      const keys = Object.keys(result);
      expect(keys).toEqual(["a_key", "z_key"]);
    });

    it("should sort single-language files", async () => {
      const enPath = path.join(tmpDir, "en.json");
      fs.writeFileSync(enPath, JSON.stringify({ z_key: "Z", a_key: "A" }));

      const config: Configuration = {
        files: [{ language: "en", file: enPath }],
        actions: ["sort"],
        modelProvider: "test",
        loggingProvider: createSilentLoggingProvider(),
      };

      await Babeli.update(config);

      const result = JSON.parse(fs.readFileSync(enPath, "utf-8"));
      const keys = Object.keys(result);
      expect(keys).toEqual(["a_key", "z_key"]);
    });

    it("should skip when BABELI_SKIP env is true", async () => {
      process.env.BABELI_SKIP = "true";

      const config: Configuration = {
        file: "/nonexistent.json",
        loggingProvider: createSilentLoggingProvider(),
      };

      await Babeli.update(config);
      // Should not throw since it's skipped
    });

    it("should skip when config.skip is true", async () => {
      const config: Configuration = {
        file: "/nonexistent.json",
        skip: true,
        loggingProvider: createSilentLoggingProvider(),
      };

      await Babeli.update(config);
    });

    it("should warn and skip when no model provider is configured", async () => {
      const messages: string[] = [];
      const config: Configuration = {
        file: "/nonexistent.json",
        loggingProvider: {
          debug: () => {},
          info: () => {},
          warn: (msg) => messages.push(msg),
          error: () => {},
        },
      };

      await Babeli.update(config);

      expect(messages.length).toBe(1);
      expect(messages[0]).toContain("No model provider specified");
    });

    it("should use BABELI_MODEL_PROVIDER env var", async () => {
      process.env.BABELI_MODEL_PROVIDER = "test";
      const mockModel = {
        invoke: async () => new AIMessage("translated"),
      } as unknown as BaseChatModel;
      const provider: ChatModelProvider = { create: () => mockModel };
      ChatModelFactory.registerProvider("test", provider);

      const filePath = path.join(tmpDir, "translations.json");
      fs.writeFileSync(filePath, JSON.stringify({ a_key: { en: "A" } }));

      const config: Configuration = {
        file: filePath,
        actions: ["sort"],
        loggingProvider: createSilentLoggingProvider(),
      };

      await Babeli.update(config);

      const result = JSON.parse(fs.readFileSync(filePath, "utf-8"));
      expect(result).toEqual({ a_key: { en: "A" } });
    });
  });
});
