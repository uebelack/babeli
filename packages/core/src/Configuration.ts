import type { LoggingProvider } from "./logging/LoggingProvider";

export interface Configuration {
  workingDirectory?: string;
  baseLanguage?: string;
  modelProvider?: string;
  model?: string;
  apiKey?: string;
  apiUrl?: string;
  debug?: boolean;
  loggingProvider?: LoggingProvider;
}
