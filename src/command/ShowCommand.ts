import { EditorError } from "../domain/EditorError.js";
import type { Workspace } from "../session/Workspace.js";
import type { Command } from "./Command.js";
import { HistoryPolicy } from "./HistoryPolicy.js";

export class ShowCommand implements Command {
  static readonly usage = "show <id>";

  static parse(tokens: readonly string[], workspace: Workspace): ShowCommand {
    if (tokens.length !== 1) throw new EditorError(`error: usage: ${ShowCommand.usage}`);
    return new ShowCommand(workspace, tokens[0]);
  }

  private constructor(
    private readonly workspace: Workspace,
    private readonly id: string,
  ) {}

  historyPolicy(): HistoryPolicy {
    return HistoryPolicy.none;
  }

  execute(): readonly string[] {
    return this.workspace.requireDocument().show(this.id);
  }
}
