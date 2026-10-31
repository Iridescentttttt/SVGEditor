import type { EditResult } from "../domain/EditResult.js";
import { EditorError } from "../domain/EditorError.js";
import type { Workspace } from "../session/Workspace.js";
import { HistoryPolicy } from "./HistoryPolicy.js";
import type { UndoableCommand } from "./UndoableCommand.js";

export class UngroupCommand implements UndoableCommand {
  static readonly usage = "ungroup <gid>";

  private edit: EditResult | null = null;

  static parse(tokens: readonly string[], workspace: Workspace): UngroupCommand {
    if (tokens.length !== 1) throw new EditorError(`error: usage: ${UngroupCommand.usage}`);
    return new UngroupCommand(workspace, tokens[0]);
  }

  private constructor(
    private readonly workspace: Workspace,
    private readonly id: string,
  ) {}

  historyPolicy(): HistoryPolicy {
    return HistoryPolicy.edit;
  }

  execute(): readonly string[] {
    this.edit = this.workspace.requireDocument().ungroup(this.id);
    return this.edit.getLines();
  }

  undo(): readonly string[] {
    if (this.edit === null) throw new Error("undo before execute");
    return this.edit.undo();
  }
}
