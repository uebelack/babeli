import { relativePath } from "./relativePath";

describe("relativePath", () => {
  it("should return relative path from working directory", () => {
    expect(
      relativePath("/home/user/project", "/home/user/project/src/file.ts"),
    ).toBe("src/file.ts");
  });

  it("should handle same directory", () => {
    expect(relativePath("/home/user", "/home/user/file.ts")).toBe("file.ts");
  });

  it("should handle parent directory traversal", () => {
    expect(relativePath("/home/user/a", "/home/user/b/file.ts")).toBe(
      "../b/file.ts",
    );
  });
});
