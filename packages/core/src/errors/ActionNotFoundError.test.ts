import { ActionNotFoundError } from "./ActionNotFoundError";

describe("ActionNotFoundError", () => {
  it("should create error with action name", () => {
    const error = new ActionNotFoundError("custom");
    expect(error.message).toBe("Action custom not found");
    expect(error.name).toBe("ActionNotFoundError");
    expect(error).toBeInstanceOf(Error);
  });
});
