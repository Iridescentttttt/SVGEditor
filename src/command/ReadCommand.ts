import { EditorError } from "../domain/EditorError.js";
import type { SvgLoader } from "../domain/SvgLoader.js";
import type { SvgTextCodec } from "../domain/SvgTextCodec.js";
import type { TextFiles } from "../session/TextFiles.js";
import type { Workspace } from "../session/Workspace.js";
import type { Command } from "./Command.js";
import { HistoryPolicy } from "./HistoryPolicy.js";

export class ReadCommand implements Command {
  static readonly usage = "read <file.svg>";

  static parse(
    tokens: readonly string[],
    workspace: Workspace,
    files: TextFiles,
    codec: SvgTextCodec,
    loader: SvgLoader,
  ): ReadCommand {
    if (tokens.length !== 1) throw new EditorError(`error: usage: ${ReadCommand.usage}`);
    return new ReadCommand(workspace, files, codec, loader, tokens[0]);
  }

  private constructor(
    private readonly workspace: Workspace,
    private readonly files: TextFiles,
    private readonly codec: SvgTextCodec,
    private readonly loader: SvgLoader,
    private readonly path: string,
  ) {}

  historyPolicy(): HistoryPolicy {
    return HistoryPolicy.reset;
  }

  execute(): readonly string[] {
    let text: string;
    try {
      text = this.files.read(this.path);
    } catch {
      throw new EditorError(`error: cannot read file: ${this.path}`);
    }
    const loaded = this.loader.load(this.codec.parse(text));
    this.workspace.replaceDocument(loaded.getDocument(), this.path);
    return [...loaded.getWarnings(), `read ${this.path} (${loaded.getDocument().elementCount()} elements)`];
  }
}
