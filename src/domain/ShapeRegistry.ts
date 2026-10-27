import type { RawElement } from "./RawElement.js";
import type { ShapeProvider } from "./ShapeProvider.js";

export class ShapeRegistry {
  private readonly providers: ShapeProvider[] = [];

  register(provider: ShapeProvider): void {
    this.providers.push(provider);
  }

  byName(typeName: string): ShapeProvider | null {
    for (const provider of this.providers) {
      if (provider.typeName() === typeName) return provider;
    }
    return null;
  }

  match(raw: RawElement): ShapeProvider | null {
    for (let index = this.providers.length - 1; index >= 0; index -= 1) {
      const provider = this.providers[index];
      if (provider.matches(raw)) return provider;
    }
    return null;
  }
}
