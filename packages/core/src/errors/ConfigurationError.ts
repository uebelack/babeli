export class ConfigurationError extends Error {
  constructor(message: string, cause?: unknown) {
    super(message, { cause });
    this.name = "ConfigurationError";
  }
}
