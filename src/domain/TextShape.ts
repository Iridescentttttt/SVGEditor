import { Attr } from "./Attr.js";
import { DecimalText } from "./DecimalText.js";
import { PaintedShape } from "./PaintedShape.js";
import { XmlText } from "./XmlText.js";

export class TextShape extends PaintedShape {
  constructor(
    id: string,
    private x: number,
    private y: number,
    private content: string,
  ) {
    super(id);
  }

  override typeName(): string {
    return "text";
  }

  override textContent(): string {
    return this.content;
  }

  protected geometryNames(): readonly string[] {
    return ["x", "y"];
  }

  protected readNumber(name: string): number {
    return name === "x" ? this.x : this.y;
  }

  protected writeNumber(name: string, value: number): void {
    if (name === "x") this.x = value;
    else this.y = value;
  }

  protected captureNumbers(): () => void {
    const x = this.x;
    const y = this.y;
    return () => {
      this.x = x;
      this.y = y;
    };
  }

  protected override handlesExtra(name: string): boolean {
    return name === "text";
  }

  protected override writeExtra(_name: string, value: string): void {
    this.content = value;
  }

  protected override formatExtra(_name: string): string {
    return `text=${XmlText.quote(this.content)}`;
  }

  protected override captureExtra(): () => void {
    const content = this.content;
    return () => {
      this.content = content;
    };
  }

  override move(dx: number, dy: number): void {
    this.x += dx;
    this.y += dy;
  }

  override scale(factor: number): void {
    this.x *= factor;
    this.y *= factor;
  }

  override treeSummary(): string {
    return `${DecimalText.pair(this.x, this.y)} ${XmlText.quote(this.content)}`;
  }

  override showBody(): readonly string[] {
    return [
      `  x=${DecimalText.format(this.x)} y=${DecimalText.format(this.y)}`,
      `  text=${XmlText.quote(this.content)}`,
      ...this.paintLines(),
    ];
  }

  override geometryAttributes(): readonly Attr[] {
    return [new Attr("x", DecimalText.format(this.x)), new Attr("y", DecimalText.format(this.y))];
  }

  override movedText(_dx: number, _dy: number): string {
    return `text#${this.getId()} moved to ${DecimalText.pair(this.x, this.y)}`;
  }

  override movedBackText(_dx: number, _dy: number): string {
    return `text#${this.getId()} moved back to ${DecimalText.pair(this.x, this.y)}`;
  }
}
