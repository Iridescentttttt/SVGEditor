import type { TextSink } from "./TextSink.js";

export class ConsoleSink implements TextSink {
  writeLine(line: string): void {
    console.log(line);
  }
}
