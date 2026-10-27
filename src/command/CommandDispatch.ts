import type { Command } from "./Command.js";

export class CommandDispatch {
  private constructor(
    private readonly kind: "command" | "undo" | "redo",
    private readonly command: Command | null,
  ) {}

  static command(command: Command): CommandDispatch {
    return new CommandDispatch("command", command);
  }

  static undo(): CommandDispatch {
    return new CommandDispatch("undo", null);
  }

  static redo(): CommandDispatch {
    return new CommandDispatch("redo", null);
  }

  isUndo(): boolean {
    return this.kind === "undo";
  }

  isRedo(): boolean {
    return this.kind === "redo";
  }

  getCommand(): Command {
    if (this.command === null) throw new Error("dispatch has no command");
    return this.command;
  }
}
