import { DecimalText } from "./DecimalText.js";
import type { Shape } from "./Shape.js";
import type { SvgRoot } from "./SvgRoot.js";

export class StructureText {
  render(root: SvgRoot): string[] {
    const lines = [
      `svg (${DecimalText.format(root.getWidth())}x${DecimalText.format(root.getHeight())})`,
    ];
    this.writeChildren(root.children(), "", lines);
    return lines;
  }

  renderFocus(shape: Shape): string[] {
    const lines = [this.label(shape)];
    this.writeChildren(shape.nestedShapes(), "", lines);
    return lines;
  }

  private writeChildren(children: readonly Shape[], prefix: string, lines: string[]): void {
    children.forEach((child, index) => {
      const last = index === children.length - 1;
      const branch = last ? "└── " : "├── ";
      lines.push(`${prefix}${branch}${this.label(child)}`);
      const nested = child.nestedShapes();
      if (nested.length > 0) {
        const next = prefix + (last ? "    " : "│   ");
        this.writeChildren(nested, next, lines);
      }
    });
  }

  private label(shape: Shape): string {
    const head = `${shape.typeName()}#${shape.getId()}${shape.annotation()}`;
    const summary = shape.treeSummary();
    return summary.length === 0 ? head : `${head}  ${summary}`;
  }
}
