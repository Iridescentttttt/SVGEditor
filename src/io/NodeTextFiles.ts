import { readFileSync, writeFileSync } from "node:fs";
import type { TextFiles } from "../session/TextFiles.js";

export class NodeTextFiles implements TextFiles {
  read(path: string): string {
    return readFileSync(path, "utf8");
  }

  write(path: string, content: string): void {
    writeFileSync(path, content, "utf8");
  }
}
