export class RawElement {
  constructor(
    private readonly tag: string,
    private readonly attributes: ReadonlyMap<string, string>,
    private readonly text: string,
    private readonly children: readonly RawElement[],
  ) {}

  getTag(): string {
    return this.tag;
  }

  getAttribute(name: string): string | undefined {
    return this.attributes.get(name);
  }

  attributeNames(): readonly string[] {
    return [...this.attributes.keys()];
  }

  getText(): string {
    return this.text;
  }

  getChildren(): readonly RawElement[] {
    return this.children;
  }
}
