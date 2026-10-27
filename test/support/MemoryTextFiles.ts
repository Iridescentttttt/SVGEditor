import type { TextFiles } from "../../src/session/TextFiles.js";

export class MemoryTextFiles implements TextFiles {
  private readonly files = new Map<string, string>();

  seed(path: string, content: string): void {
    this.files.set(path, content);
  }

  read(path: string): string {
    const text = this.files.get(path);
    if (text === undefined) throw new Error(`missing ${path}`);
    return text;
  }

  write(path: string, content: string): void {
    this.files.set(path, content);
  }

  stored(path: string): string | undefined {
    return this.files.get(path);
  }
}
