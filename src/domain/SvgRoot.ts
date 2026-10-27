import { EditorError } from "./EditorError.js";
import type { Shape } from "./Shape.js";
import type { ShapeContainer } from "./ShapeContainer.js";

export class SvgRoot implements ShapeContainer {
  private readonly items: Shape[] = [];

  constructor(
    private width: number,
    private height: number,
  ) {}

  getWidth(): number {
    return this.width;
  }

  getHeight(): number {
    return this.height;
  }

  resize(width: number, height: number): void {
    this.width = width;
    this.height = height;
  }

  children(): readonly Shape[] {
    return this.items;
  }

  insert(index: number, shape: Shape): void {
    if (index < 0 || index > this.items.length) {
      throw new EditorError("error: invalid svg: bad child index");
    }
    this.items.splice(index, 0, shape);
    shape.adoptedBy(this);
  }

  remove(shape: Shape): number {
    const index = this.items.indexOf(shape);
    if (index < 0) {
      throw new Error(`shape ${shape.getId()} is not on the canvas`);
    }
    this.items.splice(index, 1);
    return index;
  }

  owningShape(): Shape | null {
    return null;
  }
}
