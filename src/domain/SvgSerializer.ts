import { DecimalText } from "./DecimalText.js";
import type { Document } from "./Document.js";
import type { Shape } from "./Shape.js";
import { XmlText } from "./XmlText.js";

export class SvgSerializer {
  serialize(document: Document): string {
    const root = document.getRoot();
    const width = DecimalText.format(root.getWidth());
    const height = DecimalText.format(root.getHeight());
    const lines = [
      `<?xml version="1.0" encoding="UTF-8"?>`,
      `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">`,
    ];
    for (const shape of root.children()) {
      lines.push(this.writeShape(shape, 1));
    }
    lines.push("</svg>");
    return `${lines.join("\n")}\n`;
  }

  private writeShape(shape: Shape, depth: number): string {
    const pad = "  ".repeat(depth);
    const parts = [`id="${XmlText.escapeAttr(shape.getId())}"`];
    for (const attr of [
      ...shape.geometryAttributes(),
      ...shape.paintAttributes(),
      ...shape.extraAttributes(),
    ]) {
      parts.push(`${attr.getName()}="${XmlText.escapeAttr(attr.getValue())}"`);
    }
    const head = parts.join(" ");
    const text = shape.textContent();
    if (text !== null) {
      return `${pad}<${shape.typeName()} ${head}>${XmlText.escapeBody(text)}</${shape.typeName()}>`;
    }
    const nested = shape.nestedShapes();
    if (nested.length === 0) {
      return `${pad}<${shape.typeName()} ${head}/>`;
    }
    const body = nested.map((child) => this.writeShape(child, depth + 1)).join("\n");
    return `${pad}<${shape.typeName()} ${head}>\n${body}\n${pad}</${shape.typeName()}>`;
  }
}
