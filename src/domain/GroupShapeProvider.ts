import { EditorError } from "./EditorError.js";
import { GroupShape } from "./GroupShape.js";
import type { RawElement } from "./RawElement.js";
import { ReadPiece } from "./ReadPiece.js";
import type { Shape } from "./Shape.js";
import type { ShapeProvider } from "./ShapeProvider.js";
import { SvgFields } from "./SvgFields.js";

const KNOWN = ["id"];

export class GroupShapeProvider implements ShapeProvider {
  typeName(): string {
    return "g";
  }

  matches(raw: RawElement): boolean {
    return raw.getTag() === "g";
  }

  allowsChildElements(): boolean {
    return true;
  }

  create(id: string, args: readonly string[]): Shape {
    if (args.length !== 0) {
      throw new EditorError("error: usage: create g <id>");
    }
    return new GroupShape(id);
  }

  read(id: string, raw: RawElement, children: readonly Shape[]): ReadPiece {
    const group = new GroupShape(id);
    for (const child of children) {
      group.insert(group.children().length, child);
    }
    return new ReadPiece(group, SvgFields.warnings(raw, KNOWN));
  }
}
