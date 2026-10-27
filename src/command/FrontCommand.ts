import type { EditResult } from "../domain/EditResult.js";
import { EditorError } from "../domain/EditorError.js";
import type { Workspace } from "../session/Workspace.js";
import type { HistoryPolicy } from "./Command.js";
import type { UndoableCommand } from "./UndoableCommand.js";

export class FrontCommand implements UndoableCommand {
  static readonly usage = "front <id>";

  private edit: EditResult | null = null;

  static parse(tokens: readonly string[], workspace: Workspace): FrontCommand {
    if (tokens.length !== 1) throw new EditorError(`error: usage: ${FrontCommand.usage}`);
    return new FrontCommand(workspace, tokens[0]);
  }

  private constructor(
    private readonly workspace: Workspace,
    private readonly id: string,
  ) {}

  historyPolicy(): HistoryPolicy {
    return "edit";
  }

  execute(): readonly string[] {
    this.edit = this.workspace.requireDocument().bringToFront(this.id);
    return this.edit.getLines();
  }

  undo(): readonly string[] {
    if (this.edit === null) throw new Error("undo before execute");
    return this.edit.undo();
  }
}
