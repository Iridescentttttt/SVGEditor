import type { Shape } from "./Shape.js";

export class ReadPiece {
  constructor(
    private readonly shape: Shape,
    private readonly warnings: readonly string[],
  ) {}

  getShape(): Shape {
    return this.shape;
  }

  getWarnings(): readonly string[] {
    return this.warnings;
  }
}
