import { EditorError } from "../domain/EditorError.js";
import type { Command } from "./Command.js";
import type { HistoryLedger } from "./HistoryPolicy.js";
import type { UndoableCommand } from "./UndoableCommand.js";

export class CommandHistory implements HistoryLedger {
  private readonly undoStack: UndoableCommand[] = [];
  private readonly redoStack: UndoableCommand[] = [];
  private locked = false;

  execute(command: Command): readonly string[] {
    const lines = command.execute();
    command.historyPolicy().apply(this, command);
    return lines;
  }

  recordEdit(command: UndoableCommand): void {
    this.undoStack.push(command);
    this.redoStack.length = 0;
    this.locked = false;
  }

  recordReset(): void {
    this.undoStack.length = 0;
    this.redoStack.length = 0;
    this.locked = true;
  }

  recordLock(): void {
    this.redoStack.length = 0;
    this.locked = true;
  }

  undo(): readonly string[] {
    if (this.locked) {
      throw new EditorError("error: undo not allowed after io command");
    }
    const command = this.undoStack.pop();
    if (!command) throw new EditorError("error: nothing to undo");
    try {
      const lines = command.undo();
      this.redoStack.push(command);
      return lines;
    } catch (error) {
      this.undoStack.push(command);
      throw error;
    }
  }

  redo(): readonly string[] {
    if (this.locked) {
      throw new EditorError("error: undo not allowed after io command");
    }
    const command = this.redoStack.pop();
    if (!command) throw new EditorError("error: nothing to redo");
    try {
      const lines = command.execute();
      this.undoStack.push(command);
      return lines;
    } catch (error) {
      this.redoStack.push(command);
      throw error;
    }
  }
}
