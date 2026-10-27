import { CommandBindings } from "./CommandBindings.js";
import { CliController } from "./CliController.js";
import { ShapeBindings } from "./ShapeBindings.js";
import { CommandHistory } from "../command/CommandHistory.js";
import { ConsoleSink } from "../cli/ConsoleSink.js";
import { LineTokenizer } from "../cli/LineTokenizer.js";
import { Repl } from "../cli/Repl.js";
import { ShapeRegistry } from "../domain/ShapeRegistry.js";
import { SvgLoader } from "../domain/SvgLoader.js";
import { NodeTextFiles } from "../io/NodeTextFiles.js";
import { XmlSvgCodec } from "../io/XmlSvgCodec.js";
import { Workspace } from "../session/Workspace.js";

export class Main {
  static start(): void {
    const registry = new ShapeRegistry();
    ShapeBindings.registerBuiltins(registry);
    const files = new NodeTextFiles();
    const codec = new XmlSvgCodec();
    const loader = new SvgLoader(registry);
    const workspace = new Workspace();
    const history = new CommandHistory();
    const bindings = new CommandBindings();
    bindings.registerBuiltins(workspace, registry, files, codec, loader);
    const controller = new CliController(new LineTokenizer(), bindings, history, workspace);
    new Repl(controller, new ConsoleSink()).start();
  }
}

Main.start();
