import type { EditResult } from "../domain/EditResult.js";
import { EditorError } from "../domain/EditorError.js";
import type { Workspace } from "../session/Workspace.js";
import type { HistoryPolicy } from "./Command.js";
import type { UndoableCommand } from "./UndoableCommand.js";

export class GroupCommand implements UndoableCommand {
  static readonly usage = "group <newGid> <id1> <id2>…";

  private edit: EditResult | null = null;

  static parse(tokens: readonly string[], workspace: Workspace): GroupCommand {
    if (tokens.length < 3) throw new EditorError(`error: usage: ${GroupCommand.usage}`);
    return new GroupCommand(workspace, tokens[0], tokens.slice(1));
  }

  private constructor(
    private readonly workspace: Workspace,
    private readonly newId: string,
    private readonly memberIds: readonly string[],
  ) {}

  historyPolicy(): HistoryPolicy {
    return "edit";
  }

  execute(): readonly string[] {
    this.edit = this.workspace.requireDocument().group(this.newId, this.memberIds);
    return this.edit.getLines();
  }

  undo(): readonly string[] {
    if (this.edit === null) throw new Error("undo before execute");
    return this.edit.undo();
  }
}
