import { run } from "./index";

vi.mock("./index", () => ({ run: vi.fn<typeof run>() }));

describe("main", () => {
  it("should run the CLI with the process arguments and exit with its code", async () => {
    vi.mocked(run).mockResolvedValue(3);
    const argv = vi.spyOn(process, "argv", "get").mockReturnValue(["node", "babeli", "validate"]);
    const exit = vi.spyOn(process, "exit").mockImplementation(() => undefined as never);

    try {
      await import("./main");

      await vi.waitFor(() => expect(exit).toHaveBeenCalledWith(3));
      expect(run).toHaveBeenCalledWith(["validate"]);
    } finally {
      argv.mockRestore();
      exit.mockRestore();
    }
  });
});
