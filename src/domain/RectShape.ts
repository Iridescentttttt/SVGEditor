import { Attr } from "./Attr.js";
import { DecimalText } from "./DecimalText.js";
import { PaintedShape } from "./PaintedShape.js";

export class RectShape extends PaintedShape {
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

  protected geometryNames(): readonly string[] {
    return ["x", "y", "width", "height"];
  }

  protected readNumber(name: string): number {
    if (name === "x") return this.x;
    if (name === "y") return this.y;
    if (name === "width") return this.width;
    return this.height;
  }

  protected writeNumber(name: string, value: number): void {
    if (name === "x") this.x = value;
    else if (name === "y") this.y = value;
    else if (name === "width") this.width = value;
    else this.height = value;
  }

  protected captureNumbers(): () => void {
    const x = this.x;
    const y = this.y;
    const width = this.width;
    const height = this.height;
    return () => {
      this.x = x;
      this.y = y;
      this.width = width;
      this.height = height;
    };
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

  override treeSummary(): string {
    return `x=${DecimalText.format(this.x)} y=${DecimalText.format(this.y)} w=${DecimalText.format(this.width)} h=${DecimalText.format(this.height)}${this.paintSuffix()}`;
  }

  override showBody(): readonly string[] {
    return [
      `  x=${DecimalText.format(this.x)} y=${DecimalText.format(this.y)} width=${DecimalText.format(this.width)} height=${DecimalText.format(this.height)}`,
      ...this.paintLines(),
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

  override movedText(_dx: number, _dy: number): string {
    return `rect#${this.getId()} moved to ${DecimalText.pair(this.x, this.y)}`;
  }

  override movedBackText(_dx: number, _dy: number): string {
    return `rect#${this.getId()} moved back to ${DecimalText.pair(this.x, this.y)}`;
  }
}
