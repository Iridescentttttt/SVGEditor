import { DecimalText } from "../domain/DecimalText.js";
import { Document } from "../domain/Document.js";
import { EditorError } from "../domain/EditorError.js";
import type { Workspace } from "../session/Workspace.js";
import type { Command } from "./Command.js";
import { HistoryPolicy } from "./HistoryPolicy.js";

export class InitCommand implements Command {
  static readonly usage = "init [w] [h]";

  static parse(tokens: readonly string[], workspace: Workspace): InitCommand {
    if (tokens.length === 0) return new InitCommand(workspace, 800, 600);
    if (tokens.length !== 2) throw new EditorError(`error: usage: ${InitCommand.usage}`);
    const width = DecimalText.parse(tokens[0]);
    const height = DecimalText.parse(tokens[1]);
    if (!(width > 0) || !(height > 0)) {
      throw new EditorError("error: canvas size must be positive");
    }
    return new InitCommand(workspace, width, height);
  }

  private constructor(
    private readonly workspace: Workspace,
    private readonly width: number,
    private readonly height: number,
  ) {}

  historyPolicy(): HistoryPolicy {
    return HistoryPolicy.reset;
  }

  execute(): readonly string[] {
    this.workspace.replaceDocument(Document.empty(this.width, this.height), null);
    return [`canvas ${DecimalText.format(this.width)}x${DecimalText.format(this.height)} created`];
  }
}
