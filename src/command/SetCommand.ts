import type { EditResult } from "../domain/EditResult.js";
import { EditorError } from "../domain/EditorError.js";
import type { Workspace } from "../session/Workspace.js";
import { HistoryPolicy } from "./HistoryPolicy.js";
import type { UndoableCommand } from "./UndoableCommand.js";

export class SetCommand implements UndoableCommand {
  static readonly usage = "set <id> <attr> <value>";

  private edit: EditResult | null = null;

  static parse(tokens: readonly string[], workspace: Workspace): SetCommand {
    if (tokens.length !== 3) throw new EditorError(`error: usage: ${SetCommand.usage}`);
    return new SetCommand(workspace, tokens[0], tokens[1], tokens[2]);
  }

  private constructor(
    private readonly workspace: Workspace,
    private readonly id: string,
    private readonly name: string,
    private readonly value: string,
  ) {}

  historyPolicy(): HistoryPolicy {
    return HistoryPolicy.edit;
  }

  execute(): readonly string[] {
    this.edit = this.workspace.requireDocument().setAttribute(this.id, this.name, this.value);
    return this.edit.getLines();
  }

  undo(): readonly string[] {
    if (this.edit === null) throw new Error("undo before execute");
    return this.edit.undo();
  }
}
