import { FileReaderError } from "./FileReaderError";

describe("FileReaderError", () => {
  it("should create error with file path", () => {
    const error = new FileReaderError("/path/to/file.json");
    expect(error.message).toBe("Error reading file: /path/to/file.json");
    expect(error.name).toBe("FileReaderError");
    expect(error.cause).toBeUndefined();
    expect(error).toBeInstanceOf(Error);
  });

  it("should create error with file path and cause", () => {
    const cause = new Error("parse error");
    const error = new FileReaderError("/path/to/file.json", cause);
    expect(error.message).toBe("Error reading file: /path/to/file.json");
    expect(error.cause).toBe(cause);
  });
});
