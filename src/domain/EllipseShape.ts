import { Attr } from "./Attr.js";
import { DecimalText } from "./DecimalText.js";
import { PaintedShape } from "./PaintedShape.js";

export class EllipseShape extends PaintedShape {
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

  protected geometryNames(): readonly string[] {
    return ["cx", "cy", "rx", "ry"];
  }

  protected readNumber(name: string): number {
    if (name === "cx") return this.cx;
    if (name === "cy") return this.cy;
    if (name === "rx") return this.rx;
    return this.ry;
  }

  protected writeNumber(name: string, value: number): void {
    if (name === "cx") this.cx = value;
    else if (name === "cy") this.cy = value;
    else if (name === "rx") this.rx = value;
    else this.ry = value;
  }

  protected captureNumbers(): () => void {
    const cx = this.cx;
    const cy = this.cy;
    const rx = this.rx;
    const ry = this.ry;
    return () => {
      this.cx = cx;
      this.cy = cy;
      this.rx = rx;
      this.ry = ry;
    };
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

  override treeSummary(): string {
    return `cx=${DecimalText.format(this.cx)} cy=${DecimalText.format(this.cy)} rx=${DecimalText.format(this.rx)} ry=${DecimalText.format(this.ry)}${this.paintSuffix()}`;
  }

  override showBody(): readonly string[] {
    return [
      `  cx=${DecimalText.format(this.cx)} cy=${DecimalText.format(this.cy)} rx=${DecimalText.format(this.rx)} ry=${DecimalText.format(this.ry)}`,
      ...this.paintLines(),
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

  override movedText(_dx: number, _dy: number): string {
    return `ellipse#${this.getId()} moved to ${DecimalText.pair(this.cx, this.cy)}`;
  }

  override movedBackText(_dx: number, _dy: number): string {
    return `ellipse#${this.getId()} moved back to ${DecimalText.pair(this.cx, this.cy)}`;
  }
}
