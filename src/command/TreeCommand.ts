import { EditorError } from "../domain/EditorError.js";
import type { Workspace } from "../session/Workspace.js";
import type { Command } from "./Command.js";
import { HistoryPolicy } from "./HistoryPolicy.js";

export class TreeCommand implements Command {
  static readonly usage = "tree [id]";

  static parse(tokens: readonly string[], workspace: Workspace): TreeCommand {
    if (tokens.length > 1) throw new EditorError(`error: usage: ${TreeCommand.usage}`);
    return new TreeCommand(workspace, tokens[0] ?? null);
  }

  private constructor(
    private readonly workspace: Workspace,
    private readonly id: string | null,
  ) {}

  historyPolicy(): HistoryPolicy {
    return HistoryPolicy.none;
  }

  execute(): readonly string[] {
    return this.workspace.requireDocument().tree(this.id);
  }
}
