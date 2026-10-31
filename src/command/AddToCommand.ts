import type { EditResult } from "../domain/EditResult.js";
import { EditorError } from "../domain/EditorError.js";
import type { Workspace } from "../session/Workspace.js";
import { HistoryPolicy } from "./HistoryPolicy.js";
import type { UndoableCommand } from "./UndoableCommand.js";

export class AddToCommand implements UndoableCommand {
  static readonly usage = "addto <gid> <id>";

  private edit: EditResult | null = null;

  static parse(tokens: readonly string[], workspace: Workspace): AddToCommand {
    if (tokens.length !== 2) throw new EditorError(`error: usage: ${AddToCommand.usage}`);
    return new AddToCommand(workspace, tokens[0], tokens[1]);
  }

  private constructor(
    private readonly workspace: Workspace,
    private readonly containerId: string,
    private readonly id: string,
  ) {}

  historyPolicy(): HistoryPolicy {
    return HistoryPolicy.edit;
  }

  execute(): readonly string[] {
    this.edit = this.workspace.requireDocument().addTo(this.containerId, this.id);
    return this.edit.getLines();
  }

  undo(): readonly string[] {
    if (this.edit === null) throw new Error("undo before execute");
    return this.edit.undo();
  }
}
