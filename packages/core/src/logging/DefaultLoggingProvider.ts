import type { LoggingProvider } from "./LoggingProvider";

export const defaultLoggingProvider: LoggingProvider = {
  debug: (message) => console.debug(message),
  info: (message) => console.info(message),
  warn: (message) => console.warn(message),
  error: (message) => console.error(message),
};
