import type { Document } from "./Document.js";
import type { RawElement } from "./RawElement.js";

export interface SvgTextCodec {
  parse(text: string): RawElement;
  format(document: Document): string;
}
