import type { Configuration } from "../Configuration";
import { defaultLoggingProvider } from "./DefaultLoggingProvider";

export class Logger {
  private readonly configuration: Configuration;

  constructor(configuration: Configuration) {
    this.configuration = configuration;
  }

  private get provider() {
    return this.configuration.loggingProvider ?? defaultLoggingProvider;
  }

  debug(message: string): void {
    if (this.configuration.debug) {
      this.provider.debug(message);
    }
  }

  info(message: string): void {
    this.provider.info(message);
  }

  warn(message: string): void {
    this.provider.warn(message);
  }

  error(message: string): void {
    this.provider.error(message);
  }
}
