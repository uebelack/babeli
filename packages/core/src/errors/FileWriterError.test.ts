import { FileWriterError } from "./FileWriterError";

describe("FileWriterError", () => {
  it("should create error with file path", () => {
    const error = new FileWriterError("/path/to/file.json");
    expect(error.message).toBe("Error writing file: /path/to/file.json");
    expect(error.name).toBe("FileWriterError");
    expect(error.cause).toBeUndefined();
    expect(error).toBeInstanceOf(Error);
  });

  it("should create error with file path and cause", () => {
    const cause = new Error("write error");
    const error = new FileWriterError("/path/to/file.json", cause);
    expect(error.message).toBe("Error writing file: /path/to/file.json");
    expect(error.cause).toBe(cause);
  });
});
