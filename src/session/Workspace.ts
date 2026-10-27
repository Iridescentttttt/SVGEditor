import type { Document } from "../domain/Document.js";
import { EditorError } from "../domain/EditorError.js";

export class Workspace {
  private document: Document | null = null;
  private path: string | null = null;

  hasDocument(): boolean {
    return this.document !== null;
  }

  requireDocument(): Document {
    if (this.document === null) {
      throw new EditorError("error: no document. use 'init' or 'read' first");
    }
    return this.document;
  }

  replaceDocument(document: Document, path: string | null): void {
    this.document = document;
    this.path = path;
  }

  getPath(): string | null {
    return this.path;
  }

  setPath(path: string): void {
    this.path = path;
  }
}
