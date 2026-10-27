import { CircleShape } from "./CircleShape.js";
import { DecimalText } from "./DecimalText.js";
import { EditorError } from "./EditorError.js";
import type { RawElement } from "./RawElement.js";
import { ReadPiece } from "./ReadPiece.js";
import type { Shape } from "./Shape.js";
import type { ShapeProvider } from "./ShapeProvider.js";
import { SvgFields } from "./SvgFields.js";

const KNOWN = ["id", "cx", "cy", "r", "fill", "stroke", "stroke-width"];

export class CircleShapeProvider implements ShapeProvider {
  typeName(): string {
    return "circle";
  }

  matches(raw: RawElement): boolean {
    return raw.getTag() === "circle";
  }

  allowsChildElements(): boolean {
    return false;
  }

  create(id: string, args: readonly string[]): Shape {
    if (args.length !== 3 && args.length !== 4) {
      throw new EditorError("error: usage: create circle <id> <cx> <cy> <r> [fill]");
    }
    const shape = new CircleShape(
      id,
      DecimalText.parse(args[0]),
      DecimalText.parse(args[1]),
      DecimalText.parse(args[2]),
    );
    if (args.length === 4) shape.setAttribute("fill", args[3]);
    return shape;
  }

  read(id: string, raw: RawElement, children: readonly Shape[]): ReadPiece {
    if (children.length > 0) {
      throw new EditorError(`error: invalid svg: circle#${id} has unexpected children`);
    }
    const shape = new CircleShape(
      id,
      SvgFields.requireNumber(raw, id, "cx"),
      SvgFields.requireNumber(raw, id, "cy"),
      SvgFields.requireNumber(raw, id, "r"),
    );
    SvgFields.applyPaint(shape, raw, id);
    return new ReadPiece(shape, SvgFields.warnings(raw, KNOWN));
  }
}
