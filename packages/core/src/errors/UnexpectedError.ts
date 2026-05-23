export class UnexpectedError extends Error {
  constructor(message: string, cause?: unknown) {
    super(message, { cause });
    this.name = "UnexpectedError";
  }
}
