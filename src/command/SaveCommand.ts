import { EditorError } from "../domain/EditorError.js";
import type { SvgTextCodec } from "../domain/SvgTextCodec.js";
import type { TextFiles } from "../session/TextFiles.js";
import type { Workspace } from "../session/Workspace.js";
import type { Command } from "./Command.js";
import type { HistoryPolicy } from "./Command.js";

export class SaveCommand implements Command {
  static readonly usage = "save [file.svg]";

  static parse(
    tokens: readonly string[],
    workspace: Workspace,
    files: TextFiles,
    codec: SvgTextCodec,
  ): SaveCommand {
    if (tokens.length > 1) throw new EditorError(`error: usage: ${SaveCommand.usage}`);
    return new SaveCommand(workspace, files, codec, tokens[0] ?? null);
  }

  private constructor(
    private readonly workspace: Workspace,
    private readonly files: TextFiles,
    private readonly codec: SvgTextCodec,
    private readonly pathArg: string | null,
  ) {}

  historyPolicy(): HistoryPolicy {
    return "lock";
  }

  execute(): readonly string[] {
    const document = this.workspace.requireDocument();
    const path = this.pathArg ?? this.workspace.getPath();
    if (path === null || path.length === 0) {
      throw new EditorError("error: no file path. use 'save <file.svg>'");
    }
    const text = this.codec.format(document);
    try {
      this.files.write(path, text);
    } catch {
      throw new EditorError(`error: cannot write file: ${path}`);
    }
    this.workspace.setPath(path);
    return [`saved to ${path} (${document.elementCount()} elements)`];
  }
}
