import * as path from "path";
import type { FileReader } from "./FileReader";
import type { Configuration } from "../Configuration";
import { ConfigurationError } from "../errors/ConfigurationError";
import { JsonFileReader } from "./JsonFileReader";
import { JsFileReader } from "./JsFileReader";
import { TsFileReader } from "./TsFileReader";

type FileReaderFactory = (configuration: Configuration) => FileReader;

const fileReaders = new Map<string, FileReaderFactory>();

function registerDefaults(): void {
  fileReaders.set("json", (config) => new JsonFileReader(config));
  fileReaders.set("js", () => new JsFileReader());
  fileReaders.set("mjs", () => new JsFileReader());
  fileReaders.set("ts", () => new TsFileReader());
  fileReaders.set("mts", () => new TsFileReader());
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

export const FileReaderRegistry = {
  registerFileReader(extension: string, factory: FileReaderFactory): void {
    fileReaders.set(extension, factory);
  },

  getFileReader(configuration: Configuration): FileReader {
    const extension = getFileExtension(configuration);
    const factory = fileReaders.get(extension);

    if (!factory) {
      throw new ConfigurationError(
        "No FileReader registered for file extension: " + extension,
      );
    }

    return factory(configuration);
  },

  reset(): void {
    fileReaders.clear();
    registerDefaults();
  },
};
