import type { LoggingProvider } from "./logging/LoggingProvider";

export interface LanguageFileConfiguration {
  language: string;
  file: string;
}

export interface Configuration {
  workingDirectory?: string;
  baseLanguage?: string;
  file?: string;
  files?: LanguageFileConfiguration[];
  modelProvider?: string;
  model?: string;
  apiKey?: string;
  apiUrl?: string;
  charset?: BufferEncoding;
  debug?: boolean;
  loggingProvider?: LoggingProvider;
}
