export class FileWriterError extends Error {
  constructor(filePath: string, cause?: unknown) {
    super("Error writing file: " + filePath, { cause });
    this.name = "FileWriterError";
  }
}
