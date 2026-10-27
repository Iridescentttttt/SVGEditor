import { DecimalText } from "./DecimalText.js";
import { EditorError } from "./EditorError.js";
import type { RawElement } from "./RawElement.js";
import type { Shape } from "./Shape.js";

export class SvgFields {
  static warnings(raw: RawElement, known: readonly string[]): string[] {
    const warnings: string[] = [];
    for (const name of raw.attributeNames()) {
      if (!known.includes(name)) {
        warnings.push(`warning: ignored attribute ${name} on ${raw.getTag()}`);
      }
    }
    return warnings;
  }

  static requireNumber(raw: RawElement, id: string, name: string): number {
    const text = raw.getAttribute(name);
    if (text === undefined) {
      throw new EditorError(`error: invalid svg: ${raw.getTag()}#${id} missing ${name}`);
    }
    try {
      return DecimalText.parse(text);
    } catch {
      throw new EditorError(`error: invalid svg: ${raw.getTag()}#${id} bad ${name}`);
    }
  }

  static optionalNumber(raw: RawElement, id: string, name: string): number | null {
    const text = raw.getAttribute(name);
    if (text === undefined) return null;
    try {
      return DecimalText.parse(text);
    } catch {
      throw new EditorError(`error: invalid svg: ${raw.getTag()}#${id} bad ${name}`);
    }
  }

  static applyPaint(shape: Shape, raw: RawElement, id: string): void {
    for (const name of ["fill", "stroke", "stroke-width"]) {
      const value = raw.getAttribute(name);
      if (value === undefined) continue;
      if (name === "stroke-width") {
        SvgFields.optionalNumber(raw, id, name);
      }
      shape.setAttribute(name, value);
    }
  }
}
