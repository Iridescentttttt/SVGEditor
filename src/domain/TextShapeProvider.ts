import { DecimalText } from "./DecimalText.js";
import { EditorError } from "./EditorError.js";
import type { RawElement } from "./RawElement.js";
import { ReadPiece } from "./ReadPiece.js";
import type { Shape } from "./Shape.js";
import type { ShapeProvider } from "./ShapeProvider.js";
import { SvgFields } from "./SvgFields.js";
import { TextShape } from "./TextShape.js";

const KNOWN = ["id", "x", "y", "fill", "stroke", "stroke-width"];

export class TextShapeProvider implements ShapeProvider {
  typeName(): string {
    return "text";
  }

  matches(raw: RawElement): boolean {
    return raw.getTag() === "text";
  }

  allowsChildElements(): boolean {
    return false;
  }

  create(id: string, args: readonly string[]): Shape {
    if (args.length !== 3) {
      throw new EditorError('error: usage: create text <id> <x> <y> "content"');
    }
    return new TextShape(id, DecimalText.parse(args[0]), DecimalText.parse(args[1]), args[2]);
  }

  read(id: string, raw: RawElement, children: readonly Shape[]): ReadPiece {
    if (children.length > 0) {
      throw new EditorError(`error: invalid svg: text#${id} has unexpected children`);
    }
    const shape = new TextShape(
      id,
      SvgFields.requireNumber(raw, id, "x"),
      SvgFields.requireNumber(raw, id, "y"),
      raw.getText(),
    );
    SvgFields.applyPaint(shape, raw, id);
    return new ReadPiece(shape, SvgFields.warnings(raw, KNOWN));
  }
}
