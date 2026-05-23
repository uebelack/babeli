import { defaultLoggingProvider } from "./DefaultLoggingProvider";

describe("defaultLoggingProvider", () => {
  it("should delegate debug to console.debug", () => {
    const spy = jest.spyOn(console, "debug").mockImplementation(() => {});
    defaultLoggingProvider.debug("test");
    expect(spy).toHaveBeenCalledWith("test");
    spy.mockRestore();
  });

  it("should delegate info to console.info", () => {
    const spy = jest.spyOn(console, "info").mockImplementation(() => {});
    defaultLoggingProvider.info("test");
    expect(spy).toHaveBeenCalledWith("test");
    spy.mockRestore();
  });

  it("should delegate warn to console.warn", () => {
    const spy = jest.spyOn(console, "warn").mockImplementation(() => {});
    defaultLoggingProvider.warn("test");
    expect(spy).toHaveBeenCalledWith("test");
    spy.mockRestore();
  });

  it("should delegate error to console.error", () => {
    const spy = jest.spyOn(console, "error").mockImplementation(() => {});
    defaultLoggingProvider.error("test");
    expect(spy).toHaveBeenCalledWith("test");
    spy.mockRestore();
  });
});
