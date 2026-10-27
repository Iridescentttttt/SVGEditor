import { Attr } from "./Attr.js";
import { DecimalText } from "./DecimalText.js";
import { EditorError } from "./EditorError.js";
import { PaintStyle } from "./PaintStyle.js";
import type { Restorable } from "./Restorable.js";
import { Shape } from "./Shape.js";
import { SnapshotRestore } from "./SnapshotRestore.js";

export class RectShape extends Shape {
  private readonly paint = new PaintStyle();

  constructor(
    id: string,
    private x: number,
    private y: number,
    private width: number,
    private height: number,
  ) {
    super(id);
  }

  override typeName(): string {
    return "rect";
  }

  override move(dx: number, dy: number): void {
    this.x += dx;
    this.y += dy;
  }

  override scale(factor: number): void {
    this.x *= factor;
    this.y *= factor;
    this.width *= factor;
    this.height *= factor;
  }

  override validateAttribute(name: string, value: string): void {
    if (name === "x" || name === "y" || name === "width" || name === "height") {
      DecimalText.parse(value);
      return;
    }
    if (this.paint.handles(name)) {
      this.paint.validate(name, value);
      return;
    }
    throw new EditorError(`error: unknown attribute: ${name}`);
  }

  override setAttribute(name: string, value: string): void {
    if (name === "x") {
      this.x = DecimalText.parse(value);
      return;
    }
    if (name === "y") {
      this.y = DecimalText.parse(value);
      return;
    }
    if (name === "width") {
      this.width = DecimalText.parse(value);
      return;
    }
    if (name === "height") {
      this.height = DecimalText.parse(value);
      return;
    }
    if (this.paint.handles(name)) {
      this.paint.set(name, value);
      return;
    }
    throw new EditorError(`error: unknown attribute: ${name}`);
  }

  override formatAssignment(name: string): string {
    if (name === "x") return `x=${DecimalText.format(this.x)}`;
    if (name === "y") return `y=${DecimalText.format(this.y)}`;
    if (name === "width") return `width=${DecimalText.format(this.width)}`;
    if (name === "height") return `height=${DecimalText.format(this.height)}`;
    if (this.paint.handles(name)) return `${name}=${this.paint.get(name) ?? ""}`;
    throw new EditorError(`error: unknown attribute: ${name}`);
  }

  override checkpoint(): Restorable {
    const x = this.x;
    const y = this.y;
    const width = this.width;
    const height = this.height;
    const restorePaint = this.paint.capture();
    return new SnapshotRestore(() => {
      this.x = x;
      this.y = y;
      this.width = width;
      this.height = height;
      restorePaint();
    }, []);
  }

  override treeSummary(): string {
    return `x=${DecimalText.format(this.x)} y=${DecimalText.format(this.y)} w=${DecimalText.format(this.width)} h=${DecimalText.format(this.height)}${this.paint.summarySuffix()}`;
  }

  override showBody(): readonly string[] {
    return [
      `  x=${DecimalText.format(this.x)} y=${DecimalText.format(this.y)} width=${DecimalText.format(this.width)} height=${DecimalText.format(this.height)}`,
      ...this.paint.showLines(),
    ];
  }

  override geometryAttributes(): readonly Attr[] {
    return [
      new Attr("x", DecimalText.format(this.x)),
      new Attr("y", DecimalText.format(this.y)),
      new Attr("width", DecimalText.format(this.width)),
      new Attr("height", DecimalText.format(this.height)),
    ];
  }

  override paintAttributes(): readonly Attr[] {
    return this.paint.attributes();
  }

  override movedText(_dx: number, _dy: number): string {
    return `rect#${this.getId()} moved to ${DecimalText.pair(this.x, this.y)}`;
  }

  override movedBackText(_dx: number, _dy: number): string {
    return `rect#${this.getId()} moved back to ${DecimalText.pair(this.x, this.y)}`;
  }
}
