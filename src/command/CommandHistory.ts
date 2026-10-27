import { EditorError } from "../domain/EditorError.js";
import type { Command } from "./Command.js";
import type { UndoableCommand } from "./UndoableCommand.js";

export class CommandHistory {
  private readonly undoStack: UndoableCommand[] = [];
  private readonly redoStack: UndoableCommand[] = [];
  private locked = false;

  execute(command: Command): readonly string[] {
    const lines = command.execute();
    const policy = command.historyPolicy();
    if (policy === "edit") {
      this.undoStack.push(command as UndoableCommand);
      this.redoStack.length = 0;
      this.locked = false;
    } else if (policy === "reset") {
      this.undoStack.length = 0;
      this.redoStack.length = 0;
      this.locked = true;
    } else if (policy === "lock") {
      this.redoStack.length = 0;
      this.locked = true;
    }
    return lines;
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
