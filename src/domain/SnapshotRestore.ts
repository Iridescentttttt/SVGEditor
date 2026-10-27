import type { Restorable } from "./Restorable.js";

export class SnapshotRestore implements Restorable {
  constructor(
    private readonly apply: () => void,
    private readonly lines: readonly string[],
  ) {}

  restore(): readonly string[] {
    this.apply();
    return this.lines;
  }
}
