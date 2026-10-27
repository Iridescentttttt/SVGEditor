import type { RawElement } from "./RawElement.js";
import type { ReadPiece } from "./ReadPiece.js";
import type { Shape } from "./Shape.js";

export interface ShapeProvider {
  typeName(): string;
  matches(raw: RawElement): boolean;
  allowsChildElements(): boolean;
  create(id: string, args: readonly string[]): Shape;
  read(id: string, raw: RawElement, children: readonly Shape[]): ReadPiece;
}
