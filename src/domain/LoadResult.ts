import type { Document } from "./Document.js";

export class LoadResult {
  constructor(
    private readonly document: Document,
    private readonly warnings: readonly string[],
  ) {}

  getDocument(): Document {
    return this.document;
  }

  getWarnings(): readonly string[] {
    return this.warnings;
  }
}
