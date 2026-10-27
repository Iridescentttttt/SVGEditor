import { DecimalText } from "./DecimalText.js";
import { EditorError } from "./EditorError.js";
import { LineShape } from "./LineShape.js";
import type { RawElement } from "./RawElement.js";
import { ReadPiece } from "./ReadPiece.js";
import type { Shape } from "./Shape.js";
import type { ShapeProvider } from "./ShapeProvider.js";
import { SvgFields } from "./SvgFields.js";

const KNOWN = ["id", "x1", "y1", "x2", "y2", "fill", "stroke", "stroke-width"];

export class LineShapeProvider implements ShapeProvider {
  typeName(): string {
    return "line";
  }

  matches(raw: RawElement): boolean {
    return raw.getTag() === "line";
  }

  allowsChildElements(): boolean {
    return false;
  }

  create(id: string, args: readonly string[]): Shape {
    if (args.length !== 4 && args.length !== 5) {
      throw new EditorError("error: usage: create line <id> <x1> <y1> <x2> <y2> [stroke]");
    }
    const shape = new LineShape(
      id,
      DecimalText.parse(args[0]),
      DecimalText.parse(args[1]),
      DecimalText.parse(args[2]),
      DecimalText.parse(args[3]),
    );
    if (args.length === 5) shape.setAttribute("stroke", args[4]);
    return shape;
  }

  read(id: string, raw: RawElement, children: readonly Shape[]): ReadPiece {
    if (children.length > 0) {
      throw new EditorError(`error: invalid svg: line#${id} has unexpected children`);
    }
    const shape = new LineShape(
      id,
      SvgFields.requireNumber(raw, id, "x1"),
      SvgFields.requireNumber(raw, id, "y1"),
      SvgFields.requireNumber(raw, id, "x2"),
      SvgFields.requireNumber(raw, id, "y2"),
    );
    SvgFields.applyPaint(shape, raw, id);
    return new ReadPiece(shape, SvgFields.warnings(raw, KNOWN));
  }
}
