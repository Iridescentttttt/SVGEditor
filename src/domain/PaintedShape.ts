import type { Attr } from "./Attr.js";
import { DecimalText } from "./DecimalText.js";
import { EditorError } from "./EditorError.js";
import { PaintStyle } from "./PaintStyle.js";
import type { Restorable } from "./Restorable.js";
import { Shape } from "./Shape.js";
import { ShapeMemento } from "./ShapeMemento.js";

/**
 * 模板方法：校验、赋值、回显和备忘录的步骤固定。
 * 子类只提供几何字段怎么读、怎么写、怎么拍快照。
 */
export abstract class PaintedShape extends Shape {
  private readonly paint = new PaintStyle();

  protected constructor(id: string) {
    super(id);
  }

  protected abstract geometryNames(): readonly string[];

  protected abstract readNumber(name: string): number;

  protected abstract writeNumber(name: string, value: number): void;

  protected abstract captureNumbers(): () => void;

  protected handlesExtra(name: string): boolean {
    void name;
    return false;
  }

  protected validateExtra(name: string, value: string): void {
    void name;
    void value;
  }

  protected writeExtra(name: string, value: string): void {
    void name;
    void value;
  }

  protected formatExtra(name: string): string {
    return name;
  }

  protected captureExtra(): () => void {
    return () => undefined;
  }

  override validateAttribute(name: string, value: string): void {
    if (this.geometryNames().includes(name)) {
      DecimalText.parse(value);
      return;
    }
    if (this.handlesExtra(name)) {
      this.validateExtra(name, value);
      return;
    }
    if (this.paint.handles(name)) {
      this.paint.validate(name, value);
      return;
    }
    throw new EditorError(`error: unknown attribute: ${name}`);
  }

  override setAttribute(name: string, value: string): void {
    if (this.geometryNames().includes(name)) {
      this.writeNumber(name, DecimalText.parse(value));
      return;
    }
    if (this.handlesExtra(name)) {
      this.writeExtra(name, value);
      return;
    }
    if (this.paint.handles(name)) {
      this.paint.set(name, value);
      return;
    }
    throw new EditorError(`error: unknown attribute: ${name}`);
  }

  override formatAssignment(name: string): string {
    if (this.geometryNames().includes(name)) {
      return `${name}=${DecimalText.format(this.readNumber(name))}`;
    }
    if (this.handlesExtra(name)) return this.formatExtra(name);
    if (this.paint.handles(name)) return `${name}=${this.paint.get(name) ?? ""}`;
    throw new EditorError(`error: unknown attribute: ${name}`);
  }

  override checkpoint(): Restorable {
    const restoreNumbers = this.captureNumbers();
    const restoreExtra = this.captureExtra();
    const restorePaint = this.paint.capture();
    return new ShapeMemento(() => {
      restoreNumbers();
      restoreExtra();
      restorePaint();
    });
  }

  override paintAttributes(): readonly Attr[] {
    return this.paint.attributes();
  }

  protected paintSuffix(): string {
    return this.paint.summarySuffix();
  }

  protected paintLines(): readonly string[] {
    return this.paint.showLines();
  }
}
