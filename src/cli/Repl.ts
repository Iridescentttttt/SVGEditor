import * as readline from "node:readline";
import type { SessionController } from "./SessionController.js";
import type { TextSink } from "./TextSink.js";

export class Repl {
  constructor(
    private readonly controller: SessionController,
    private readonly sink: TextSink,
    private readonly input: NodeJS.ReadableStream = process.stdin,
    private readonly output: NodeJS.WritableStream = process.stdout,
  ) {}

  start(): void {
    this.sink.writeLine("svg-editor 0.1 — type 'help' for commands");
    const reader = readline.createInterface({
      input: this.input,
      output: this.output,
      prompt: "svg> ",
    });
    reader.prompt();
    reader.on("line", (line) => {
      for (const item of this.controller.executeLine(line)) {
        this.sink.writeLine(item);
      }
      reader.prompt();
    });
  }
}
