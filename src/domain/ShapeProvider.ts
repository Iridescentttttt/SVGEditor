import type { RawElement } from "./RawElement.js";
import type { ReadPiece } from "./ReadPiece.js";
import type { Shape } from "./Shape.js";

/** 工厂方法：每种图形自己决定如何从参数或 SVG 元素构造实例。 */
export interface ShapeProvider {
  typeName(): string;
  matches(raw: RawElement): boolean;
  allowsChildElements(): boolean;
  create(id: string, args: readonly string[]): Shape;
  read(id: string, raw: RawElement, children: readonly Shape[]): ReadPiece;
}
