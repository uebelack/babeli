import { Logger } from "./Logger";
import type { Configuration } from "../Configuration";
import type { LoggingProvider } from "./LoggingProvider";

describe("Logger", () => {
  let messages: { level: string; message: string }[];
  let mockProvider: LoggingProvider;

  beforeEach(() => {
    messages = [];
    mockProvider = {
      debug: (msg) => messages.push({ level: "debug", message: msg }),
      info: (msg) => messages.push({ level: "info", message: msg }),
      warn: (msg) => messages.push({ level: "warn", message: msg }),
      error: (msg) => messages.push({ level: "error", message: msg }),
    };
  });

  it("should log info messages", () => {
    const logger = new Logger({ loggingProvider: mockProvider });
    logger.info("hello");
    expect(messages).toEqual([{ level: "info", message: "hello" }]);
  });

  it("should log warn messages", () => {
    const logger = new Logger({ loggingProvider: mockProvider });
    logger.warn("warning");
    expect(messages).toEqual([{ level: "warn", message: "warning" }]);
  });

  it("should log error messages", () => {
    const logger = new Logger({ loggingProvider: mockProvider });
    logger.error("failure");
    expect(messages).toEqual([{ level: "error", message: "failure" }]);
  });

  it("should log debug messages when debug is enabled", () => {
    const logger = new Logger({
      debug: true,
      loggingProvider: mockProvider,
    });
    logger.debug("debug msg");
    expect(messages).toEqual([{ level: "debug", message: "debug msg" }]);
  });

  it("should not log debug messages when debug is disabled", () => {
    const logger = new Logger({
      debug: false,
      loggingProvider: mockProvider,
    });
    logger.debug("debug msg");
    expect(messages).toEqual([]);
  });

  it("should not log debug messages when debug is undefined", () => {
    const logger = new Logger({ loggingProvider: mockProvider });
    logger.debug("debug msg");
    expect(messages).toEqual([]);
  });

  it("should use default logging provider when none is configured", () => {
    const config: Configuration = {};
    const logger = new Logger(config);
    const spy = jest.spyOn(console, "info").mockImplementation(() => {});
    logger.info("test");
    expect(spy).toHaveBeenCalledWith("test");
    spy.mockRestore();
  });
});
