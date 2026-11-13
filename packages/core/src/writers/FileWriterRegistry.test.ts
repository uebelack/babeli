import { FileWriterRegistry } from "./FileWriterRegistry";
import { JsonFileWriter } from "./JsonFileWriter";
import { ConfigurationError } from "../errors/ConfigurationError";
import type { Configuration } from "../Configuration";
import { JsFileWriter } from "./JsFileWriter";
import { TsFileWriter } from "./TsFileWriter";
import { YamlFileWriter } from "./YamlFileWriter";
import { StringsFileWriter } from "./StringsFileWriter";

describe("FileWriterRegistry", () => {
  beforeEach(() => {
    FileWriterRegistry.reset();
  });

  it("should return JsonFileWriter for .json files", () => {
    const config: Configuration = { file: "/project/en.json" };
    const writer = FileWriterRegistry.getFileWriter(config);
    expect(writer).toBeInstanceOf(JsonFileWriter);
  });

  it("should extract extension from files array when file is not set", () => {
    const config: Configuration = {
      files: [{ language: "en", file: "/project/en.json" }],
    };
    const writer = FileWriterRegistry.getFileWriter(config);
    expect(writer).toBeInstanceOf(JsonFileWriter);
  });

  it("should throw ConfigurationError when no file is configured", () => {
    const config: Configuration = {};
    expect(() => FileWriterRegistry.getFileWriter(config)).toThrow(ConfigurationError);
    expect(() => FileWriterRegistry.getFileWriter(config)).toThrow("No file configured");
  });

  it("should throw ConfigurationError for unknown extension", () => {
    const config: Configuration = { file: "/project/data.xml" };
    expect(() => FileWriterRegistry.getFileWriter(config)).toThrow(ConfigurationError);
    expect(() => FileWriterRegistry.getFileWriter(config)).toThrow(
      "No FileWriter registered for file extension: xml",
    );
  });

  it("should allow registering custom file writers", () => {
    const customWriter = {
      writeSingleLanguageFile: () => {},
      writeMultiLanguageFile: () => {},
    };
    FileWriterRegistry.registerFileWriter("yaml", () => customWriter);

    const config: Configuration = { file: "/project/data.yaml" };
    const writer = FileWriterRegistry.getFileWriter(config);
    expect(writer).toBe(customWriter);
  });

  it("should restore defaults after reset", () => {
    FileWriterRegistry.registerFileWriter("yaml", () => ({
      writeSingleLanguageFile: () => {},
      writeMultiLanguageFile: () => {},
    }));

    FileWriterRegistry.reset();

    const jsonConfig: Configuration = { file: "/project/en.json" };
    expect(FileWriterRegistry.getFileWriter(jsonConfig)).toBeInstanceOf(JsonFileWriter);

    const xmlConfig: Configuration = { file: "/project/data.xml" };
    expect(() => FileWriterRegistry.getFileWriter(xmlConfig)).toThrow(ConfigurationError);
  });

  it.each([
    ["js", JsFileWriter],
    ["mjs", JsFileWriter],
    ["ts", TsFileWriter],
    ["mts", TsFileWriter],
    ["yaml", YamlFileWriter],
    ["yml", YamlFileWriter],
    ["strings", StringsFileWriter],
  ])("should return the default writer for .%s files", (extension, expected) => {
    const config: Configuration = { file: `/project/en.${extension}` };
    expect(FileWriterRegistry.getFileWriter(config)).toBeInstanceOf(expected);
  });
});
