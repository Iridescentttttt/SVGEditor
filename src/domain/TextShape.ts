import { Attr } from "./Attr.js";
import { DecimalText } from "./DecimalText.js";
import { EditorError } from "./EditorError.js";
import { PaintStyle } from "./PaintStyle.js";
import type { Restorable } from "./Restorable.js";
import { Shape } from "./Shape.js";
import { SnapshotRestore } from "./SnapshotRestore.js";
import { XmlText } from "./XmlText.js";

export class TextShape extends Shape {
  private readonly paint = new PaintStyle();

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

  override move(dx: number, dy: number): void {
    this.x += dx;
    this.y += dy;
  }

  override scale(factor: number): void {
    this.x *= factor;
    this.y *= factor;
  }

  override validateAttribute(name: string, value: string): void {
    if (name === "x" || name === "y") {
      DecimalText.parse(value);
      return;
    }
    if (name === "text") {
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
    if (name === "text") {
      this.content = value;
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
    if (name === "text") return `text=${XmlText.quote(this.content)}`;
    if (this.paint.handles(name)) return `${name}=${this.paint.get(name) ?? ""}`;
    throw new EditorError(`error: unknown attribute: ${name}`);
  }

  override checkpoint(): Restorable {
    const x = this.x;
    const y = this.y;
    const content = this.content;
    const restorePaint = this.paint.capture();
    return new SnapshotRestore(() => {
      this.x = x;
      this.y = y;
      this.content = content;
      restorePaint();
    }, []);
  }

  override treeSummary(): string {
    return `${DecimalText.pair(this.x, this.y)} ${XmlText.quote(this.content)}`;
  }

  override showBody(): readonly string[] {
    return [
      `  x=${DecimalText.format(this.x)} y=${DecimalText.format(this.y)}`,
      `  text=${XmlText.quote(this.content)}`,
      ...this.paint.showLines(),
    ];
  }

  override geometryAttributes(): readonly Attr[] {
    return [new Attr("x", DecimalText.format(this.x)), new Attr("y", DecimalText.format(this.y))];
  }

  override paintAttributes(): readonly Attr[] {
    return this.paint.attributes();
  }

  override movedText(_dx: number, _dy: number): string {
    return `text#${this.getId()} moved to ${DecimalText.pair(this.x, this.y)}`;
  }

  override movedBackText(_dx: number, _dy: number): string {
    return `text#${this.getId()} moved back to ${DecimalText.pair(this.x, this.y)}`;
  }
}
