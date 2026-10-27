import { DecimalText } from "../domain/DecimalText.js";
import type { EditResult } from "../domain/EditResult.js";
import { EditorError } from "../domain/EditorError.js";
import type { Workspace } from "../session/Workspace.js";
import type { HistoryPolicy } from "./Command.js";
import type { UndoableCommand } from "./UndoableCommand.js";

export class ScaleCommand implements UndoableCommand {
  static readonly usage = "scale <id> <factor>";

  private edit: EditResult | null = null;

  static parse(tokens: readonly string[], workspace: Workspace): ScaleCommand {
    if (tokens.length !== 2) throw new EditorError(`error: usage: ${ScaleCommand.usage}`);
    return new ScaleCommand(workspace, tokens[0], DecimalText.parse(tokens[1]));
  }

  private constructor(
    private readonly workspace: Workspace,
    private readonly id: string,
    private readonly factor: number,
  ) {}

  historyPolicy(): HistoryPolicy {
    return "edit";
  }

  execute(): readonly string[] {
    this.edit = this.workspace.requireDocument().scale(this.id, this.factor);
    return this.edit.getLines();
  }

  undo(): readonly string[] {
    if (this.edit === null) throw new Error("undo before execute");
    return this.edit.undo();
  }
}
