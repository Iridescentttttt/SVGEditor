import { Attr } from "./Attr.js";
import { DecimalText } from "./DecimalText.js";
import { PaintedShape } from "./PaintedShape.js";

export class CircleShape extends PaintedShape {
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

  protected geometryNames(): readonly string[] {
    return ["cx", "cy", "r"];
  }

  protected readNumber(name: string): number {
    if (name === "cx") return this.cx;
    if (name === "cy") return this.cy;
    return this.radius;
  }

  protected writeNumber(name: string, value: number): void {
    if (name === "cx") this.cx = value;
    else if (name === "cy") this.cy = value;
    else this.radius = value;
  }

  protected captureNumbers(): () => void {
    const cx = this.cx;
    const cy = this.cy;
    const radius = this.radius;
    return () => {
      this.cx = cx;
      this.cy = cy;
      this.radius = radius;
    };
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

  override treeSummary(): string {
    return `cx=${DecimalText.format(this.cx)} cy=${DecimalText.format(this.cy)} r=${DecimalText.format(this.radius)}${this.paintSuffix()}`;
  }

  override showBody(): readonly string[] {
    return [
      `  cx=${DecimalText.format(this.cx)} cy=${DecimalText.format(this.cy)} r=${DecimalText.format(this.radius)}`,
      ...this.paintLines(),
    ];
  }

  override geometryAttributes(): readonly Attr[] {
    return [
      new Attr("cx", DecimalText.format(this.cx)),
      new Attr("cy", DecimalText.format(this.cy)),
      new Attr("r", DecimalText.format(this.radius)),
    ];
  }

  override movedText(_dx: number, _dy: number): string {
    return `circle#${this.getId()} moved to ${DecimalText.pair(this.cx, this.cy)}`;
  }

  override movedBackText(_dx: number, _dy: number): string {
    return `circle#${this.getId()} moved back to ${DecimalText.pair(this.cx, this.cy)}`;
  }
}
