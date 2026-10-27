import { DecimalText } from "./DecimalText.js";
import { EditorError } from "./EditorError.js";
import { EditResult } from "./EditResult.js";
import { GroupShape } from "./GroupShape.js";
import type { Shape } from "./Shape.js";
import type { ShapeContainer } from "./ShapeContainer.js";
import { SnapshotRestore } from "./SnapshotRestore.js";
import { StructureText } from "./StructureText.js";
import { SvgRoot } from "./SvgRoot.js";

export class Document {
  private readonly index = new Map<string, Shape>();

  private constructor(private readonly root: SvgRoot) {}

  static empty(width: number, height: number): Document {
    return new Document(new SvgRoot(width, height));
  }

  getRoot(): SvgRoot {
    return this.root;
  }

  elementCount(): number {
    return this.index.size;
  }

  hasId(id: string): boolean {
    return this.index.has(id);
  }

  resize(width: number, height: number): void {
    this.root.resize(width, height);
  }

  tree(id: string | null): readonly string[] {
    const view = new StructureText();
    if (id === null) return view.render(this.root);
    return view.renderFocus(this.requireShape(id));
  }

  show(id: string): readonly string[] {
    const shape = this.requireShape(id);
    const parent = shape.getParent();
    const label = parent === null ? "svg" : (this.containerRef(parent) ?? "svg");
    return shape.showText(label).split("\n");
  }

  requireContainer(id: string): ShapeContainer {
    const shape = this.index.get(id);
    if (!shape) throw new EditorError(`error: no such container: ${id}`);
    const container = shape.asContainer();
    if (!container) throw new EditorError(`error: not a container: ${id}`);
    return container;
  }

  attachLoaded(shape: Shape): void {
    this.root.insert(this.root.children().length, shape);
    this.indexSubtree(shape);
  }

  attachNew(shape: Shape, parent: ShapeContainer): EditResult {
    if (this.index.has(shape.getId())) {
      throw new EditorError(`error: id already exists: ${shape.getId()}`);
    }
    const where = this.containerRef(parent);
    parent.insert(parent.children().length, shape);
    this.indexSubtree(shape);
    const created =
      where === null
        ? `${shape.typeName()}#${shape.getId()} created`
        : `${shape.typeName()}#${shape.getId()} created in ${where}`;
    const removed = `${shape.typeName()}#${shape.getId()} removed`;
    return new EditResult(
      [created],
      new SnapshotRestore(() => {
        parent.remove(shape);
        this.unindexSubtree(shape);
      }, [removed]),
    );
  }

  delete(id: string): EditResult {
    const shape = this.requireShape(id);
    const parent = this.requireParent(shape);
    const index = parent.children().indexOf(shape);
    const into = this.containerRef(parent) ?? "svg";
    parent.remove(shape);
    this.unindexSubtree(shape);
    return new EditResult(
      [`${shape.typeName()}#${shape.getId()} deleted`],
      new SnapshotRestore(() => {
        parent.insert(index, shape);
        this.indexSubtree(shape);
      }, [`${shape.typeName()}#${shape.getId()} restored into ${into}`]),
    );
  }

  move(id: string, dx: number, dy: number): EditResult {
    const shape = this.requireShape(id);
    const checkpoint = shape.checkpoint();
    const back = shape.movedBackText(dx, dy);
    shape.move(dx, dy);
    return new EditResult(
      [shape.movedText(dx, dy)],
      new SnapshotRestore(() => {
        checkpoint.restore();
      }, [back]),
    );
  }

  scale(id: string, factor: number): EditResult {
    if (!(factor > 0)) {
      throw new EditorError("error: scale factor must be positive");
    }
    const shape = this.requireShape(id);
    const checkpoint = shape.checkpoint();
    shape.scale(factor);
    const label = `${shape.typeName()}#${shape.getId()}`;
    return new EditResult(
      [`${label} scaled by ${DecimalText.format(factor)}`],
      new SnapshotRestore(() => {
        checkpoint.restore();
      }, [`${label} scale restored`]),
    );
  }

  setAttribute(id: string, name: string, value: string): EditResult {
    const shape = this.requireShape(id);
    shape.validateAttribute(name, value);
    const previous = shape.formatAssignment(name);
    const checkpoint = shape.checkpoint();
    shape.setAttribute(name, value);
    const label = `${shape.typeName()}#${shape.getId()}`;
    return new EditResult(
      [`${label} updated: ${shape.formatAssignment(name)}`],
      new SnapshotRestore(() => {
        checkpoint.restore();
      }, [`${label} updated: ${previous}`]),
    );
  }

  group(newId: string, memberIds: readonly string[]): EditResult {
    if (this.index.has(newId)) {
      throw new EditorError(`error: id already exists: ${newId}`);
    }
    if (memberIds.length < 2) {
      throw new EditorError("error: usage: group <newGid> <id1> <id2>…");
    }
    const seen = new Set<string>();
    for (const id of memberIds) {
      if (seen.has(id)) throw new EditorError(`error: duplicate id in arguments: ${id}`);
      seen.add(id);
    }
    const members = memberIds.map((id) => this.requireShape(id));
    for (let outer = 0; outer < members.length; outer += 1) {
      for (let inner = 0; inner < members.length; inner += 1) {
        if (outer !== inner && this.isAncestor(members[outer], members[inner])) {
          throw new EditorError(
            `error: cannot group a container into its own descendant: ${members[outer].getId()}`,
          );
        }
      }
    }
    const order = this.preorder().filter((shape) => seen.has(shape.getId()));
    const anchor = order[0];
    const anchorParent = this.requireParent(anchor);
    const anchorIndex = anchorParent.children().indexOf(anchor);
    const snapshots = new Map<ShapeContainer, readonly Shape[]>();
    for (const shape of order) {
      const parent = this.requireParent(shape);
      if (!snapshots.has(parent)) snapshots.set(parent, [...parent.children()]);
    }
    for (const shape of order) {
      this.requireParent(shape).remove(shape);
    }
    const group = new GroupShape(newId);
    anchorParent.insert(anchorIndex, group);
    for (const shape of order) {
      group.insert(group.children().length, shape);
    }
    this.index.set(newId, group);
    return new EditResult(
      [`g#${newId} created with ${order.length} children`],
      new SnapshotRestore(() => {
        for (const shape of [...group.nestedShapes()]) group.remove(shape);
        anchorParent.remove(group);
        this.index.delete(newId);
        for (const [parent, children] of snapshots) {
          this.replaceChildren(parent, children);
        }
      }, [`g#${newId} ungrouped`]),
    );
  }

  ungroup(id: string): EditResult {
    const shape = this.requireShape(id);
    const container = shape.asContainer();
    if (container === null || shape.ungroupPolicy().isNotContainer()) {
      throw new EditorError(`error: not a container: ${id}`);
    }
    if (shape.ungroupPolicy().isComposite()) {
      throw new EditorError(`error: cannot ungroup composite shape: ${id}`);
    }
    const parent = this.requireParent(shape);
    if (parent.owningShape() === null) {
      throw new EditorError(`error: cannot ungroup top-level container: ${id}`);
    }
    const index = parent.children().indexOf(shape);
    const kids = [...container.children()];
    parent.remove(shape);
    this.index.delete(shape.getId());
    for (const kid of kids) container.remove(kid);
    for (let offset = 0; offset < kids.length; offset += 1) {
      parent.insert(index + offset, kids[offset]);
    }
    return new EditResult(
      [`g#${id} ungrouped`],
      new SnapshotRestore(() => {
        for (const kid of [...kids].reverse()) parent.remove(kid);
        parent.insert(index, shape);
        for (const kid of kids) container.insert(container.children().length, kid);
        this.index.set(shape.getId(), shape);
      }, [`g#${id} regrouped with ${kids.length} children`]),
    );
  }

  addTo(containerId: string, id: string): EditResult {
    const containerShape = this.index.get(containerId);
    if (!containerShape) throw new EditorError(`error: no such shape: ${containerId}`);
    const container = containerShape.asContainer();
    if (!container) throw new EditorError(`error: not a container: ${containerId}`);
    const shape = this.requireShape(id);
    if (shape === containerShape || this.isAncestor(shape, containerShape)) {
      throw new EditorError(`error: cannot move a container into its own descendant: ${id}`);
    }
    const oldParent = this.requireParent(shape);
    const oldIndex = oldParent.children().indexOf(shape);
    const oldLabel = this.containerRef(oldParent) ?? "svg";
    oldParent.remove(shape);
    container.insert(container.children().length, shape);
    const name = `${shape.typeName()}#${shape.getId()}`;
    return new EditResult(
      [`${name} added to g#${containerId}`],
      new SnapshotRestore(() => {
        container.remove(shape);
        oldParent.insert(oldIndex, shape);
      }, [`${name} returned to ${oldLabel}`]),
    );
  }

  bringToFront(id: string): EditResult {
    return this.reorder(id, true);
  }

  sendToBack(id: string): EditResult {
    return this.reorder(id, false);
  }

  private reorder(id: string, front: boolean): EditResult {
    const shape = this.requireShape(id);
    const parent = this.requireParent(shape);
    const oldIndex = parent.children().indexOf(shape);
    parent.remove(shape);
    parent.insert(front ? parent.children().length : 0, shape);
    const name = `${shape.typeName()}#${shape.getId()}`;
    const line = front ? `${name} brought to front` : `${name} sent to back`;
    return new EditResult(
      [line],
      new SnapshotRestore(() => {
        parent.remove(shape);
        parent.insert(oldIndex, shape);
      }, [`${name} z-order restored`]),
    );
  }

  private requireShape(id: string): Shape {
    const shape = this.index.get(id);
    if (!shape) throw new EditorError(`error: no such shape: ${id}`);
    return shape;
  }

  private requireParent(shape: Shape): ShapeContainer {
    const parent = shape.getParent();
    if (parent === null) throw new Error(`shape ${shape.getId()} has no parent`);
    return parent;
  }

  private containerRef(container: ShapeContainer): string | null {
    const owner = container.owningShape();
    if (owner === null) return null;
    return `g#${owner.getId()}`;
  }

  private isAncestor(ancestor: Shape, node: Shape): boolean {
    let container = node.getParent();
    while (container !== null) {
      const owner = container.owningShape();
      if (owner === null) return false;
      if (owner === ancestor) return true;
      container = owner.getParent();
    }
    return false;
  }

  private preorder(): Shape[] {
    const shapes: Shape[] = [];
    const walk = (container: ShapeContainer): void => {
      for (const child of container.children()) {
        shapes.push(child);
        const nested = child.asContainer();
        if (nested) walk(nested);
      }
    };
    walk(this.root);
    return shapes;
  }

  private indexSubtree(shape: Shape): void {
    const all: Shape[] = [];
    shape.collectSelfAndDescendants(all);
    for (const item of all) {
      if (this.index.has(item.getId())) {
        throw new EditorError(`error: id already exists: ${item.getId()}`);
      }
      this.index.set(item.getId(), item);
    }
  }

  private unindexSubtree(shape: Shape): void {
    const all: Shape[] = [];
    shape.collectSelfAndDescendants(all);
    for (const item of all) this.index.delete(item.getId());
  }

  private replaceChildren(parent: ShapeContainer, children: readonly Shape[]): void {
    for (const child of [...parent.children()]) parent.remove(child);
    for (const child of children) parent.insert(parent.children().length, child);
  }
}
