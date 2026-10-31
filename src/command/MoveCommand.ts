import { DecimalText } from "../domain/DecimalText.js";
import type { EditResult } from "../domain/EditResult.js";
import { EditorError } from "../domain/EditorError.js";
import type { Workspace } from "../session/Workspace.js";
import { HistoryPolicy } from "./HistoryPolicy.js";
import type { UndoableCommand } from "./UndoableCommand.js";

export class MoveCommand implements UndoableCommand {
  static readonly usage = "move <id> <dx> <dy>";

  private edit: EditResult | null = null;

  static parse(tokens: readonly string[], workspace: Workspace): MoveCommand {
    if (tokens.length !== 3) throw new EditorError(`error: usage: ${MoveCommand.usage}`);
    return new MoveCommand(workspace, tokens[0], DecimalText.parse(tokens[1]), DecimalText.parse(tokens[2]));
  }

  private constructor(
    private readonly workspace: Workspace,
    private readonly id: string,
    private readonly dx: number,
    private readonly dy: number,
  ) {}

  historyPolicy(): HistoryPolicy {
    return HistoryPolicy.edit;
  }

  execute(): readonly string[] {
    this.edit = this.workspace.requireDocument().move(this.id, this.dx, this.dy);
    return this.edit.getLines();
  }

  undo(): readonly string[] {
    if (this.edit === null) throw new Error("undo before execute");
    return this.edit.undo();
  }
}
