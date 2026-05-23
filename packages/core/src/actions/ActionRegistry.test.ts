import { ActionRegistry } from "./ActionRegistry";
import { ActionNotFoundError } from "../errors/ActionNotFoundError";
import { MissingAction } from "./MissingAction";
import { SortAction } from "./SortAction";
import type { Configuration } from "../Configuration";

describe("ActionRegistry", () => {
  beforeEach(() => {
    ActionRegistry.reset();
  });

  it("should have missing and sort actions registered by default", () => {
    const names = ActionRegistry.getActionNames();
    expect(names.has("missing")).toBe(true);
    expect(names.has("sort")).toBe(true);
  });

  it("should create a MissingAction", () => {
    const config: Configuration = {};
    const action = ActionRegistry.createAction("missing", config);
    expect(action).toBeInstanceOf(MissingAction);
  });

  it("should create a SortAction", () => {
    const config: Configuration = {};
    const action = ActionRegistry.createAction("sort", config);
    expect(action).toBeInstanceOf(SortAction);
  });

  it("should throw ActionNotFoundError for unknown action", () => {
    const config: Configuration = {};
    expect(() => ActionRegistry.createAction("unknown", config)).toThrow(
      ActionNotFoundError,
    );
    expect(() => ActionRegistry.createAction("unknown", config)).toThrow(
      "Action unknown not found",
    );
  });

  it("should allow registering custom actions", () => {
    ActionRegistry.registerAction("custom", () => ({
      validateSingleLanguageFiles: () => [],
      updateSingleLanguageFiles: async (files) => files,
      validateMultiLanguageFile: () => [],
      updateMultiLanguageFile: async (file) => file,
    }));

    expect(ActionRegistry.getActionNames().has("custom")).toBe(true);
    const action = ActionRegistry.createAction("custom", {});
    expect(action).toBeDefined();
  });

  it("should restore default actions after reset", () => {
    ActionRegistry.registerAction("custom", () => ({
      validateSingleLanguageFiles: () => [],
      updateSingleLanguageFiles: async (files) => files,
      validateMultiLanguageFile: () => [],
      updateMultiLanguageFile: async (file) => file,
    }));

    ActionRegistry.reset();

    expect(ActionRegistry.getActionNames().has("custom")).toBe(false);
    expect(ActionRegistry.getActionNames().has("missing")).toBe(true);
    expect(ActionRegistry.getActionNames().has("sort")).toBe(true);

    const config: Configuration = {};
    expect(ActionRegistry.createAction("missing", config)).toBeInstanceOf(
      MissingAction,
    );
    expect(ActionRegistry.createAction("sort", config)).toBeInstanceOf(
      SortAction,
    );
  });
});
