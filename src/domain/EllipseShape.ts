import { Attr } from "./Attr.js";
import { DecimalText } from "./DecimalText.js";
import { EditorError } from "./EditorError.js";
import { PaintStyle } from "./PaintStyle.js";
import type { Restorable } from "./Restorable.js";
import { Shape } from "./Shape.js";
import { SnapshotRestore } from "./SnapshotRestore.js";

export class EllipseShape extends Shape {
  private readonly paint = new PaintStyle();

  constructor(
    id: string,
    private cx: number,
    private cy: number,
    private rx: number,
    private ry: number,
  ) {
    super(id);
  }

  override typeName(): string {
    return "ellipse";
  }

  override move(dx: number, dy: number): void {
    this.cx += dx;
    this.cy += dy;
  }

  override scale(factor: number): void {
    this.cx *= factor;
    this.cy *= factor;
    this.rx *= factor;
    this.ry *= factor;
  }

  override validateAttribute(name: string, value: string): void {
    if (name === "cx" || name === "cy" || name === "rx" || name === "ry") {
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
    if (name === "cx") {
      this.cx = DecimalText.parse(value);
      return;
    }
    if (name === "cy") {
      this.cy = DecimalText.parse(value);
      return;
    }
    if (name === "rx") {
      this.rx = DecimalText.parse(value);
      return;
    }
    if (name === "ry") {
      this.ry = DecimalText.parse(value);
      return;
    }
    if (this.paint.handles(name)) {
      this.paint.set(name, value);
      return;
    }
    throw new EditorError(`error: unknown attribute: ${name}`);
  }

  override formatAssignment(name: string): string {
    if (name === "cx") return `cx=${DecimalText.format(this.cx)}`;
    if (name === "cy") return `cy=${DecimalText.format(this.cy)}`;
    if (name === "rx") return `rx=${DecimalText.format(this.rx)}`;
    if (name === "ry") return `ry=${DecimalText.format(this.ry)}`;
    if (this.paint.handles(name)) return `${name}=${this.paint.get(name) ?? ""}`;
    throw new EditorError(`error: unknown attribute: ${name}`);
  }

  override checkpoint(): Restorable {
    const cx = this.cx;
    const cy = this.cy;
    const rx = this.rx;
    const ry = this.ry;
    const restorePaint = this.paint.capture();
    return new SnapshotRestore(() => {
      this.cx = cx;
      this.cy = cy;
      this.rx = rx;
      this.ry = ry;
      restorePaint();
    }, []);
  }

  override treeSummary(): string {
    return `cx=${DecimalText.format(this.cx)} cy=${DecimalText.format(this.cy)} rx=${DecimalText.format(this.rx)} ry=${DecimalText.format(this.ry)}${this.paint.summarySuffix()}`;
  }

  override showBody(): readonly string[] {
    return [
      `  cx=${DecimalText.format(this.cx)} cy=${DecimalText.format(this.cy)} rx=${DecimalText.format(this.rx)} ry=${DecimalText.format(this.ry)}`,
      ...this.paint.showLines(),
    ];
  }

  override geometryAttributes(): readonly Attr[] {
    return [
      new Attr("cx", DecimalText.format(this.cx)),
      new Attr("cy", DecimalText.format(this.cy)),
      new Attr("rx", DecimalText.format(this.rx)),
      new Attr("ry", DecimalText.format(this.ry)),
    ];
  }

  override paintAttributes(): readonly Attr[] {
    return this.paint.attributes();
  }

  override movedText(_dx: number, _dy: number): string {
    return `ellipse#${this.getId()} moved to ${DecimalText.pair(this.cx, this.cy)}`;
  }

  override movedBackText(_dx: number, _dy: number): string {
    return `ellipse#${this.getId()} moved back to ${DecimalText.pair(this.cx, this.cy)}`;
  }
}
