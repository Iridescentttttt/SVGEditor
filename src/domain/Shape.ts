import type { Attr } from "./Attr.js";
import type { Restorable } from "./Restorable.js";
import type { ShapeContainer } from "./ShapeContainer.js";
import { UngroupPolicy } from "./UngroupPolicy.js";

export abstract class Shape {
  private parent: ShapeContainer | null = null;

  protected constructor(private readonly shapeId: string) {}

  getId(): string {
    return this.shapeId;
  }

  getParent(): ShapeContainer | null {
    return this.parent;
  }

  adoptedBy(parent: ShapeContainer): void {
    this.parent = parent;
  }

  abstract typeName(): string;

  abstract move(dx: number, dy: number): void;

  abstract scale(factor: number): void;

  abstract validateAttribute(name: string, value: string): void;

  abstract setAttribute(name: string, value: string): void;

  abstract formatAssignment(name: string): string;

  abstract checkpoint(): Restorable;

  abstract treeSummary(): string;

  abstract showBody(): readonly string[];

  abstract geometryAttributes(): readonly Attr[];

  abstract paintAttributes(): readonly Attr[];

  extraAttributes(): readonly Attr[] {
    return [];
  }

  annotation(): string {
    return "";
  }

  textContent(): string | null {
    return null;
  }

  isContainer(): boolean {
    return false;
  }

  asContainer(): ShapeContainer | null {
    return null;
  }

  ungroupPolicy(): UngroupPolicy {
    return UngroupPolicy.notContainer;
  }

  nestedShapes(): readonly Shape[] {
    return [];
  }

  collectSelfAndDescendants(into: Shape[]): void {
    into.push(this);
  }

  movedText(dx: number, dy: number): string {
    void dx;
    void dy;
    return `${this.typeName()}#${this.shapeId} moved`;
  }

  movedBackText(dx: number, dy: number): string {
    void dx;
    void dy;
    return `${this.typeName()}#${this.shapeId} moved back`;
  }

  showText(parentLabel: string): string {
    const lines = [`${this.typeName()}#${this.shapeId}  parent=${parentLabel}`, ...this.showBody()];
    return lines.join("\n");
  }
}
