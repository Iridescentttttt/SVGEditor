import { DecimalText } from "../domain/DecimalText.js";
import { EditorError } from "../domain/EditorError.js";
import type { Workspace } from "../session/Workspace.js";
import type { Command } from "./Command.js";
import type { HistoryPolicy } from "./Command.js";

export class CanvasCommand implements Command {
  static readonly usage = "canvas [w] [h]";

  static parse(tokens: readonly string[], workspace: Workspace): CanvasCommand {
    if (tokens.length === 0) return new CanvasCommand(workspace, null, null);
    if (tokens.length !== 2) throw new EditorError(`error: usage: ${CanvasCommand.usage}`);
    const width = DecimalText.parse(tokens[0]);
    const height = DecimalText.parse(tokens[1]);
    if (!(width > 0) || !(height > 0)) {
      throw new EditorError("error: canvas size must be positive");
    }
    return new CanvasCommand(workspace, width, height);
  }

  private constructor(
    private readonly workspace: Workspace,
    private readonly width: number | null,
    private readonly height: number | null,
  ) {}

  historyPolicy(): HistoryPolicy {
    return this.width === null ? "none" : "lock";
  }

  execute(): readonly string[] {
    const document = this.workspace.requireDocument();
    if (this.width === null || this.height === null) {
      const root = document.getRoot();
      return [`canvas ${DecimalText.format(root.getWidth())}x${DecimalText.format(root.getHeight())}`];
    }
    document.resize(this.width, this.height);
    return [`canvas resized to ${DecimalText.format(this.width)}x${DecimalText.format(this.height)}`];
  }
}
