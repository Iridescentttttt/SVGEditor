import { DecimalText } from "./DecimalText.js";
import { EditorError } from "./EditorError.js";
import { EllipseShape } from "./EllipseShape.js";
import type { RawElement } from "./RawElement.js";
import { ReadPiece } from "./ReadPiece.js";
import type { Shape } from "./Shape.js";
import type { ShapeProvider } from "./ShapeProvider.js";
import { SvgFields } from "./SvgFields.js";

const KNOWN = ["id", "cx", "cy", "rx", "ry", "fill", "stroke", "stroke-width"];

export class EllipseShapeProvider implements ShapeProvider {
  typeName(): string {
    return "ellipse";
  }

  matches(raw: RawElement): boolean {
    return raw.getTag() === "ellipse";
  }

  allowsChildElements(): boolean {
    return false;
  }

  create(id: string, args: readonly string[]): Shape {
    if (args.length !== 4 && args.length !== 5) {
      throw new EditorError("error: usage: create ellipse <id> <cx> <cy> <rx> <ry> [fill]");
    }
    const shape = new EllipseShape(
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
      throw new EditorError(`error: invalid svg: ellipse#${id} has unexpected children`);
    }
    const shape = new EllipseShape(
      id,
      SvgFields.requireNumber(raw, id, "cx"),
      SvgFields.requireNumber(raw, id, "cy"),
      SvgFields.requireNumber(raw, id, "rx"),
      SvgFields.requireNumber(raw, id, "ry"),
    );
    SvgFields.applyPaint(shape, raw, id);
    return new ReadPiece(shape, SvgFields.warnings(raw, KNOWN));
  }
}
