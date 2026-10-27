import { CliController } from "../../src/app/CliController.js";
import { CommandBindings } from "../../src/app/CommandBindings.js";
import { ShapeBindings } from "../../src/app/ShapeBindings.js";
import { CommandHistory } from "../../src/command/CommandHistory.js";
import { LineTokenizer } from "../../src/cli/LineTokenizer.js";
import { ShapeRegistry } from "../../src/domain/ShapeRegistry.js";
import { SvgLoader } from "../../src/domain/SvgLoader.js";
import { XmlSvgCodec } from "../../src/io/XmlSvgCodec.js";
import { Workspace } from "../../src/session/Workspace.js";
import { MemoryTextFiles } from "./MemoryTextFiles.js";

export class SessionHarness {
  readonly files = new MemoryTextFiles();
  private readonly controller: CliController;

  constructor() {
    const registry = new ShapeRegistry();
    ShapeBindings.registerBuiltins(registry);
    const workspace = new Workspace();
    const history = new CommandHistory();
    const bindings = new CommandBindings();
    const codec = new XmlSvgCodec();
    bindings.registerBuiltins(workspace, registry, this.files, codec, new SvgLoader(registry));
    this.controller = new CliController(new LineTokenizer(), bindings, history, workspace);
  }

  run(line: string): readonly string[] {
    return this.controller.executeLine(line);
  }
}
