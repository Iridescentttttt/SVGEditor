import { EditorError } from "../domain/EditorError.js";
import type { Command } from "./Command.js";
import type { HistoryPolicy } from "./Command.js";

export class HelpCommand implements Command {
  static readonly usage = "help";

  static parse(tokens: readonly string[], usages: readonly string[]): HelpCommand {
    if (tokens.length !== 0) throw new EditorError(`error: usage: ${HelpCommand.usage}`);
    return new HelpCommand(usages);
  }

  private constructor(private readonly usages: readonly string[]) {}

  historyPolicy(): HistoryPolicy {
    return "none";
  }

  execute(): readonly string[] {
    return this.usages;
  }
}
