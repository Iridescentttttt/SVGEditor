import { Attr } from "./Attr.js";
import { DecimalText } from "./DecimalText.js";
import { EditorError } from "./EditorError.js";
import { PaintStyle } from "./PaintStyle.js";
import type { Restorable } from "./Restorable.js";
import { Shape } from "./Shape.js";
import { SnapshotRestore } from "./SnapshotRestore.js";

export class LineShape extends Shape {
  private readonly paint = new PaintStyle();

  constructor(
    id: string,
    private x1: number,
    private y1: number,
    private x2: number,
    private y2: number,
  ) {
    super(id);
  }

  override typeName(): string {
    return "line";
  }

  override move(dx: number, dy: number): void {
    this.x1 += dx;
    this.y1 += dy;
    this.x2 += dx;
    this.y2 += dy;
  }

  override scale(factor: number): void {
    this.x1 *= factor;
    this.y1 *= factor;
    this.x2 *= factor;
    this.y2 *= factor;
  }

  override validateAttribute(name: string, value: string): void {
    if (name === "x1" || name === "y1" || name === "x2" || name === "y2") {
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
    if (name === "x1") {
      this.x1 = DecimalText.parse(value);
      return;
    }
    if (name === "y1") {
      this.y1 = DecimalText.parse(value);
      return;
    }
    if (name === "x2") {
      this.x2 = DecimalText.parse(value);
      return;
    }
    if (name === "y2") {
      this.y2 = DecimalText.parse(value);
      return;
    }
    if (this.paint.handles(name)) {
      this.paint.set(name, value);
      return;
    }
    throw new EditorError(`error: unknown attribute: ${name}`);
  }

  override formatAssignment(name: string): string {
    if (name === "x1") return `x1=${DecimalText.format(this.x1)}`;
    if (name === "y1") return `y1=${DecimalText.format(this.y1)}`;
    if (name === "x2") return `x2=${DecimalText.format(this.x2)}`;
    if (name === "y2") return `y2=${DecimalText.format(this.y2)}`;
    if (this.paint.handles(name)) return `${name}=${this.paint.get(name) ?? ""}`;
    throw new EditorError(`error: unknown attribute: ${name}`);
  }

  override checkpoint(): Restorable {
    const x1 = this.x1;
    const y1 = this.y1;
    const x2 = this.x2;
    const y2 = this.y2;
    const restorePaint = this.paint.capture();
    return new SnapshotRestore(() => {
      this.x1 = x1;
      this.y1 = y1;
      this.x2 = x2;
      this.y2 = y2;
      restorePaint();
    }, []);
  }

  override treeSummary(): string {
    return `${DecimalText.pair(this.x1, this.y1)} -> ${DecimalText.pair(this.x2, this.y2)}`;
  }

  override showBody(): readonly string[] {
    return [
      `  x1=${DecimalText.format(this.x1)} y1=${DecimalText.format(this.y1)} x2=${DecimalText.format(this.x2)} y2=${DecimalText.format(this.y2)}`,
      ...this.paint.showLines(),
    ];
  }

  override geometryAttributes(): readonly Attr[] {
    return [
      new Attr("x1", DecimalText.format(this.x1)),
      new Attr("y1", DecimalText.format(this.y1)),
      new Attr("x2", DecimalText.format(this.x2)),
      new Attr("y2", DecimalText.format(this.y2)),
    ];
  }

  override paintAttributes(): readonly Attr[] {
    return this.paint.attributes();
  }

  override movedText(_dx: number, _dy: number): string {
    return `line#${this.getId()} moved to ${DecimalText.pair(this.x1, this.y1)} -> ${DecimalText.pair(this.x2, this.y2)}`;
  }

  override movedBackText(_dx: number, _dy: number): string {
    return `line#${this.getId()} moved back to ${DecimalText.pair(this.x1, this.y1)} -> ${DecimalText.pair(this.x2, this.y2)}`;
  }
}
