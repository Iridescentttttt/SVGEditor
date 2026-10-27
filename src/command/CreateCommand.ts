import type { EditResult } from "../domain/EditResult.js";
import { EditorError } from "../domain/EditorError.js";
import type { ShapeRegistry } from "../domain/ShapeRegistry.js";
import type { Workspace } from "../session/Workspace.js";
import type { HistoryPolicy } from "./Command.js";
import type { UndoableCommand } from "./UndoableCommand.js";

export class CreateCommand implements UndoableCommand {
  static readonly usage = "create <type> <id> [params…] [in <containerId>]";

  private edit: EditResult | null = null;

  static parse(tokens: readonly string[], workspace: Workspace, registry: ShapeRegistry): CreateCommand {
    if (tokens.length < 2) throw new EditorError(`error: usage: ${CreateCommand.usage}`);
    const typeName = tokens[0];
    const id = tokens[1];
    let args = tokens.slice(2);
    let parentId: string | null = null;
    if (args.length >= 2 && args[args.length - 2] === "in") {
      parentId = args[args.length - 1];
      args = args.slice(0, -2);
    }
    return new CreateCommand(workspace, registry, typeName, id, args, parentId);
  }

  private constructor(
    private readonly workspace: Workspace,
    private readonly registry: ShapeRegistry,
    private readonly typeName: string,
    private readonly id: string,
    private readonly args: readonly string[],
    private readonly parentId: string | null,
  ) {}

  historyPolicy(): HistoryPolicy {
    return "edit";
  }

  execute(): readonly string[] {
    const document = this.workspace.requireDocument();
    const parent =
      this.parentId === null ? document.getRoot() : document.requireContainer(this.parentId);
    const provider = this.registry.byName(this.typeName);
    if (!provider) {
      throw new EditorError(`error: unknown shape type: ${this.typeName} (is the plugin loaded?)`);
    }
    if (document.hasId(this.id)) {
      throw new EditorError(`error: id already exists: ${this.id}`);
    }
    const shape = provider.create(this.id, this.args);
    this.edit = document.attachNew(shape, parent);
    return this.edit.getLines();
  }

  undo(): readonly string[] {
    if (this.edit === null) throw new Error("undo before execute");
    return this.edit.undo();
  }
}
