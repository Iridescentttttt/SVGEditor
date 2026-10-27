import { Attr } from "./Attr.js";
import { DecimalText } from "./DecimalText.js";
import { EditorError } from "./EditorError.js";

export class PaintStyle {
  private fill: string | null = null;
  private stroke: string | null = null;
  private strokeWidth: string | null = null;

  handles(name: string): boolean {
    return name === "fill" || name === "stroke" || name === "stroke-width";
  }

  validate(name: string, value: string): void {
    if (name === "stroke-width") {
      DecimalText.parse(value);
      return;
    }
    if (name === "fill" || name === "stroke") {
      return;
    }
    throw new EditorError(`error: unknown attribute: ${name}`);
  }

  set(name: string, value: string): void {
    this.validate(name, value);
    if (name === "fill") {
      this.fill = value;
      return;
    }
    if (name === "stroke") {
      this.stroke = value;
      return;
    }
    this.strokeWidth = DecimalText.format(DecimalText.parse(value));
  }

  get(name: string): string | null {
    if (name === "fill") return this.fill;
    if (name === "stroke") return this.stroke;
    if (name === "stroke-width") return this.strokeWidth;
    return null;
  }

  attributes(): readonly Attr[] {
    const attrs: Attr[] = [];
    if (this.fill !== null) attrs.push(new Attr("fill", this.fill));
    if (this.stroke !== null) attrs.push(new Attr("stroke", this.stroke));
    if (this.strokeWidth !== null) attrs.push(new Attr("stroke-width", this.strokeWidth));
    return attrs;
  }

  summarySuffix(): string {
    const parts: string[] = [];
    if (this.fill !== null) parts.push(`fill=${this.fill}`);
    if (this.stroke !== null) parts.push(`stroke=${this.stroke}`);
    if (this.strokeWidth !== null) parts.push(`stroke-width=${this.strokeWidth}`);
    return parts.length === 0 ? "" : ` ${parts.join(" ")}`;
  }

  showLines(): readonly string[] {
    return this.attributes().map((attr) => `  ${attr.getName()}=${attr.getValue()}`);
  }

  capture(): () => void {
    const fill = this.fill;
    const stroke = this.stroke;
    const strokeWidth = this.strokeWidth;
    return () => {
      this.fill = fill;
      this.stroke = stroke;
      this.strokeWidth = strokeWidth;
    };
  }
}
