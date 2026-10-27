export class Line {
  private constructor(
    private readonly kind: "ignore" | "command",
    private readonly tokens: readonly string[],
  ) {}

  static ignore(): Line {
    return new Line("ignore", []);
  }

  static command(tokens: readonly string[]): Line {
    return new Line("command", tokens);
  }

  isIgnorable(): boolean {
    return this.kind === "ignore";
  }

  getTokens(): readonly string[] {
    return this.tokens;
  }
}
