export class UngroupPolicy {
  private constructor() {}

  static readonly allowed = new UngroupPolicy();
  static readonly composite = new UngroupPolicy();
  static readonly notContainer = new UngroupPolicy();

  isComposite(): boolean {
    return this === UngroupPolicy.composite;
  }

  isNotContainer(): boolean {
    return this === UngroupPolicy.notContainer;
  }
}
