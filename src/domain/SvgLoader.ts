import { DecimalText } from "./DecimalText.js";
import { Document } from "./Document.js";
import { EditorError } from "./EditorError.js";
import { LoadResult } from "./LoadResult.js";
import type { RawElement } from "./RawElement.js";
import type { Shape } from "./Shape.js";
import type { ShapeRegistry } from "./ShapeRegistry.js";

class LoadIds {
  private readonly taken = new Set<string>();

  isTaken(id: string): boolean {
    return this.taken.has(id);
  }

  reserve(id: string): void {
    this.taken.add(id);
  }

  allocate(tag: string): { id: string; warning: string } {
    let number = 1;
    while (this.taken.has(`${tag}${number}`)) number += 1;
    const id = `${tag}${number}`;
    this.taken.add(id);
    return { id, warning: `warning: assigned id ${id} to unnamed <${tag}>` };
  }
}

export class SvgLoader {
  constructor(private readonly registry: ShapeRegistry) {}

  load(raw: RawElement): LoadResult {
    if (raw.getTag() !== "svg") {
      throw new EditorError("error: invalid svg: root is not svg");
    }
    const warnings: string[] = [];
    for (const name of raw.attributeNames()) {
      if (!["xmlns", "width", "height", "viewBox"].includes(name)) {
        warnings.push(`warning: ignored attribute ${name} on svg`);
      }
    }
    const width = this.rootNumber(raw, "width");
    const height = this.rootNumber(raw, "height");
    if (!(width > 0) || !(height > 0)) {
      throw new EditorError("error: invalid svg: canvas size must be positive");
    }
    const viewBox = raw.getAttribute("viewBox");
    if (viewBox !== undefined && !this.viewBoxMatches(viewBox, width, height)) {
      warnings.push("warning: ignored attribute viewBox on svg");
    }
    const document = Document.empty(width, height);
    const ids = new LoadIds();
    for (const child of raw.getChildren()) {
      document.attachLoaded(this.materialize(child, ids, warnings));
    }
    return new LoadResult(document, warnings);
  }

  private materialize(raw: RawElement, ids: LoadIds, warnings: string[]): Shape {
    const provider = this.registry.match(raw);
    if (!provider) {
      throw new EditorError(`error: unknown shape type: ${raw.getTag()} (is the plugin loaded?)`);
    }
    const id = this.takeId(raw, ids, warnings);
    const children: Shape[] = [];
    if (provider.allowsChildElements()) {
      for (const child of raw.getChildren()) {
        children.push(this.materialize(child, ids, warnings));
      }
    } else if (raw.getChildren().length > 0) {
      throw new EditorError(`error: invalid svg: ${raw.getTag()}#${id} has unexpected children`);
    }
    const piece = provider.read(id, raw, children);
    warnings.push(...piece.getWarnings());
    return piece.getShape();
  }

  private takeId(raw: RawElement, ids: LoadIds, warnings: string[]): string {
    const existing = raw.getAttribute("id");
    if (existing !== undefined && existing !== "") {
      if (ids.isTaken(existing)) {
        throw new EditorError(`error: id already exists: ${existing}`);
      }
      ids.reserve(existing);
      return existing;
    }
    const allocated = ids.allocate(raw.getTag());
    warnings.push(allocated.warning);
    return allocated.id;
  }

  private rootNumber(raw: RawElement, name: string): number {
    const text = raw.getAttribute(name);
    if (text === undefined) throw new EditorError(`error: invalid svg: svg missing ${name}`);
    try {
      return DecimalText.parse(text);
    } catch {
      throw new EditorError(`error: invalid svg: svg bad ${name}`);
    }
  }

  private viewBoxMatches(viewBox: string, width: number, height: number): boolean {
    const parts = viewBox.trim().split(/[\s,]+/);
    if (parts.length !== 4) return false;
    try {
      const values = parts.map((part) => DecimalText.parse(part));
      return (
        Math.abs(values[0]) <= 1e-9 &&
        Math.abs(values[1]) <= 1e-9 &&
        Math.abs(values[2] - width) <= 1e-9 &&
        Math.abs(values[3] - height) <= 1e-9
      );
    } catch {
      return false;
    }
  }
}
