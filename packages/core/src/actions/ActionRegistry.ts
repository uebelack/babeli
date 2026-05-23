import type { Action } from "./Action";
import type { Configuration } from "../Configuration";
import { ActionNotFoundError } from "../errors/ActionNotFoundError";
import { MissingAction } from "./MissingAction";
import { SortAction } from "./SortAction";

type ActionFactory = (configuration: Configuration) => Action;

const actionFactories = new Map<string, ActionFactory>();

function registerDefaults(): void {
  actionFactories.set(
    MissingAction.NAME,
    (config) => new MissingAction(config),
  );
  actionFactories.set(SortAction.NAME, (config) => new SortAction(config));
}

registerDefaults();

export const ActionRegistry = {
  registerAction(name: string, factory: ActionFactory): void {
    actionFactories.set(name, factory);
  },

  getActionNames(): Set<string> {
    return new Set(actionFactories.keys());
  },

  createAction(name: string, configuration: Configuration): Action {
    const factory = actionFactories.get(name);
    if (!factory) {
      throw new ActionNotFoundError(name);
    }
    return factory(configuration);
  },

  reset(): void {
    actionFactories.clear();
    registerDefaults();
  },
};
