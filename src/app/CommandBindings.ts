// 待重构：按名分派。命令名 → 命令对象的唯一登记处。
import { AddToCommand } from "../command/AddToCommand.js";
import { BackCommand } from "../command/BackCommand.js";
import { CanvasCommand } from "../command/CanvasCommand.js";
import { CommandDispatch } from "../command/CommandDispatch.js";
import { CreateCommand } from "../command/CreateCommand.js";
import { DeleteCommand } from "../command/DeleteCommand.js";
import { EditorError } from "../domain/EditorError.js";
import { FrontCommand } from "../command/FrontCommand.js";
import { GroupCommand } from "../command/GroupCommand.js";
import { HelpCommand } from "../command/HelpCommand.js";
import { InitCommand } from "../command/InitCommand.js";
import { MoveCommand } from "../command/MoveCommand.js";
import { ReadCommand } from "../command/ReadCommand.js";
import { SaveCommand } from "../command/SaveCommand.js";
import { ScaleCommand } from "../command/ScaleCommand.js";
import { SetCommand } from "../command/SetCommand.js";
import { ShowCommand } from "../command/ShowCommand.js";
import { TreeCommand } from "../command/TreeCommand.js";
import { UngroupCommand } from "../command/UngroupCommand.js";
import type { ShapeRegistry } from "../domain/ShapeRegistry.js";
import type { SvgLoader } from "../domain/SvgLoader.js";
import type { SvgTextCodec } from "../domain/SvgTextCodec.js";
import type { TextFiles } from "../session/TextFiles.js";
import type { Workspace } from "../session/Workspace.js";

type Parse = (tokens: readonly string[]) => CommandDispatch;

export class CommandBindings {
  private readonly entries: { name: string; usage: string; parse: Parse }[] = [];

  registerBuiltins(
    workspace: Workspace,
    registry: ShapeRegistry,
    files: TextFiles,
    codec: SvgTextCodec,
    loader: SvgLoader,
  ): void {
    this.add("init", InitCommand.usage, (tokens) =>
      CommandDispatch.command(InitCommand.parse(tokens, workspace)),
    );
    this.add("read", ReadCommand.usage, (tokens) =>
      CommandDispatch.command(ReadCommand.parse(tokens, workspace, files, codec, loader)),
    );
    this.add("save", SaveCommand.usage, (tokens) =>
      CommandDispatch.command(SaveCommand.parse(tokens, workspace, files, codec)),
    );
    this.add("canvas", CanvasCommand.usage, (tokens) =>
      CommandDispatch.command(CanvasCommand.parse(tokens, workspace)),
    );
    this.add("create", CreateCommand.usage, (tokens) =>
      CommandDispatch.command(CreateCommand.parse(tokens, workspace, registry)),
    );
    this.add("delete", DeleteCommand.usage, (tokens) =>
      CommandDispatch.command(DeleteCommand.parse(tokens, workspace)),
    );
    this.add("move", MoveCommand.usage, (tokens) =>
      CommandDispatch.command(MoveCommand.parse(tokens, workspace)),
    );
    this.add("scale", ScaleCommand.usage, (tokens) =>
      CommandDispatch.command(ScaleCommand.parse(tokens, workspace)),
    );
    this.add("set", SetCommand.usage, (tokens) =>
      CommandDispatch.command(SetCommand.parse(tokens, workspace)),
    );
    this.add("group", GroupCommand.usage, (tokens) =>
      CommandDispatch.command(GroupCommand.parse(tokens, workspace)),
    );
    this.add("ungroup", UngroupCommand.usage, (tokens) =>
      CommandDispatch.command(UngroupCommand.parse(tokens, workspace)),
    );
    this.add("addto", AddToCommand.usage, (tokens) =>
      CommandDispatch.command(AddToCommand.parse(tokens, workspace)),
    );
    this.add("front", FrontCommand.usage, (tokens) =>
      CommandDispatch.command(FrontCommand.parse(tokens, workspace)),
    );
    this.add("back", BackCommand.usage, (tokens) =>
      CommandDispatch.command(BackCommand.parse(tokens, workspace)),
    );
    this.add("tree", TreeCommand.usage, (tokens) =>
      CommandDispatch.command(TreeCommand.parse(tokens, workspace)),
    );
    this.add("show", ShowCommand.usage, (tokens) =>
      CommandDispatch.command(ShowCommand.parse(tokens, workspace)),
    );
    this.add("help", HelpCommand.usage, (tokens) =>
      CommandDispatch.command(HelpCommand.parse(tokens, this.usages())),
    );
    this.add("undo", "undo", (tokens) => {
      if (tokens.length !== 0) throw new EditorError("error: usage: undo");
      return CommandDispatch.undo();
    });
    this.add("redo", "redo", (tokens) => {
      if (tokens.length !== 0) throw new EditorError("error: usage: redo");
      return CommandDispatch.redo();
    });
  }

  dispatch(tokens: readonly string[]): CommandDispatch {
    if (tokens.length === 0) throw new EditorError("error: unknown command:");
    const name = tokens[0];
    const entry = this.entries.find((item) => item.name === name);
    if (!entry) throw new EditorError(`error: unknown command: ${name}`);
    return entry.parse(tokens.slice(1));
  }

  usages(): readonly string[] {
    return this.entries.map((entry) => entry.usage);
  }

  private add(name: string, usage: string, parse: Parse): void {
    this.entries.push({ name, usage, parse });
  }
}
