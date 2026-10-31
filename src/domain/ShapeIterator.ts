import type { Shape } from "./Shape.js";
import type { ShapeContainer } from "./ShapeContainer.js";

/** 迭代器：按文档前序逐个取出图形，调用方不接触容器内部数组。 */
export class ShapeIterator {
  private readonly stack: Shape[];

  constructor(root: ShapeContainer) {
    this.stack = [...root.children()].reverse();
  }

  hasNext(): boolean {
    return this.stack.length > 0;
  }

  next(): Shape {
    const shape = this.stack.pop();
    if (!shape) throw new Error("iterator exhausted");
    const nested = shape.asContainer();
    if (nested) {
      this.stack.push(...[...nested.children()].reverse());
    }
    return shape;
  }

  toArray(): Shape[] {
    const shapes: Shape[] = [];
    while (this.hasNext()) shapes.push(this.next());
    return shapes;
  }
}
