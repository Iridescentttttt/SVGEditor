import { Attr } from "./Attr.js";
import { DecimalText } from "./DecimalText.js";
import { EditorError } from "./EditorError.js";
import { PaintStyle } from "./PaintStyle.js";
import type { Restorable } from "./Restorable.js";
import { Shape } from "./Shape.js";
import { SnapshotRestore } from "./SnapshotRestore.js";

export class CircleShape extends Shape {
  private readonly paint = new PaintStyle();

  constructor(
    id: string,
    private cx: number,
    private cy: number,
    private radius: number,
  ) {
    super(id);
  }

  override typeName(): string {
    return "circle";
  }

  override move(dx: number, dy: number): void {
    this.cx += dx;
    this.cy += dy;
  }

  override scale(factor: number): void {
    this.cx *= factor;
    this.cy *= factor;
    this.radius *= factor;
  }

  override validateAttribute(name: string, value: string): void {
    if (name === "cx" || name === "cy" || name === "r") {
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
    if (name === "r") {
      this.radius = DecimalText.parse(value);
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
    if (name === "r") return `r=${DecimalText.format(this.radius)}`;
    if (this.paint.handles(name)) return `${name}=${this.paint.get(name) ?? ""}`;
    throw new EditorError(`error: unknown attribute: ${name}`);
  }

  override checkpoint(): Restorable {
    const cx = this.cx;
    const cy = this.cy;
    const radius = this.radius;
    const restorePaint = this.paint.capture();
    return new SnapshotRestore(() => {
      this.cx = cx;
      this.cy = cy;
      this.radius = radius;
      restorePaint();
    }, []);
  }

  override treeSummary(): string {
    return `cx=${DecimalText.format(this.cx)} cy=${DecimalText.format(this.cy)} r=${DecimalText.format(this.radius)}${this.paint.summarySuffix()}`;
  }

  override showBody(): readonly string[] {
    return [
      `  cx=${DecimalText.format(this.cx)} cy=${DecimalText.format(this.cy)} r=${DecimalText.format(this.radius)}`,
      ...this.paint.showLines(),
    ];
  }

  override geometryAttributes(): readonly Attr[] {
    return [
      new Attr("cx", DecimalText.format(this.cx)),
      new Attr("cy", DecimalText.format(this.cy)),
      new Attr("r", DecimalText.format(this.radius)),
    ];
  }

  override paintAttributes(): readonly Attr[] {
    return this.paint.attributes();
  }

  override movedText(_dx: number, _dy: number): string {
    return `circle#${this.getId()} moved to ${DecimalText.pair(this.cx, this.cy)}`;
  }

  override movedBackText(_dx: number, _dy: number): string {
    return `circle#${this.getId()} moved back to ${DecimalText.pair(this.cx, this.cy)}`;
  }
}
