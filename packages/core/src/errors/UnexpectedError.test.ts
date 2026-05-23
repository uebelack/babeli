import { UnexpectedError } from "./UnexpectedError";

describe("UnexpectedError", () => {
  it("should create error with message", () => {
    const error = new UnexpectedError("something went wrong");
    expect(error.message).toBe("something went wrong");
    expect(error.name).toBe("UnexpectedError");
    expect(error.cause).toBeUndefined();
    expect(error).toBeInstanceOf(Error);
  });

  it("should create error with message and cause", () => {
    const cause = new Error("root cause");
    const error = new UnexpectedError("something went wrong", cause);
    expect(error.message).toBe("something went wrong");
    expect(error.cause).toBe(cause);
  });
});
