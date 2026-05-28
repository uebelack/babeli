import { buildConfiguration } from "./config";

describe("buildConfiguration", () => {
  it("should return empty configuration for no args", () => {
    const config = buildConfiguration({});
    expect(config).toEqual({});
  });

  it("should set file for single file argument", () => {
    const config = buildConfiguration({ files: ["translations.json"] });
    expect(config.file).toBe("translations.json");
    expect(config.files).toBeUndefined();
  });

  it("should set files for multiple file arguments with language prefix", () => {
    const config = buildConfiguration({
      files: ["en:en.json", "de:de.json"],
    });
    expect(config.file).toBeUndefined();
    expect(config.files).toEqual([
      { language: "en", file: "en.json" },
      { language: "de", file: "de.json" },
    ]);
  });

  it("should throw for invalid multi-file format", () => {
    expect(() =>
      buildConfiguration({ files: ["en:en.json", "invalid_format"] }),
    ).toThrow("Invalid file format: invalid_format");
  });

  it("should set charset", () => {
    const config = buildConfiguration({ charset: "latin1" });
    expect(config.charset).toBe("latin1");
  });

  it("should set workingDirectory from directory", () => {
    const config = buildConfiguration({ directory: "/my/dir" });
    expect(config.workingDirectory).toBe("/my/dir");
  });

  it("should set baseLanguage", () => {
    const config = buildConfiguration({ baseLanguage: "de" });
    expect(config.baseLanguage).toBe("de");
  });

  it("should split actions by comma", () => {
    const config = buildConfiguration({ actions: "sort,missing" });
    expect(config.actions).toEqual(["sort", "missing"]);
  });

  it("should set modelProvider", () => {
    const config = buildConfiguration({ modelProvider: "anthropic" });
    expect(config.modelProvider).toBe("anthropic");
  });

  it("should set model", () => {
    const config = buildConfiguration({ model: "claude-sonnet-4-20250514" });
    expect(config.model).toBe("claude-sonnet-4-20250514");
  });

  it("should set apiKey", () => {
    const config = buildConfiguration({ apiKey: "sk-123" });
    expect(config.apiKey).toBe("sk-123");
  });

  it("should set apiUrl", () => {
    const config = buildConfiguration({ apiUrl: "http://localhost:11434" });
    expect(config.apiUrl).toBe("http://localhost:11434");
  });

  it("should set debug when verbose is true", () => {
    const config = buildConfiguration({ verbose: true });
    expect(config.debug).toBe(true);
  });

  it("should not set debug when verbose is false", () => {
    const config = buildConfiguration({ verbose: false });
    expect(config.debug).toBeUndefined();
  });
});
