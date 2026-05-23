import { ConfigurationError } from "./ConfigurationError";

describe("ConfigurationError", () => {
  it("should create error with message", () => {
    const error = new ConfigurationError("test error");
    expect(error.message).toBe("test error");
    expect(error.name).toBe("ConfigurationError");
    expect(error.cause).toBeUndefined();
    expect(error).toBeInstanceOf(Error);
  });

  it("should create error with message and cause", () => {
    const cause = new Error("root cause");
    const error = new ConfigurationError("test error", cause);
    expect(error.message).toBe("test error");
    expect(error.cause).toBe(cause);
  });
});
