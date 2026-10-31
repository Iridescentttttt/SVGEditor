import type { CommandBindings } from "./CommandBindings.js";
import type { CommandHistory } from "../command/CommandHistory.js";
import { EditorError } from "../domain/EditorError.js";
import type { LineTokenizer } from "../cli/LineTokenizer.js";
import type { SessionController } from "../cli/SessionController.js";
import { TokenError } from "../cli/TokenError.js";
import type { Workspace } from "../session/Workspace.js";

/** 外观：一行文本进入编辑器的唯一入口，REPL 不接触文档和命令。 */
export class CliController implements SessionController {
  constructor(
    private readonly tokenizer: LineTokenizer,
    private readonly bindings: CommandBindings,
    private readonly history: CommandHistory,
    private readonly workspace: Workspace,
  ) {}

  executeLine(line: string): readonly string[] {
    try {
      const parsed = this.tokenizer.tokenize(line);
      if (parsed.isIgnorable()) return [];
      const action = this.bindings.dispatch(parsed.getTokens());
      if (action.isUndo()) return this.historyStep("undo");
      if (action.isRedo()) return this.historyStep("redo");
      return this.history.execute(action.getCommand());
    } catch (error) {
      if (error instanceof EditorError || error instanceof TokenError) return [error.message];
      throw error;
    }
  }

  private historyStep(kind: "undo" | "redo"): readonly string[] {
    if (!this.workspace.hasDocument()) {
      throw new EditorError("error: no document. use 'init' or 'read' first");
    }
    return kind === "undo" ? this.history.undo() : this.history.redo();
  }
}
