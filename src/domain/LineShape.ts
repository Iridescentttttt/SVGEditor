import { Attr } from "./Attr.js";
import { DecimalText } from "./DecimalText.js";
import { PaintedShape } from "./PaintedShape.js";

export class LineShape extends PaintedShape {
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

  protected geometryNames(): readonly string[] {
    return ["x1", "y1", "x2", "y2"];
  }

  protected readNumber(name: string): number {
    if (name === "x1") return this.x1;
    if (name === "y1") return this.y1;
    if (name === "x2") return this.x2;
    return this.y2;
  }

  protected writeNumber(name: string, value: number): void {
    if (name === "x1") this.x1 = value;
    else if (name === "y1") this.y1 = value;
    else if (name === "x2") this.x2 = value;
    else this.y2 = value;
  }

  protected captureNumbers(): () => void {
    const x1 = this.x1;
    const y1 = this.y1;
    const x2 = this.x2;
    const y2 = this.y2;
    return () => {
      this.x1 = x1;
      this.y1 = y1;
      this.x2 = x2;
      this.y2 = y2;
    };
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

  override treeSummary(): string {
    return `${DecimalText.pair(this.x1, this.y1)} -> ${DecimalText.pair(this.x2, this.y2)}`;
  }

  override showBody(): readonly string[] {
    return [
      `  x1=${DecimalText.format(this.x1)} y1=${DecimalText.format(this.y1)} x2=${DecimalText.format(this.x2)} y2=${DecimalText.format(this.y2)}`,
      ...this.paintLines(),
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

  override movedText(_dx: number, _dy: number): string {
    return `line#${this.getId()} moved to ${DecimalText.pair(this.x1, this.y1)} -> ${DecimalText.pair(this.x2, this.y2)}`;
  }

  override movedBackText(_dx: number, _dy: number): string {
    return `line#${this.getId()} moved back to ${DecimalText.pair(this.x1, this.y1)} -> ${DecimalText.pair(this.x2, this.y2)}`;
  }
}
