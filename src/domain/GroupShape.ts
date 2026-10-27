import { Attr } from "./Attr.js";
import { DecimalText } from "./DecimalText.js";
import { EditorError } from "./EditorError.js";
import type { Restorable } from "./Restorable.js";
import { Shape } from "./Shape.js";
import type { ShapeContainer } from "./ShapeContainer.js";
import { SnapshotRestore } from "./SnapshotRestore.js";
import { UngroupPolicy } from "./UngroupPolicy.js";

export class GroupShape extends Shape implements ShapeContainer {
  private readonly items: Shape[] = [];

  constructor(id: string) {
    super(id);
  }

  override typeName(): string {
    return "g";
  }

  override isContainer(): boolean {
    return true;
  }

  override asContainer(): ShapeContainer {
    return this;
  }

  override ungroupPolicy(): UngroupPolicy {
    return UngroupPolicy.allowed;
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
      throw new Error(`shape ${shape.getId()} is not in g#${this.getId()}`);
    }
    this.items.splice(index, 1);
    return index;
  }

  owningShape(): Shape {
    return this;
  }

  override nestedShapes(): readonly Shape[] {
    return this.items;
  }

  override collectSelfAndDescendants(into: Shape[]): void {
    into.push(this);
    for (const child of this.items) {
      child.collectSelfAndDescendants(into);
    }
  }

  override move(dx: number, dy: number): void {
    for (const child of this.items) {
      child.move(dx, dy);
    }
  }

  override scale(factor: number): void {
    for (const child of this.items) {
      child.scale(factor);
    }
  }

  override validateAttribute(name: string, _value: string): void {
    throw new EditorError(`error: unknown attribute: ${name}`);
  }

  override setAttribute(name: string, _value: string): void {
    throw new EditorError(`error: unknown attribute: ${name}`);
  }

  override formatAssignment(name: string): string {
    throw new EditorError(`error: unknown attribute: ${name}`);
  }

  override checkpoint(): Restorable {
    const points = this.items.map((child) => child.checkpoint());
    return new SnapshotRestore(() => {
      for (const point of points) {
        point.restore();
      }
    }, []);
  }

  override treeSummary(): string {
    return "";
  }

  override showBody(): readonly string[] {
    return [];
  }

  override geometryAttributes(): readonly Attr[] {
    return [];
  }

  override paintAttributes(): readonly Attr[] {
    return [];
  }

  override movedText(dx: number, dy: number): string {
    return `g#${this.getId()} moved by ${DecimalText.pair(dx, dy)}`;
  }

  override movedBackText(dx: number, dy: number): string {
    return `g#${this.getId()} moved back by ${DecimalText.pair(-dx, -dy)}`;
  }
}
