import * as path from "path";

export function relativePath(
  workingDirectory: string,
  filePath: string,
): string {
  return path.relative(workingDirectory, filePath);
}
