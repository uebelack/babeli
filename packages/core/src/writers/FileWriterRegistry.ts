import * as path from "path";
import type { FileWriter } from "./FileWriter";
import type { Configuration } from "../Configuration";
import { ConfigurationError } from "../errors/ConfigurationError";
import { JsonFileWriter } from "./JsonFileWriter";
import { JsFileWriter } from "./JsFileWriter";
import { TsFileWriter } from "./TsFileWriter";

type FileWriterFactory = (configuration: Configuration) => FileWriter;

const fileWriters = new Map<string, FileWriterFactory>();

function registerDefaults(): void {
  fileWriters.set("json", (config) => new JsonFileWriter(config));
  fileWriters.set("js", (config) => new JsFileWriter(config));
  fileWriters.set("mjs", (config) => new JsFileWriter(config));
  fileWriters.set("ts", (config) => new TsFileWriter(config));
  fileWriters.set("mts", (config) => new TsFileWriter(config));
}

registerDefaults();

function getFileExtension(configuration: Configuration): string {
  if (configuration.file) {
    return path.extname(configuration.file).slice(1);
  }
  if (configuration.files?.length) {
    return path.extname(configuration.files[0]!.file).slice(1);
  }
  throw new ConfigurationError("No file configured");
}

export const FileWriterRegistry = {
  registerFileWriter(extension: string, factory: FileWriterFactory): void {
    fileWriters.set(extension, factory);
  },

  getFileWriter(configuration: Configuration): FileWriter {
    const extension = getFileExtension(configuration);
    const factory = fileWriters.get(extension);

    if (!factory) {
      throw new ConfigurationError(
        "No FileWriter registered for file extension: " + extension,
      );
    }

    return factory(configuration);
  },

  reset(): void {
    fileWriters.clear();
    registerDefaults();
  },
};
