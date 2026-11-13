import { FileReaderRegistry } from "./FileReaderRegistry";
import { JsonFileReader } from "./JsonFileReader";
import { ConfigurationError } from "../errors/ConfigurationError";
import type { Configuration } from "../Configuration";
import { JsFileReader } from "./JsFileReader";
import { TsFileReader } from "./TsFileReader";
import { YamlFileReader } from "./YamlFileReader";
import { StringsFileReader } from "./StringsFileReader";

describe("FileReaderRegistry", () => {
  beforeEach(() => {
    FileReaderRegistry.reset();
  });

  it("should return JsonFileReader for .json files", () => {
    const config: Configuration = { file: "/project/en.json" };
    const reader = FileReaderRegistry.getFileReader(config);
    expect(reader).toBeInstanceOf(JsonFileReader);
  });

  it("should extract extension from files array when file is not set", () => {
    const config: Configuration = {
      files: [{ language: "en", file: "/project/en.json" }],
    };
    const reader = FileReaderRegistry.getFileReader(config);
    expect(reader).toBeInstanceOf(JsonFileReader);
  });

  it("should throw ConfigurationError when no file is configured", () => {
    const config: Configuration = {};
    expect(() => FileReaderRegistry.getFileReader(config)).toThrow(ConfigurationError);
    expect(() => FileReaderRegistry.getFileReader(config)).toThrow("No file configured");
  });

  it("should throw ConfigurationError for unknown extension", () => {
    const config: Configuration = { file: "/project/data.xml" };
    expect(() => FileReaderRegistry.getFileReader(config)).toThrow(ConfigurationError);
    expect(() => FileReaderRegistry.getFileReader(config)).toThrow(
      "No FileReader registered for file extension: xml",
    );
  });

  it("should allow registering custom file readers", () => {
    const customReader = {
      readSingleLanguageFile: () => ({
        language: "en",
        file: "test",
        translations: [],
      }),
      readMultiLanguageFile: () => ({ file: "test", translations: [] }),
    };
    FileReaderRegistry.registerFileReader("yaml", () => customReader);

    const config: Configuration = { file: "/project/data.yaml" };
    const reader = FileReaderRegistry.getFileReader(config);
    expect(reader).toBe(customReader);
  });

  it("should restore defaults after reset", () => {
    FileReaderRegistry.registerFileReader("yaml", () => ({
      readSingleLanguageFile: () => ({
        language: "en",
        file: "test",
        translations: [],
      }),
      readMultiLanguageFile: () => ({ file: "test", translations: [] }),
    }));

    FileReaderRegistry.reset();

    const jsonConfig: Configuration = { file: "/project/en.json" };
    expect(FileReaderRegistry.getFileReader(jsonConfig)).toBeInstanceOf(JsonFileReader);

    const xmlConfig: Configuration = { file: "/project/data.xml" };
    expect(() => FileReaderRegistry.getFileReader(xmlConfig)).toThrow(ConfigurationError);
  });

  it.each([
    ["js", JsFileReader],
    ["mjs", JsFileReader],
    ["ts", TsFileReader],
    ["mts", TsFileReader],
    ["yaml", YamlFileReader],
    ["yml", YamlFileReader],
    ["strings", StringsFileReader],
  ])("should return the default reader for .%s files", (extension, expected) => {
    const config: Configuration = { file: `/project/en.${extension}` };
    expect(FileReaderRegistry.getFileReader(config)).toBeInstanceOf(expected);
  });
});
