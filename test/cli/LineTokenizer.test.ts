import { describe, expect, it } from "vitest";
import { LineTokenizer } from "../../src/cli/LineTokenizer.js";
import { TokenError } from "../../src/cli/TokenError.js";

describe("LineTokenizer", () => {
  const tokenizer = new LineTokenizer();

  it("ignores blank lines and whole-line comments", () => {
    expect(tokenizer.tokenize("   ").isIgnorable()).toBe(true);
    expect(tokenizer.tokenize("# this is a comment").isIgnorable()).toBe(true);
  });

  it("keeps quoted text and hash colors as arguments", () => {
    expect(tokenizer.tokenize('create text title 20 40 "My Diagram"').getTokens()).toEqual([
      "create",
      "text",
      "title",
      "20",
      "40",
      "My Diagram",
    ]);
    expect(tokenizer.tokenize("create rect bg 0 0 10 10 #ffffff").getTokens().at(-1)).toBe("#ffffff");
  });

  it("unescapes quotes inside strings", () => {
    expect(tokenizer.tokenize('set t text "say \\"hi\\""').getTokens().at(-1)).toBe('say "hi"');
  });

  it("rejects an unclosed quote", () => {
    expect(() => tokenizer.tokenize('create text t 0 0 "oops')).toThrow(TokenError);
  });
});
