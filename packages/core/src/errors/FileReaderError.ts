export class FileReaderError extends Error {
  constructor(filePath: string, cause?: unknown) {
    super("Error reading file: " + filePath, { cause });
    this.name = "FileReaderError";
  }
}
