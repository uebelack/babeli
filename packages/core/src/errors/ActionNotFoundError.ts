export class ActionNotFoundError extends Error {
  constructor(actionName: string) {
    super("Action " + actionName + " not found");
    this.name = "ActionNotFoundError";
  }
}
