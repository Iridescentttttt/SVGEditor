import { DOMParser, type Element as XmlElement } from "@xmldom/xmldom";
import type { Document } from "../domain/Document.js";
import { EditorError } from "../domain/EditorError.js";
import { RawElement } from "../domain/RawElement.js";
import { SvgSerializer } from "../domain/SvgSerializer.js";
import type { SvgTextCodec } from "../domain/SvgTextCodec.js";

export class XmlSvgCodec implements SvgTextCodec {
  parse(text: string): RawElement {
    const errors: string[] = [];
    const parser = new DOMParser({
      onError: (level, message) => {
        if (level !== "warning") errors.push(message);
      },
    });
    const xml = parser.parseFromString(text, "image/svg+xml");
    const root = xml.documentElement;
    if (!root || errors.length > 0 || root.tagName.toLowerCase() === "parsererror") {
      throw new EditorError("error: invalid svg: unreadable xml");
    }
    return this.convert(root);
  }

  format(document: Document): string {
    return new SvgSerializer().serialize(document);
  }

  private convert(element: XmlElement): RawElement {
    const attributes = new Map<string, string>();
    for (let index = 0; index < element.attributes.length; index += 1) {
      const attr = element.attributes.item(index);
      if (attr) attributes.set(attr.name, attr.value);
    }
    const children: RawElement[] = [];
    let text = "";
    for (let index = 0; index < element.childNodes.length; index += 1) {
      const child = element.childNodes.item(index);
      if (!child) continue;
      if (child.nodeType === 1) {
        children.push(this.convert(child as XmlElement));
      } else if (child.nodeType === 3 || child.nodeType === 4) {
        text += child.nodeValue ?? "";
      }
    }
    return new RawElement(element.localName || element.tagName, attributes, text, children);
  }
}
