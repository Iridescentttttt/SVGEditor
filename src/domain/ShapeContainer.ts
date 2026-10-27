import type { Shape } from "./Shape.js";

export interface ShapeContainer {
  children(): readonly Shape[];
  insert(index: number, shape: Shape): void;
  remove(shape: Shape): number;
  owningShape(): Shape | null;
}
