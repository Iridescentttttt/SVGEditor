export class Attr {
  constructor(
    private readonly name: string,
    private readonly value: string,
  ) {}

  getName(): string {
    return this.name;
  }

  getValue(): string {
    return this.value;
  }
}
