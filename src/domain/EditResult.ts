import type { Restorable } from "./Restorable.js";

export class EditResult {
  constructor(
    private readonly lines: readonly string[],
    private readonly inverse: Restorable,
  ) {}

  getLines(): readonly string[] {
    return this.lines;
  }

  undo(): readonly string[] {
    return this.inverse.restore();
  }
}
