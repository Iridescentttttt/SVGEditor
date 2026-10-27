import { EditorError } from "./EditorError.js";
import { DecimalText } from "./DecimalText.js";
import type { RawElement } from "./RawElement.js";
import { ReadPiece } from "./ReadPiece.js";
import { RectShape } from "./RectShape.js";
import type { Shape } from "./Shape.js";
import type { ShapeProvider } from "./ShapeProvider.js";
import { SvgFields } from "./SvgFields.js";

const KNOWN = ["id", "x", "y", "width", "height", "fill", "stroke", "stroke-width"];

export class RectShapeProvider implements ShapeProvider {
  typeName(): string {
    return "rect";
  }

  matches(raw: RawElement): boolean {
    return raw.getTag() === "rect";
  }

  allowsChildElements(): boolean {
    return false;
  }

  create(id: string, args: readonly string[]): Shape {
    if (args.length !== 4 && args.length !== 5) {
      throw new EditorError("error: usage: create rect <id> <x> <y> <w> <h> [fill]");
    }
    const shape = new RectShape(
      id,
      DecimalText.parse(args[0]),
      DecimalText.parse(args[1]),
      DecimalText.parse(args[2]),
      DecimalText.parse(args[3]),
    );
    if (args.length === 5) shape.setAttribute("fill", args[4]);
    return shape;
  }

  read(id: string, raw: RawElement, children: readonly Shape[]): ReadPiece {
    if (children.length > 0) {
      throw new EditorError(`error: invalid svg: rect#${id} has unexpected children`);
    }
    const shape = new RectShape(
      id,
      SvgFields.requireNumber(raw, id, "x"),
      SvgFields.requireNumber(raw, id, "y"),
      SvgFields.requireNumber(raw, id, "width"),
      SvgFields.requireNumber(raw, id, "height"),
    );
    SvgFields.applyPaint(shape, raw, id);
    return new ReadPiece(shape, SvgFields.warnings(raw, KNOWN));
  }
}
